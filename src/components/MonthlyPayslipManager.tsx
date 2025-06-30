
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Download, FileText, Search, Users, DollarSign, Building, Eye } from 'lucide-react';
import { Payslip } from '@/types/payslip';
import { MonthlyPayslipSummary } from '@/types/bulk';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MonthlyPayslipManagerProps {
  onClose: () => void;
}

const MonthlyPayslipManager: React.FC<MonthlyPayslipManagerProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [filteredPayslips, setFilteredPayslips] = useState<Payslip[]>([]);
  const [summary, setSummary] = useState<MonthlyPayslipSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Get available months from payslips
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  useEffect(() => {
    fetchAvailableMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchMonthlyPayslips();
      fetchMonthlySummary();
    }
  }, [selectedMonth]);

  useEffect(() => {
    filterPayslips();
  }, [payslips, searchTerm, departmentFilter, statusFilter]);

  const fetchAvailableMonths = async () => {
    try {
      const { data, error } = await supabase
        .from('payslips')
        .select('pay_period')
        .order('pay_period', { ascending: false });

      if (error) throw error;

      const uniqueMonths = [...new Set(data?.map(p => p.pay_period) || [])];
      setAvailableMonths(uniqueMonths);
      
      if (uniqueMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(uniqueMonths[0]);
      }
    } catch (error) {
      console.error('Error fetching available months:', error);
    }
  };

  const fetchMonthlyPayslips = async () => {
    if (!selectedMonth) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payslips')
        .select('*')
        .eq('pay_period', selectedMonth)
        .order('employee_name');

      if (error) throw error;
      setPayslips(data || []);
    } catch (error) {
      console.error('Error fetching monthly payslips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payslips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async () => {
    if (!selectedMonth) return;

    try {
      const { data, error } = await supabase
        .from('monthly_payslip_summary')
        .select('*')
        .eq('pay_period', selectedMonth)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSummary(data);
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
    }
  };

  const filterPayslips = () => {
    let filtered = payslips;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(p => 
        p.department.toLowerCase().includes(departmentFilter.toLowerCase())
      );
    }

    setFilteredPayslips(filtered);
  };

  const generateUnifiedPDF = async () => {
    if (filteredPayslips.length === 0) {
      toast({
        title: "No Data",
        description: "No payslips to export",
        variant: "destructive"
      });
      return;
    }

    try {
      const doc = new jsPDF();
      let currentPage = 1;

      // Cover Page
      doc.setFontSize(24);
      doc.text('RV Associates', 105, 40, { align: 'center' });
      doc.setFontSize(18);
      doc.text(`Payslip Report - ${selectedMonth}`, 105, 60, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 80, { align: 'center' });
      doc.text(`Total Employees: ${filteredPayslips.length}`, 105, 95, { align: 'center' });
      
      if (summary) {
        doc.text(`Total Payroll: ₹${summary.total_net_salary.toLocaleString()}`, 105, 110, { align: 'center' });
        doc.text(`Average Salary: ₹${Math.round(summary.average_net_salary).toLocaleString()}`, 105, 125, { align: 'center' });
      }

      // Summary Table
      if (summary) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Monthly Summary', 20, 30);

        const summaryData = [
          ['Total Employees', filteredPayslips.length.toString()],
          ['Departments', summary.departments_count.toString()],
          ['Total Payroll', `₹${summary.total_net_salary.toLocaleString()}`],
          ['Average Salary', `₹${Math.round(summary.average_net_salary).toLocaleString()}`],
          ['Highest Salary', `₹${summary.max_net_salary.toLocaleString()}`],
          ['Lowest Salary', `₹${summary.min_net_salary.toLocaleString()}`],
        ];

        autoTable(doc, {
          startY: 40,
          head: [['Metric', 'Value']],
          body: summaryData,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
        });
      }

      // Individual Payslips
      filteredPayslips.forEach((payslip, index) => {
        doc.addPage();
        
        // Header
        doc.setFontSize(16);
        doc.text('RV Associates', 20, 25);
        doc.setFontSize(10);
        doc.text('Aarya Exotica, opposite KD-10, Bil, Vadodara 391410', 20, 32);
        
        doc.setFontSize(14);
        doc.text(`PAYSLIP - ${selectedMonth}`, 105, 45, { align: 'center' });
        
        // Employee Details
        const empDetailsY = 60;
        doc.setFontSize(10);
        doc.text(`Employee Name: ${payslip.employee_name}`, 20, empDetailsY);
        doc.text(`Employee ID: ${payslip.employee_code || payslip.employee_id}`, 20, empDetailsY + 7);
        doc.text(`Designation: ${payslip.designation}`, 20, empDetailsY + 14);
        doc.text(`Department: ${payslip.department}`, 20, empDetailsY + 21);

        // Earnings Table
        const earningsData = [
          ['Basic Salary', `₹${Number(payslip.basic_salary || 0).toLocaleString()}`],
          ['HRA', `₹${Number(payslip.hra || 0).toLocaleString()}`],
          ['Transport Allowance', `₹${Number(payslip.transport_allowance || 0).toLocaleString()}`],
          ['Medical Allowance', `₹${Number(payslip.medical_allowance || 0).toLocaleString()}`],
          ['Performance Allowance', `₹${Number(payslip.performance_allowance || 0).toLocaleString()}`],
          ['Other Allowances', `₹${Number(payslip.other_allowances || 0).toLocaleString()}`],
        ];

        autoTable(doc, {
          startY: empDetailsY + 35,
          head: [['Earnings', 'Amount']],
          body: earningsData,
          theme: 'grid',
          headStyles: { fillColor: [34, 197, 94] },
          columnStyles: { 1: { halign: 'right' } },
          margin: { left: 20, right: 105 },
        });

        // Deductions Table
        const deductionsData = [
          ['PF Deduction', `₹${Number(payslip.pf_deduction || 0).toLocaleString()}`],
          ['Tax Deduction', `₹${Number(payslip.tax_deduction || 0).toLocaleString()}`],
          ['Insurance', `₹${Number(payslip.insurance_deduction || 0).toLocaleString()}`],
          ['Other Deductions', `₹${Number(payslip.other_deductions || 0).toLocaleString()}`],
          ['Service Charge', `₹${Number(payslip.service_charge || 0).toLocaleString()}`],
        ];

        autoTable(doc, {
          startY: empDetailsY + 35,
          head: [['Deductions', 'Amount']],
          body: deductionsData,
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68] },
          columnStyles: { 1: { halign: 'right' } },
          margin: { left: 105, right: 20 },
        });

        // Net Salary
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`NET SALARY: ₹${Number(payslip.net_salary).toLocaleString()}`, 105, finalY, { align: 'center' });

        // Bank Details (if available)
        if (payslip.bank_name) {
          doc.setFont(undefined, 'normal');
          doc.setFontSize(10);
          doc.text(`Bank: ${payslip.bank_name} | Account: ${payslip.bank_account_number} | IFSC: ${payslip.ifsc_code}`, 105, finalY + 15, { align: 'center' });
        }

        // Page numbering
        doc.setFontSize(8);
        doc.text(`Page ${currentPage + 2} | Employee ${index + 1} of ${filteredPayslips.length}`, 105, 285, { align: 'center' });
        currentPage++;
      });

      // Save the PDF
      const fileName = `RV_Payslips_${selectedMonth.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Success",
        description: `Unified payslip PDF generated: ${fileName}`,
      });

    } catch (error) {
      console.error('Error generating unified PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate unified PDF",
        variant: "destructive"
      });
    }
  };

  const uniqueDepartments = [...new Set(payslips.map(p => p.department))];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Payslip Manager
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <label className="text-sm font-medium">Select Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose month..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-48">
              <label className="text-sm font-medium">Search Employees</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="min-w-48">
              <label className="text-sm font-medium">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {uniqueDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateUnifiedPDF}
              disabled={filteredPayslips.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Unified PDF ({filteredPayslips.length})
            </Button>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-slate-600">Total Employees</p>
                      <p className="text-2xl font-bold">{filteredPayslips.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm text-slate-600">Departments</p>
                      <p className="text-2xl font-bold">{uniqueDepartments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-slate-600">Total Payroll</p>
                      <p className="text-2xl font-bold">₹{summary.total_net_salary.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm text-slate-600">Average Salary</p>
                      <p className="text-2xl font-bold">₹{Math.round(summary.average_net_salary).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payslips Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Payslips for {selectedMonth} ({filteredPayslips.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading payslips...</div>
              ) : filteredPayslips.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {payslips.length === 0 ? 'No payslips found for this month' : 'No payslips match your filters'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayslips.map((payslip) => (
                      <TableRow key={payslip.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payslip.employee_name}</div>
                            <div className="text-xs text-slate-500">{payslip.employee_code || payslip.employee_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{payslip.department}</TableCell>
                        <TableCell>{payslip.designation}</TableCell>
                        <TableCell>₹{Number(payslip.total_earning_gross || 0).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">₹{Number(payslip.net_salary).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="default">Processed</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyPayslipManager;
