import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PayslipFormData } from '@/types/payslip';
import { PayrollUpload, PayrollData } from '@/types/payroll';
import { Edit, Trash2, Plus, X } from 'lucide-react';

interface ImportedDataManagerProps {
  onConvertToPayslip: () => void;
}

const ImportedDataManager: React.FC<ImportedDataManagerProps> = ({ onConvertToPayslip }) => {
  const { toast } = useToast();
  const [uploads, setUploads] = useState<PayrollUpload[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<PayrollUpload | null>(null);
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [editingData, setEditingData] = useState<PayrollData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('payroll_uploads')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setUploads(data || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payroll uploads",
        variant: "destructive"
      });
    }
  };

  const fetchPayrollData = async (uploadId: string) => {
    try {
      const { data, error } = await supabase
        .from('payroll_data')
        .select('*')
        .eq('upload_id', uploadId)
        .order('row_number');

      if (error) throw error;
      
      const typedData: PayrollData[] = (data || []).map(item => ({
        ...item,
        data_json: item.data_json as any
      }));
      
      setPayrollData(typedData);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payroll data",
        variant: "destructive"
      });
    }
  };

  const handleUploadSelect = (upload: PayrollUpload) => {
    setSelectedUpload(upload);
    fetchPayrollData(upload.id);
  };

  const deleteUpload = async (uploadId: string, uploadName: string) => {
    if (!confirm(`Are you sure you want to delete "${uploadName}" and all its data? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete payroll data first
      const { error: dataError } = await supabase
        .from('payroll_data')
        .delete()
        .eq('upload_id', uploadId);

      if (dataError) throw dataError;

      // Delete upload record
      const { error: uploadError } = await supabase
        .from('payroll_uploads')
        .delete()
        .eq('id', uploadId);

      if (uploadError) throw uploadError;

      // Update local state
      setUploads(uploads.filter(upload => upload.id !== uploadId));
      
      // Clear selection if deleted upload was selected
      if (selectedUpload?.id === uploadId) {
        setSelectedUpload(null);
        setPayrollData([]);
      }

      toast({
        title: "Success",
        description: "Upload and all associated data deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting upload:', error);
      toast({
        title: "Error",
        description: "Failed to delete upload",
        variant: "destructive"
      });
    }
  };

  const convertToPayslip = async (data: PayrollData) => {
    try {
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

      const { error } = await supabase
        .from('payslips')
        .insert([payslipData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payslip created successfully"
      });

      onConvertToPayslip();
    } catch (error) {
      console.error('Error converting to payslip:', error);
      toast({
        title: "Error",
        description: "Failed to create payslip",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (data: PayrollData) => {
    setEditingData(data);
    const jsonData = typeof data.data_json === 'object' && data.data_json !== null 
      ? data.data_json as Record<string, any>
      : {};
    setFormData({ ...jsonData });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!editingData) return;

    try {
      const { error } = await supabase
        .from('payroll_data')
        .update({ data_json: formData })
        .eq('id', editingData.id);

      if (error) throw error;

      setPayrollData(payrollData.map(item => 
        item.id === editingData.id 
          ? { ...item, data_json: formData }
          : item
      ));

      setIsFormOpen(false);
      setEditingData(null);
      toast({
        title: "Success",
        description: "Data updated successfully"
      });
    } catch (error) {
      console.error('Error updating data:', error);
      toast({
        title: "Error",
        description: "Failed to update data",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const { error } = await supabase
        .from('payroll_data')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPayrollData(payrollData.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Record deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive"
      });
    }
  };

  const getColumnKeys = () => {
    if (payrollData.length === 0) return [];
    const firstItem = payrollData[0];
    if (typeof firstItem.data_json === 'object' && firstItem.data_json !== null) {
      return Object.keys(firstItem.data_json as Record<string, any>);
    }
    return [];
  };

  const getCellValue = (data: PayrollData, key: string) => {
    if (typeof data.data_json === 'object' && data.data_json !== null) {
      const jsonData = data.data_json as Record<string, any>;
      return String(jsonData[key] || '');
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Uploads List */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {uploads.map((upload) => (
              <div 
                key={upload.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedUpload?.id === upload.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleUploadSelect(upload)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{upload.upload_name}</h3>
                    <p className="text-sm text-slate-600">
                      {upload.file_name} • {upload.total_records} records
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(upload.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{upload.total_records}</Badge>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUpload(upload.id, upload.upload_name);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Upload Data */}
      {selectedUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Data from {selectedUpload.upload_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    {getColumnKeys().map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell>{data.row_number}</TableCell>
                      {getColumnKeys().map((key) => (
                        <TableCell key={key}>
                          {getCellValue(data, key)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(data)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => convertToPayslip(data)}
                            className="bg-green-50 hover:bg-green-100"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(data.id)}
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
          </CardContent>
        </Card>
      )}

      {/* Edit Form Modal */}
      {isFormOpen && editingData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Record</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(formData).map((key) => (
                <div key={key}>
                  <Label htmlFor={key}>{key}</Label>
                  <Input
                    id={key}
                    value={formData[key] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [key]: e.target.value
                    })}
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImportedDataManager;
