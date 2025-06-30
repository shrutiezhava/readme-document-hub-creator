
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { FileSpreadsheet, Download, Trash2, Eye, ArrowLeft, Calendar, FileText, CheckSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { PayrollSummary, PayrollData } from '@/types/payroll';
import BulkPayrollManager from './BulkPayrollManager';
import PayslipConverter from './PayslipConverter';
import * as XLSX from 'xlsx';

interface PayrollManagementProps {
  onBack: () => void;
}

const PayrollManagement: React.FC<PayrollManagementProps> = ({ onBack }) => {
  const [uploads, setUploads] = useState<PayrollSummary[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<PayrollSummary | null>(null);
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUploads, setSelectedUploads] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('payroll_summary')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching uploads:', error);
        toast({ title: "Error loading uploads", variant: "destructive" });
      } else {
        setUploads(data || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUploadData = async (uploadId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payroll_data')
        .select('*')
        .eq('upload_id', uploadId)
        .order('row_number');

      if (error) {
        console.error('Error fetching payroll data:', error);
        toast({ title: "Error loading payroll data", variant: "destructive" });
        return;
      }

      setPayrollData(data || []);

      // Extract all unique columns from the data
      const allColumns = new Set<string>();
      data?.forEach(row => {
        Object.keys(row.data_json || {}).forEach(key => allColumns.add(key));
      });
      setColumns(Array.from(allColumns));

    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUpload = (uploadId: string) => {
    if (selectedUploads.includes(uploadId)) {
      setSelectedUploads(selectedUploads.filter(id => id !== uploadId));
    } else {
      setSelectedUploads([...selectedUploads, uploadId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUploads([]);
    } else {
      setSelectedUploads(uploads.map(upload => upload.upload_id));
    }
    setSelectAll(!selectAll);
  };

  const handleMassDelete = async () => {
    if (selectedUploads.length === 0) {
      toast({ title: "No uploads selected", variant: "destructive" });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedUploads.length} upload(s) and all their data? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsLoading(true);
      
      for (const uploadId of selectedUploads) {
        // Delete payroll data first
        const { error: dataError } = await supabase
          .from('payroll_data')
          .delete()
          .eq('upload_id', uploadId);

        if (dataError) {
          console.error('Error deleting payroll data:', dataError);
          continue;
        }

        // Delete from payroll_uploads table
        const { error: uploadError } = await supabase
          .from('payroll_uploads')
          .delete()
          .eq('id', uploadId);

        if (uploadError) {
          console.error('Error deleting upload:', uploadError);
        }
      }

      toast({ title: `Successfully deleted ${selectedUploads.length} upload(s)` });
      setSelectedUploads([]);
      setSelectAll(false);
      fetchUploads(); // Refresh the uploads list
      
      // Clear selected upload if it was deleted
      if (selectedUpload && selectedUploads.includes(selectedUpload.upload_id)) {
        setSelectedUpload(null);
        setPayrollData([]);
        setColumns([]);
      }
    } catch (error) {
      console.error('Mass delete error:', error);
      toast({ title: "Error during mass delete", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUpload = (upload: PayrollSummary) => {
    setSelectedUpload(upload);
    fetchUploadData(upload.upload_id);
  };

  const handleDeleteUpload = async (uploadId: string) => {
    if (!confirm('Are you sure you want to delete this upload and all its data? This action cannot be undone.')) return;

    try {
      setIsLoading(true);
      
      // Delete payroll data first (due to potential foreign key constraints)
      const { error: dataError } = await supabase
        .from('payroll_data')
        .delete()
        .eq('upload_id', uploadId);

      if (dataError) {
        console.error('Error deleting payroll data:', dataError);
        toast({ title: "Error deleting payroll data", variant: "destructive" });
        return;
      }

      // Delete from payroll_uploads table
      const { error: uploadError } = await supabase
        .from('payroll_uploads')
        .delete()
        .eq('id', uploadId);

      if (uploadError) {
        console.error('Error deleting upload:', uploadError);
        toast({ title: "Error deleting upload", variant: "destructive" });
        return;
      }

      toast({ title: "Upload deleted successfully" });
      fetchUploads(); // Refresh the uploads list
      
      // Clear selected upload if it was the one being deleted
      if (selectedUpload?.upload_id === uploadId) {
        setSelectedUpload(null);
        setPayrollData([]);
        setColumns([]);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: "Error deleting upload", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportUpload = (upload: PayrollSummary) => {
    if (!payrollData.length) return;

    const exportData = payrollData.map(row => row.data_json);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll Data');
    XLSX.writeFile(wb, `${upload.upload_name.replace(/\s+/g, '_')}_export.xlsx`);
    toast({ title: "Export completed" });
  };

  const handleConvertToPayslips = (upload: PayrollSummary) => {
    setSelectedUpload(upload);
    fetchUploadData(upload.upload_id);
    setShowConverter(true);
  };

  if (selectedUpload && !showConverter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Button variant="outline" onClick={() => setSelectedUpload(null)} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Uploads
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">{selectedUpload.upload_name}</h1>
              <p className="text-gray-600">
                {selectedUpload.actual_records} records • {columns.length} columns • {new Date(selectedUpload.upload_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleConvertToPayslips(selectedUpload)} className="bg-green-600 hover:bg-green-700">
                <FileText className="w-4 h-4 mr-2" />
                Convert to Payslips
              </Button>
              <Button onClick={() => handleExportUpload(selectedUpload)}>
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle>Payroll Data</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : payrollData.length === 0 ? (
                <div className="text-center py-8">No data found</div>
              ) : (
                <div className="overflow-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        {columns.slice(0, 8).map((col) => (
                          <TableHead key={col} className="min-w-32">{col}</TableHead>
                        ))}
                        {columns.length > 8 && <TableHead>...</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.row_number}</TableCell>
                          {columns.slice(0, 8).map((col) => (
                            <TableCell key={col} className="text-sm">
                              {String(row.data_json[col] || '')}
                            </TableCell>
                          ))}
                          {columns.length > 8 && <TableCell className="text-xs text-gray-500">+{columns.length - 8} more</TableCell>}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="outline" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
            <p className="text-gray-600 mt-2">Upload Excel files and automatically convert to payslips</p>
          </div>
          <Button onClick={() => setShowImport(true)}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Import Payroll Excel
          </Button>
        </div>

        {selectedUpload && !showConverter ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <Button variant="outline" onClick={() => setSelectedUpload(null)} className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Uploads
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">{selectedUpload.upload_name}</h1>
                <p className="text-gray-600">
                  {selectedUpload.actual_records} records • {columns.length} columns • {new Date(selectedUpload.upload_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => handleConvertToPayslips(selectedUpload)} className="bg-green-600 hover:bg-green-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Convert to Payslips
                </Button>
                <Button onClick={() => handleExportUpload(selectedUpload)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteUpload(selectedUpload.upload_id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Upload
                </Button>
              </div>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle>Payroll Data</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : payrollData.length === 0 ? (
                  <div className="text-center py-8">No data found</div>
                ) : (
                  <div className="overflow-auto max-h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          {columns.slice(0, 8).map((col) => (
                            <TableHead key={col} className="min-w-32">{col}</TableHead>
                          ))}
                          {columns.length > 8 && <TableHead>...</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollData.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{row.row_number}</TableCell>
                            {columns.slice(0, 8).map((col) => (
                              <TableCell key={col} className="text-sm">
                                {String(row.data_json[col] || '')}
                              </TableCell>
                            ))}
                            {columns.length > 8 && <TableCell className="text-xs text-gray-500">+{columns.length - 8} more</TableCell>}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Payroll Uploads</CardTitle>
                {selectedUploads.length > 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={handleMassDelete}
                    className="ml-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected ({selectedUploads.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : uploads.length === 0 ? (
                <div className="text-center py-8">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No payroll uploads yet. Start by importing an Excel file.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all uploads"
                        />
                      </TableHead>
                      <TableHead>Upload Name</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploads.map((upload) => (
                      <TableRow key={upload.upload_id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUploads.includes(upload.upload_id)}
                            onCheckedChange={() => handleSelectUpload(upload.upload_id)}
                            aria-label={`Select ${upload.upload_name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{upload.upload_name}</TableCell>
                        <TableCell>{upload.file_name}</TableCell>
                        <TableCell>{upload.actual_records} / {upload.total_records}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(upload.upload_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewUpload(upload)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleConvertToPayslips(upload)}
                              className="bg-green-50 hover:bg-green-100"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeleteUpload(upload.upload_id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        {showImport && (
          <BulkPayrollManager
            onClose={() => setShowImport(false)}
            onImportComplete={() => {
              setShowImport(false);
              fetchUploads();
            }}
          />
        )}

        {showConverter && selectedUpload && (
          <PayslipConverter
            upload={selectedUpload}
            payrollData={payrollData}
            onClose={() => {
              setShowConverter(false);
              setSelectedUpload(null);
            }}
            onComplete={() => {
              setShowConverter(false);
              setSelectedUpload(null);
              toast({ title: "Payslips created successfully!" });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PayrollManagement;
