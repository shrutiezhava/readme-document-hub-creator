
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Payslip, PayslipFormData } from '../types/payslip';
import { supabase } from '@/integrations/supabase/client';
import EmployeeCustomFields from './EmployeeCustomFields';

interface PayslipFormProps {
  payslip?: Payslip | null;
  employeeProfiles: any[]; // This is no longer used but kept for compatibility
  onSubmit: (payslip: PayslipFormData | Payslip) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

const PayslipForm: React.FC<PayslipFormProps> = ({ payslip, employeeProfiles, onSubmit, onClose, isSubmitting = false }) => {
  const [formData, setFormData] = useState<PayslipFormData>({
    employee_name: '',
    employee_id: '',
    designation: '',
    department: '',
    pay_period: '',
    basic_salary: 0,
    hra: 0,
    transport_allowance: 0,
    medical_allowance: 0,
    other_allowances: 0,
    pf_deduction: 0,
    tax_deduction: 0,
    insurance_deduction: 0,
    other_deductions: 0,
    net_salary: 0,
    company_name: 'RV Associates',
    company_address: 'Aarya Exotica, opposite KD-10, Bil, Vadodara 391410',
  });

  const [workDetails, setWorkDetails] = useState({
    days_worked: 0,
    hours_per_day: 0,
    hourly_rate: 0,
  });

  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    if (payslip) {
      setFormData({
        employee_name: payslip.employee_name,
        employee_id: payslip.employee_id,
        designation: payslip.designation,
        department: payslip.department,
        pay_period: payslip.pay_period,
        basic_salary: payslip.basic_salary,
        hra: payslip.hra,
        transport_allowance: payslip.transport_allowance,
        medical_allowance: payslip.medical_allowance,
        other_allowances: payslip.other_allowances,
        pf_deduction: payslip.pf_deduction,
        tax_deduction: payslip.tax_deduction,
        insurance_deduction: payslip.insurance_deduction,
        other_deductions: payslip.other_deductions,
        net_salary: payslip.net_salary,
        company_name: payslip.company_name,
        company_address: payslip.company_address,
      });
    }
  }, [payslip]);

  // Load employee data from payroll_data if available
  const handleEmployeeIdChange = async (employeeId: string) => {
    setFormData(prev => ({ ...prev, employee_id: employeeId }));
    
    if (employeeId.trim()) {
      await loadEmployeeDataFromPayroll(employeeId.trim());
    }
  };

  // Load employee data from payroll_data table
  const loadEmployeeDataFromPayroll = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('payroll_data')
        .select('*')
        .ilike('data_json->>employee_id', employeeId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading employee data:', error);
        return;
      }

      if (data && data.data_json) {
        // Properly cast the JSON data to ensure it's an object with the expected properties
        const employeeData = data.data_json as Record<string, any>;
        
        // Check if the data is actually an object before accessing properties
        if (typeof employeeData === 'object' && employeeData !== null && !Array.isArray(employeeData)) {
          setFormData(prev => ({
            ...prev,
            employee_name: String(employeeData.employee_name || ''),
            designation: String(employeeData.designation || ''),
            department: String(employeeData.department || ''),
            basic_salary: parseFloat(String(employeeData.basic_salary)) || 0,
            hra: parseFloat(String(employeeData.hra)) || 0,
            transport_allowance: parseFloat(String(employeeData.transport_allowance)) || 0,
            medical_allowance: parseFloat(String(employeeData.medical_allowance)) || 0,
            other_allowances: parseFloat(String(employeeData.other_allowances)) || 0,
            pf_deduction: parseFloat(String(employeeData.pf_deduction)) || 0,
            tax_deduction: parseFloat(String(employeeData.tax_deduction)) || 0,
            insurance_deduction: parseFloat(String(employeeData.insurance_deduction)) || 0,
            other_deductions: parseFloat(String(employeeData.other_deductions)) || 0,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
    }
  };

  // Calculate basic salary based on days and hours worked
  const calculateBasicSalary = () => {
    const totalHours = workDetails.days_worked * workDetails.hours_per_day;
    return totalHours * workDetails.hourly_rate;
  };

  // Auto-calculate allowances and deductions based on basic salary
  const calculateAllowances = (basicSalary: number) => {
    const hra = basicSalary * 0.4; // 40% of basic salary
    const transport = 2000; // Fixed transport allowance
    const medical = 1500; // Fixed medical allowance
    const other = basicSalary * 0.05; // 5% of basic salary

    return { hra, transport, medical, other };
  };

  const calculateDeductions = (basicSalary: number) => {
    const pf = basicSalary * 0.12; // 12% EPF
    const tax = basicSalary * 0.1; // 10% TDS (simplified)
    const esi = basicSalary * 0.0175; // 1.75% ESI
    const other = 0; // No other deductions

    return { pf, tax, esi, other };
  };

  // Update salary calculation when work details change
  useEffect(() => {
    if (workDetails.days_worked > 0 && workDetails.hours_per_day > 0 && workDetails.hourly_rate > 0) {
      const basicSalary = calculateBasicSalary();
      const allowances = calculateAllowances(basicSalary);
      const deductions = calculateDeductions(basicSalary);

      setFormData(prev => ({
        ...prev,
        basic_salary: basicSalary,
        hra: allowances.hra,
        transport_allowance: allowances.transport,
        medical_allowance: allowances.medical,
        other_allowances: allowances.other,
        pf_deduction: deductions.pf,
        tax_deduction: deductions.tax,
        insurance_deduction: deductions.esi,
        other_deductions: deductions.other,
      }));
    }
  }, [workDetails]);

  const calculateNetSalary = () => {
    const allowances = formData.hra + formData.transport_allowance + formData.medical_allowance + formData.other_allowances;
    const deductions = formData.pf_deduction + formData.tax_deduction + formData.insurance_deduction + formData.other_deductions;
    
    return formData.basic_salary + allowances - deductions;
  };

  const handleCustomFieldsChange = (allowances: any[], deductions: any[]) => {
    // Since we're using flexible payroll, custom fields are handled through Excel uploads
    console.log('Custom fields updated:', { allowances, deductions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payslipData = {
      ...formData,
      net_salary: calculateNetSalary(),
    };
    
    if (payslip) {
      onSubmit({ ...payslipData, id: payslip.id });
    } else {
      onSubmit(payslipData);
    }
  };

  const handleInputChange = (field: keyof PayslipFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'employee_name' && field !== 'employee_id' && field !== 'designation' && field !== 'department' && field !== 'pay_period' && field !== 'company_name' && field !== 'company_address'
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleWorkDetailChange = (field: keyof typeof workDetails, value: string) => {
    setWorkDetails(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{payslip ? 'Edit Payslip' : 'Create New Payslip'}</CardTitle>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Work Details for Automatic Calculation */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Work Details (for automatic calculation)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="days_worked">Days Worked</Label>
                  <Input
                    id="days_worked"
                    type="number"
                    value={workDetails.days_worked}
                    onChange={(e) => handleWorkDetailChange('days_worked', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g., 22"
                  />
                </div>
                <div>
                  <Label htmlFor="hours_per_day">Hours per Day</Label>
                  <Input
                    id="hours_per_day"
                    type="number"
                    value={workDetails.hours_per_day}
                    onChange={(e) => handleWorkDetailChange('hours_per_day', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g., 8"
                  />
                </div>
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate (₹)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={workDetails.hourly_rate}
                    onChange={(e) => handleWorkDetailChange('hourly_rate', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g., 500"
                  />
                </div>
              </div>
              {workDetails.days_worked > 0 && workDetails.hours_per_day > 0 && workDetails.hourly_rate > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  Calculated Basic Salary: {formatIndianCurrency(calculateBasicSalary())} 
                  ({workDetails.days_worked} days × {workDetails.hours_per_day} hours × ₹{workDetails.hourly_rate}/hour)
                </div>
              )}
            </div>

            {/* Employee Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_name">Employee Name</Label>
                <Input
                  id="employee_name"
                  value={formData.employee_name}
                  onChange={(e) => handleInputChange('employee_name', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => handleEmployeeIdChange(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter employee ID to auto-load data"
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="pay_period">Pay Period</Label>
                <Input
                  id="pay_period"
                  value={formData.pay_period}
                  onChange={(e) => handleInputChange('pay_period', e.target.value)}
                  placeholder="e.g., January 2024"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="basic_salary">Basic Salary (₹)</Label>
                <Input
                  id="basic_salary"
                  type="number"
                  value={formData.basic_salary}
                  onChange={(e) => handleInputChange('basic_salary', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Standard Allowances */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Standard Allowances</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hra">House Rent Allowance (HRA) (₹)</Label>
                  <Input
                    id="hra"
                    type="number"
                    value={formData.hra}
                    onChange={(e) => handleInputChange('hra', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="transport_allowance">Transport Allowance (₹)</Label>
                  <Input
                    id="transport_allowance"
                    type="number"
                    value={formData.transport_allowance}
                    onChange={(e) => handleInputChange('transport_allowance', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="medical_allowance">Medical Allowance (₹)</Label>
                  <Input
                    id="medical_allowance"
                    type="number"
                    value={formData.medical_allowance}
                    onChange={(e) => handleInputChange('medical_allowance', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="other_allowances">Other Allowances (₹)</Label>
                  <Input
                    id="other_allowances"
                    type="number"
                    value={formData.other_allowances}
                    onChange={(e) => handleInputChange('other_allowances', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Custom Allowances and Deductions */}
            <EmployeeCustomFields
              employeeProfileId={null}
              onCustomFieldsChange={handleCustomFieldsChange}
            />

            {/* Standard Deductions */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Standard Deductions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pf_deduction">Provident Fund (EPF) (₹)</Label>
                  <Input
                    id="pf_deduction"
                    type="number"
                    value={formData.pf_deduction}
                    onChange={(e) => handleInputChange('pf_deduction', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="tax_deduction">Income Tax (TDS) (₹)</Label>
                  <Input
                    id="tax_deduction"
                    type="number"
                    value={formData.tax_deduction}
                    onChange={(e) => handleInputChange('tax_deduction', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_deduction">Employee State Insurance (ESI) (₹)</Label>
                  <Input
                    id="insurance_deduction"
                    type="number"
                    value={formData.insurance_deduction}
                    onChange={(e) => handleInputChange('insurance_deduction', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="other_deductions">Other Deductions (₹)</Label>
                  <Input
                    id="other_deductions"
                    type="number"
                    value={formData.other_deductions}
                    onChange={(e) => handleInputChange('other_deductions', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="company_address">Company Address</Label>
                  <Input
                    id="company_address"
                    value={formData.company_address}
                    onChange={(e) => handleInputChange('company_address', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Net Salary Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-semibold space-y-2">
                <div>Total Allowances: {formatIndianCurrency(formData.hra + formData.transport_allowance + formData.medical_allowance + formData.other_allowances)}</div>
                <div>Total Deductions: {formatIndianCurrency(formData.pf_deduction + formData.tax_deduction + formData.insurance_deduction + formData.other_deductions)}</div>
                <div className="text-xl font-bold text-green-600">
                  Net Salary: {formatIndianCurrency(calculateNetSalary())}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (payslip ? 'Update Payslip' : 'Create Payslip')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayslipForm;
