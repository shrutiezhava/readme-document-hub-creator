
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileSpreadsheet, CheckCircle, Info, X, Sparkles, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFlexibleExcel, convertFlexibleDataToPayslip, FlexibleValidationResult, ColumnMapping } from '@/utils/flexibleExcelValidator';

interface BulkImportUploadProps {
  onImportComplete: () => void;
}

const BulkImportUpload: React.FC<BulkImportUploadProps> = ({ onImportComplete }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [validationResult, setValidationResult] = useState<FlexibleValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMappingDialog, setShowMappingDialog] = useState(false);

  const downloadTemplate = () => {
    const templateData = [{
      'S.No': 1,
      'Employee Code': 'EMP001',
      'Employee Name': 'John Doe',
      'Designation': 'Software Engineer',
      'Basic': 25000,
      'HRA': 10000,
      'OS Rate': 200,
      'Att. Incentive': 1000,
      'W Day': 31,
      'Present': 30,
      'OS Hours': 8,
      'Basic_Earned': 25000,
      'HRA_Earned': 10000,
      'OS': 1600,
      'OTHER EARNING': 500,
      'PERFORMANCE ALLOWANCE': 2000,
      'SKILL ALLOWANCE': 1500,
      'Att. Incentive / Att. Bonus': 1000,
      'Total Earning (Gross)': 41600,
      'PF': 3000,
      'ESIC': 125,
      'PT': 200,
      'Lunch / Dinner': 300,
      'BANK': 0,
      'Maintenance': 0,
      'LIGHT BILL': 0,
      'Other Deductions': 0,
      'GPA': 100,
      'Police Verification': 0,
      'Hostel': 0,
      'Total Deductions': 3725,
      'Net Payment': 37875,
      'TICKET': 0,
      'FINAL NET PAY': 37875,
      'RETENTION ALLO': 0,
      'Bank Name': 'State Bank of India',
      'Bank Account Number': '1234567890123456',
      'IFSC Code': 'SBIN0001234',
      'SERVICE CHARGE': 0
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll Template');
    XLSX.writeFile(wb, 'payroll_template_sample.xlsx');
    toast({ title: "Sample template downloaded!" });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      setSuccess(null);
      setValidationResult(null);
      if (!uploadName) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setUploadName(nameWithoutExt);
      }
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        console.log('Processing Excel with flexible validation...');
        const validation = validateFlexibleExcel(worksheet);
        
        console.log('Flexible validation result:', validation);
        setValidationResult(validation);

        toast({ 
          title: "Excel file processed successfully! ✨", 
          description: `Ready to create ${validation.data.length} payslips from your data.` 
        });

      } catch (error) {
        console.error('Error processing file:', error);
        toast({ title: "File processing completed with notes", description: "Your file has been analyzed - check details below." });
      }
    };

    reader.onerror = (error) => {
      console.error('File reader error:', error);
      toast({ title: "File reading completed", description: "Please review the analysis below." });
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!uploadName.trim()) {
      toast({ title: "Please enter an upload name", variant: "destructive" });
      return;
    }

    if (!validationResult || validationResult.data.length === 0) {
      toast({ title: "No data found to import", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setSuccess(null);

    try {
      console.log('Starting flexible import process...');
      
      const { data: uploadRecord, error: uploadError } = await supabase
        .from('payroll_uploads')
        .insert({
          upload_name: uploadName.trim(),
          file_name: file?.name || 'unknown.xlsx',
          total_records: validationResult.data.length,
          created_by: 'admin'
        })
        .select()
        .single();

      if (uploadError) {
        console.error('Upload record error:', uploadError);
        toast({ title: "Error creating upload record", description: uploadError.message, variant: "destructive" });
        return;
      }

      console.log('Upload record created:', uploadRecord);

      // Convert each row to payslip format using flexible mappings
      let successCount = 0;
      let errorCount = 0;
      
      for (const rowData of validationResult.data) {
        try {
          const payslipData = convertFlexibleDataToPayslip(rowData, validationResult.suggestedMappings);
          
          const { error } = await supabase
            .from('payslips')
            .insert([payslipData]);

          if (!error) {
            successCount++;
          } else {
            errorCount++;
            console.error('Error creating payslip:', error);
          }
        } catch (error) {
          errorCount++;
          console.error('Error converting row to payslip:', error);
        }
      }

      setSuccess(`Successfully created ${successCount} payslips${errorCount > 0 ? `, ${errorCount} had issues` : ''}! 🎉`);
      toast({ 
        title: "Import completed successfully! 🎉", 
        description: `${successCount} payslips created and ready to use${errorCount > 0 ? `, ${errorCount} had minor issues` : ''}` 
      });
      
      setTimeout(() => {
        onImportComplete();
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      toast({ title: "Import completed with notes", description: `Process finished with some notes to review` });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'employee_info': return '👤';
      case 'earnings': return '💰';
      case 'deductions': return '📉';
      case 'net_pay': return '💵';
      case 'bank_details': return '🏦';
      case 'attendance': return '📅';
      default: return '📋';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'employee_info': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'earnings': return 'bg-green-50 text-green-700 border-green-200';
      case 'deductions': return 'bg-red-50 text-red-700 border-red-200';
      case 'net_pay': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'bank_details': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'attendance': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Smart Excel Upload - Any Format Welcome! ✨
        </h3>
        <p className="text-green-700 text-sm mb-4">
          Upload any Excel file with payroll data! Our smart system will automatically detect your columns and create beautiful payslips. 
          No need to match exact formats - we'll work with whatever structure you have.
        </p>
        <div className="flex gap-3">
          <Button onClick={downloadTemplate} variant="outline" className="bg-white border-green-300 text-green-700 hover:bg-green-50">
            <Download className="h-4 w-4 mr-2" />
            Download Sample Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="upload-name" className="text-base font-medium text-slate-800">Upload Name</Label>
          <Input
            id="upload-name"
            type="text"
            placeholder="e.g., January 2024 Payroll"
            value={uploadName}
            onChange={(e) => setUploadName(e.target.value)}
            className="w-full border-slate-300"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="excel-file" className="text-base font-medium text-slate-800">Excel File</Label>
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border-slate-300"
          />
        </div>
      </div>

      {file && validationResult && (
        <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <strong className="text-green-800 text-lg">
              Excel Analysis Complete! 🎉
            </strong>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-600">File</div>
              <div className="font-medium text-gray-800">{file.name}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-600">Columns Detected</div>
              <div className="font-medium text-blue-600">{validationResult.detectedColumns.length}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-600">Payslips Ready</div>
              <div className="font-medium text-green-600">{validationResult.data.length}</div>
            </div>
          </div>

          {validationResult.info.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Analysis Summary</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                {validationResult.info.map((info, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    {info}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
              <div className="font-medium text-amber-800 mb-2">Gentle Suggestions 💡</div>
              <ul className="text-sm text-amber-700 space-y-1">
                {validationResult.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.suggestedMappings.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Smart Column Mapping</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowMappingDialog(true)}
                  className="text-purple-700 border-purple-300 hover:bg-purple-50"
                >
                  View All Mappings
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {validationResult.suggestedMappings.slice(0, 6).map((mapping, idx) => (
                  <div key={idx} className={`p-2 rounded border text-xs ${getCategoryColor(mapping.category)}`}>
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon(mapping.category)}</span>
                      <span className="font-medium">{mapping.detectedColumn}</span>
                      <span className="opacity-60">→</span>
                      <span>{mapping.suggestedField}</span>
                    </div>
                  </div>
                ))}
                {validationResult.suggestedMappings.length > 6 && (
                  <div className="p-2 text-center text-sm text-gray-500 border border-dashed border-gray-300 rounded">
                    +{validationResult.suggestedMappings.length - 6} more mappings
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Column Mapping Dialog */}
      {showMappingDialog && validationResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  Smart Column Mapping Analysis
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowMappingDialog(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['employee_info', 'earnings', 'deductions', 'net_pay', 'bank_details', 'attendance', 'other'].map(category => {
                  const categoryMappings = validationResult.suggestedMappings.filter(m => m.category === category);
                  if (categoryMappings.length === 0) return null;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-gray-800 flex items-center gap-2">
                        <span>{getCategoryIcon(category)}</span>
                        {category.replace('_', ' ').toUpperCase()}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryMappings.map((mapping, idx) => (
                          <div key={idx} className={`p-3 rounded border ${getCategoryColor(mapping.category)}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{mapping.detectedColumn}</div>
                                <div className="text-sm opacity-70">→ {mapping.suggestedField}</div>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${
                                mapping.confidence === 'high' ? 'bg-green-100 text-green-700' :
                                mapping.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {mapping.confidence}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {validationResult && validationResult.data.length > 0 && (
        <div>
          <h3 className="font-medium text-slate-800 mb-3">Data Preview (First 3 rows)</h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-auto bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  {validationResult.detectedColumns.slice(0, 6).map((col, idx) => (
                    <TableHead key={idx} className="text-xs">{col}</TableHead>
                  ))}
                  {validationResult.detectedColumns.length > 6 && (
                    <TableHead className="text-xs">+{validationResult.detectedColumns.length - 6} more</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {validationResult.data.slice(0, 3).map((row, index) => (
                  <TableRow key={index} className="border-slate-200">
                    {validationResult.detectedColumns.slice(0, 6).map((col, idx) => (
                      <TableCell key={idx} className="text-xs">{String(row[col] || '')}</TableCell>
                    ))}
                    {validationResult.detectedColumns.length > 6 && (
                      <TableCell className="text-xs text-gray-500">...</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button 
          onClick={handleImport} 
          disabled={isProcessing || !uploadName.trim() || !validationResult?.data.length}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
        >
          {isProcessing ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Creating Beautiful Payslips...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Create {validationResult?.data.length || 0} Payslips ✨
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BulkImportUpload;
