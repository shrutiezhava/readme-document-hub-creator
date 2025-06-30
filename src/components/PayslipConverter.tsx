
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, Edit, Trash2, Save, Plus, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { PayrollSummary, PayrollData } from '@/types/payroll';
import { PayslipFormData, Payslip } from '@/types/payslip';
import PayslipPreview from './PayslipPreview';

interface PayslipConverterProps {
  upload: PayrollSummary;
  payrollData: PayrollData[];
  onClose: () => void;
  onComplete: () => void;
}

const PayslipConverter: React.FC<PayslipConverterProps> = ({ 
  upload, 
  payrollData, 
  onClose, 
  onComplete 
}) => {
  const [convertedPayslips, setConvertedPayslips] = useState<Payslip[]>([]);
  const [editingPayslip, setEditingPayslip] = useState<Payslip | null>(null);
  const [editingData, setEditingData] = useState<PayslipFormData | null>(null);
  const [previewPayslip, setPreviewPayslip] = useState<Payslip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<'pending' | 'converting' | 'completed'>('pending');

  useEffect(() => {
    if (payrollData.length > 0) {
      convertAllToPayslips();
    }
  }, [payrollData]);

  const convertAllToPayslips = async () => {
    setIsLoading(true);
    setConversionStatus('converting');

    try {
      const convertedData: Payslip[] = [];

      for (const data of payrollData) {
        const jsonData = typeof data.data_json === 'object' && data.data_json !== null 
          ? data.data_json as Record<string, any>
          : {};

        const payslipData: PayslipFormData = {
          employee_name: jsonData.employee_name || '',
          employee_id: jsonData.employee_id || '',
          designation: jsonData.designation || '',
          department: jsonData.department || '',
          pay_period: jsonData.pay_period || '',
          basic_salary: Number(jsonData.basic_salary) || 0,
          hra: Number(jsonData.hra) || 0,
          transport_allowance: Number(jsonData.transport_allowance) || 0,
          medical_allowance: Number(jsonData.medical_allowance) || 0,
          other_allowances: Number(jsonData.other_allowances) || 0,
          pf_deduction: Number(jsonData.pf_deduction) || 0,
          tax_deduction: Number(jsonData.tax_deduction) || 0,
          insurance_deduction: Number(jsonData.insurance_deduction) || 0,
          other_deductions: Number(jsonData.other_deductions) || 0,
          net_salary: Number(jsonData.net_salary) || 0,
          company_name: jsonData.company_name || 'RV Associates',
          company_address: jsonData.company_address || 'Aarya Exotica, opposite KD-10, Bil, Vadodara 391410'
        };

        const { data: insertedPayslip, error } = await supabase
          .from('payslips')
          .insert([payslipData])
          .select()
          .single();

        if (error) {
          console.error('Error creating payslip:', error);
          toast({ 
            title: "Error creating payslip", 
            description: `Failed to create payslip for ${payslipData.employee_name}`,
            variant: "destructive" 
          });
        } else {
          convertedData.push(insertedPayslip as Payslip);
        }
      }

      setConvertedPayslips(convertedData);
      setConversionStatus('completed');
      toast({ 
        title: "Conversion completed", 
        description: `${convertedData.length} payslips created successfully` 
      });

    } catch (error) {
      console.error('Error during conversion:', error);
      toast({ title: "Conversion failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPayslip = (payslip: Payslip) => {
    setEditingPayslip(payslip);
    setEditingData({
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
      company_address: payslip.company_address
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPayslip || !editingData) return;

    try {
      const { error } = await supabase
        .from('payslips')
        .update(editingData)
        .eq('id', editingPayslip.id);

      if (error) {
        console.error('Error updating payslip:', error);
        toast({ title: "Error updating payslip", variant: "destructive" });
      } else {
        setConvertedPayslips(convertedPayslips.map(p => 
          p.id === editingPayslip.id 
            ? { ...p, ...editingData }
            : p
        ));
        setEditingPayslip(null);
        setEditingData(null);
        toast({ title: "Payslip updated successfully" });
      }
    } catch (error) {
      console.error('Error updating payslip:', error);
      toast({ title: "Error updating payslip", variant: "destructive" });
    }
  };

  const handleDeletePayslip = async (payslipId: string) => {
    if (!confirm('Are you sure you want to delete this payslip?')) return;

    try {
      const { error } = await supabase
        .from('payslips')
        .delete()
        .eq('id', payslipId);

      if (error) {
        console.error('Error deleting payslip:', error);
        toast({ title: "Error deleting payslip", variant: "destructive" });
      } else {
        setConvertedPayslips(convertedPayslips.filter(p => p.id !== payslipId));
        toast({ title: "Payslip deleted successfully" });
      }
    } catch (error) {
      console.error('Error deleting payslip:', error);
      toast({ title: "Error deleting payslip", variant: "destructive" });
    }
  };

  const handleInputChange = (field: keyof PayslipFormData, value: string | number) => {
    if (!editingData) return;
    
    setEditingData({
      ...editingData,
      [field]: value
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-7xl w-full bg-white shadow-2xl border-0 max-h-[95vh] overflow-y-auto rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                Payslip Converter - {upload.upload_name}
              </CardTitle>
              <p className="text-slate-600 mt-2">
                {payrollData.length} records • Status: 
                <Badge className="ml-2" variant={conversionStatus === 'completed' ? 'default' : 'secondary'}>
                  {conversionStatus}
                </Badge>
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {conversionStatus === 'converting' && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Converting Excel data to payslips...</p>
            </div>
          )}

          {conversionStatus === 'completed' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Converted Payslips ({convertedPayslips.length})</h3>
                <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                  Complete & Close
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Name</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {convertedPayslips.map((payslip) => (
                      <TableRow key={payslip.id}>
                        <TableCell className="font-medium">{payslip.employee_name}</TableCell>
                        <TableCell>{payslip.employee_id}</TableCell>
                        <TableCell>{payslip.designation}</TableCell>
                        <TableCell>{payslip.department}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          ₹{payslip.net_salary.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPreviewPayslip(payslip)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPayslip(payslip)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePayslip(payslip.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Payslip Modal */}
      {editingPayslip && editingData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Payslip - {editingPayslip.employee_name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditingPayslip(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_name">Employee Name</Label>
                  <Input
                    id="employee_name"
                    value={editingData.employee_name}
                    onChange={(e) => handleInputChange('employee_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={editingData.employee_id}
                    onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={editingData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={editingData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pay_period">Pay Period</Label>
                  <Input
                    id="pay_period"
                    value={editingData.pay_period}
                    onChange={(e) => handleInputChange('pay_period', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="basic_salary">Basic Salary</Label>
                  <Input
                    id="basic_salary"
                    type="number"
                    value={editingData.basic_salary}
                    onChange={(e) => handleInputChange('basic_salary', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="hra">HRA</Label>
                  <Input
                    id="hra"
                    type="number"
                    value={editingData.hra}
                    onChange={(e) => handleInputChange('hra', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="transport_allowance">Transport Allowance</Label>
                  <Input
                    id="transport_allowance"
                    type="number"
                    value={editingData.transport_allowance}
                    onChange={(e) => handleInputChange('transport_allowance', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="medical_allowance">Medical Allowance</Label>
                  <Input
                    id="medical_allowance"
                    type="number"
                    value={editingData.medical_allowance}
                    onChange={(e) => handleInputChange('medical_allowance', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="other_allowances">Other Allowances</Label>
                  <Input
                    id="other_allowances"
                    type="number"
                    value={editingData.other_allowances}
                    onChange={(e) => handleInputChange('other_allowances', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="pf_deduction">PF Deduction</Label>
                  <Input
                    id="pf_deduction"
                    type="number"
                    value={editingData.pf_deduction}
                    onChange={(e) => handleInputChange('pf_deduction', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="tax_deduction">Tax Deduction</Label>
                  <Input
                    id="tax_deduction"
                    type="number"
                    value={editingData.tax_deduction}
                    onChange={(e) => handleInputChange('tax_deduction', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_deduction">Insurance Deduction</Label>
                  <Input
                    id="insurance_deduction"
                    type="number"
                    value={editingData.insurance_deduction}
                    onChange={(e) => handleInputChange('insurance_deduction', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="other_deductions">Other Deductions</Label>
                  <Input
                    id="other_deductions"
                    type="number"
                    value={editingData.other_deductions}
                    onChange={(e) => handleInputChange('other_deductions', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="net_salary">Net Salary</Label>
                  <Input
                    id="net_salary"
                    type="number"
                    value={editingData.net_salary}
                    onChange={(e) => handleInputChange('net_salary', Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingPayslip(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payslip Preview */}
      {previewPayslip && (
        <PayslipPreview
          payslip={previewPayslip}
          onClose={() => setPreviewPayslip(null)}
        />
      )}
    </div>
  );
};

export default PayslipConverter;
