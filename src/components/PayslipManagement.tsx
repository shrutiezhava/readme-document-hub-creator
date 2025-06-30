
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Payslip } from '@/types/payslip';
import { Eye, Edit, Trash2, Download, Search, Filter } from 'lucide-react';
import { exportToPDF } from '@/utils/exportUtils';

const PayslipManagement: React.FC = () => {
  const { toast } = useToast();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [filteredPayslips, setFilteredPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPayslips();
  }, []);

  useEffect(() => {
    // Filter payslips based on search term
    if (searchTerm.trim() === '') {
      setFilteredPayslips(payslips);
    } else {
      const filtered = payslips.filter(payslip => 
        payslip.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payslip.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payslip.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payslip.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payslip.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPayslips(filtered);
    }
  }, [searchTerm, payslips]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payslips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayslips(data || []);
    } catch (error) {
      console.error('Error fetching payslips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payslips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete the payslip for ${employeeName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('payslips')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPayslips(payslips.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Payslip deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting payslip:', error);
      toast({
        title: "Error",
        description: "Failed to delete payslip",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = (payslip: Payslip) => {
    try {
      exportToPDF([payslip], `payslip_${payslip.employee_code}_${payslip.pay_period.replace(/\s+/g, '_')}`);
      toast({
        title: "Success",
        description: "Payslip PDF downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  const handleView = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Payslip Management ({filteredPayslips.length})
            </CardTitle>
            <Button onClick={fetchPayslips} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by employee name, code, or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="text-slate-600">
              {filteredPayslips.length} payslips
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payslips Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>S.No</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayslips.map((payslip) => (
                  <TableRow key={payslip.id} className="hover:bg-slate-50">
                    <TableCell>{payslip.serial_number || '-'}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payslip.employee_name}</div>
                        <div className="text-xs text-slate-500">{payslip.employee_code || payslip.employee_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{payslip.designation}</TableCell>
                    <TableCell>{payslip.department}</TableCell>
                    <TableCell>{payslip.pay_period}</TableCell>
                    <TableCell>₹{Number(payslip.total_earning_gross || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₹{Number(payslip.net_salary).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(payslip)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(payslip)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(payslip.id, payslip.employee_name)}
                          className="h-8 w-8 p-0"
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
          
          {filteredPayslips.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {searchTerm ? 'No payslips match your search criteria' : 'No payslips found'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payslip Details Modal */}
      {showDetails && selectedPayslip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payslip Details - {selectedPayslip.employee_name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Employee Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">S.No</label>
                  <div className="font-medium">{selectedPayslip.serial_number || '-'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Employee Code</label>
                  <div className="font-medium">{selectedPayslip.employee_code || selectedPayslip.employee_id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Designation</label>
                  <div className="font-medium">{selectedPayslip.designation}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Pay Period</label>
                  <div className="font-medium">{selectedPayslip.pay_period}</div>
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Earnings</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-green-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm text-slate-600">Basic Salary</label>
                    <div className="font-medium">₹{Number(selectedPayslip.basic_salary).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">HRA</label>
                    <div className="font-medium">₹{Number(selectedPayslip.hra).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Performance Allowance</label>
                    <div className="font-medium">₹{Number(selectedPayslip.performance_allowance || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Other Earnings</label>
                    <div className="font-medium">₹{Number(selectedPayslip.other_earning || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Attendance Incentive</label>
                    <div className="font-medium">₹{Number(selectedPayslip.attendance_incentive || 0).toLocaleString()}</div>
                  </div>
                  <div className="col-span-full border-t pt-2">
                    <label className="text-sm text-slate-600">Total Gross</label>
                    <div className="font-bold text-green-700">₹{Number(selectedPayslip.total_earning_gross || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Deductions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-red-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm text-slate-600">PF Deduction</label>
                    <div className="font-medium">₹{Number(selectedPayslip.pf_deduction).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Tax Deduction</label>
                    <div className="font-medium">₹{Number(selectedPayslip.tax_deduction).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Insurance</label>
                    <div className="font-medium">₹{Number(selectedPayslip.insurance_deduction).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Other Deductions</label>
                    <div className="font-medium">₹{Number(selectedPayslip.other_deductions).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Service Charge</label>
                    <div className="font-medium">₹{Number(selectedPayslip.service_charge || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <label className="text-lg font-medium text-slate-700">Net Salary</label>
                  <div className="text-2xl font-bold text-blue-700">₹{Number(selectedPayslip.net_salary).toLocaleString()}</div>
                </div>
              </div>

              {/* Bank Details */}
              {selectedPayslip.bank_name && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                      <label className="text-sm text-slate-600">Bank Name</label>
                      <div className="font-medium">{selectedPayslip.bank_name}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Account Number</label>
                      <div className="font-medium">{selectedPayslip.bank_account_number}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">IFSC Code</label>
                      <div className="font-medium">{selectedPayslip.ifsc_code}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => handleDownloadPDF(selectedPayslip)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetails(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PayslipManagement;
