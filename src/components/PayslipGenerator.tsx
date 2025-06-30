import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, FileText, BarChart3, Settings, Download, Plus, Eye, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Payslip } from '@/types/payslip';
import { ThemeToggle } from '@/components/ThemeToggle';
import PayslipForm from './PayslipForm';
import PayslipPreview from './PayslipPreview';
import PayrollDashboard from './PayrollDashboard';
import SearchFilter from './SearchFilter';
import CustomAllowancesManager from './CustomAllowancesManager';
import CustomDeductionsManager from './CustomDeductionsManager';
import BulkPayrollManager from './BulkPayrollManager';
import { exportToExcel, exportToCSV, exportToPDF, exportByDesignation, exportByDepartment, exportByEmployee } from '@/utils/exportUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

const PayslipGenerator: React.FC = () => {
  const { user, logout } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [salaryRangeFilter, setSalaryRangeFilter] = useState('all');
  const [filteredPayslips, setFilteredPayslips] = useState<Payslip[]>([]);
  const [showCustomAllowances, setShowCustomAllowances] = useState(false);
  const [showCustomDeductions, setShowCustomDeductions] = useState(false);
  const [showBulkManager, setShowBulkManager] = useState(false);
  const [selectedPayslips, setSelectedPayslips] = useState<string[]>([]);
  const [selectAllPayslips, setSelectAllPayslips] = useState(false);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      const { data, error } = await supabase
        .from('payslips')
        .select('*')
        .order('employee_name');

      if (error) {
        console.error('Error fetching payslips:', error);
      } else {
        setPayslips(data || []);
      }
    } catch (error) {
      console.error('Error fetching payslips:', error);
    }
  };

  const handleSelectPayslip = (payslipId: string) => {
    if (selectedPayslips.includes(payslipId)) {
      setSelectedPayslips(selectedPayslips.filter(id => id !== payslipId));
    } else {
      setSelectedPayslips([...selectedPayslips, payslipId]);
    }
  };

  const handleSelectAllPayslips = () => {
    const currentPayslips = filteredPayslips.length > 0 ? filteredPayslips : payslips;
    if (selectAllPayslips) {
      setSelectedPayslips([]);
    } else {
      setSelectedPayslips(currentPayslips.map(p => p.id));
    }
    setSelectAllPayslips(!selectAllPayslips);
  };

  const handleMassDeletePayslips = async () => {
    if (selectedPayslips.length === 0) {
      toast({ title: "No payslips selected", variant: "destructive" });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedPayslips.length} payslip(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('payslips')
        .delete()
        .in('id', selectedPayslips);

      if (error) {
        console.error('Error deleting payslips:', error);
        toast({ title: "Error deleting payslips", variant: "destructive" });
      } else {
        toast({ title: `Successfully deleted ${selectedPayslips.length} payslip(s)` });
        setSelectedPayslips([]);
        setSelectAllPayslips(false);
        fetchPayslips();
      }
    } catch (error) {
      console.error('Mass delete error:', error);
      toast({ title: "Error during mass delete", variant: "destructive" });
    }
  };

  const handleCreate = () => {
    setSelectedPayslip(null);
    setIsEditing(true);
  };

  const handleEdit = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setIsEditing(true);
  };

  const handleView = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setIsPreviewOpen(true);
  };

  const handleCancel = () => {
    setSelectedPayslip(null);
    setIsEditing(false);
  };

  const handleExportIndividualPDF = (payslip: Payslip) => {
    exportByEmployee(payslips, payslip.employee_id, 'pdf');
  };

  const handleSave = async (payslipData: Payslip) => {
    try {
      if (selectedPayslip) {
        const { error } = await supabase
          .from('payslips')
          .update(payslipData)
          .eq('id', selectedPayslip.id);

        if (error) {
          console.error('Error updating payslip:', error);
        } else {
          setPayslips(payslips.map(p => (p.id === selectedPayslip.id ? { ...p, ...payslipData } : p)));
        }
      } else {
        const { error } = await supabase
          .from('payslips')
          .insert([payslipData]);

        if (error) {
          console.error('Error creating payslip:', error);
        } else {
          fetchPayslips();
        }
      }

      setIsEditing(false);
      setSelectedPayslip(null);
      fetchPayslips();
    } catch (error) {
      console.error('Error saving payslip:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payslips')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting payslip:', error);
      } else {
        setPayslips(payslips.filter(p => p.id !== id));
        setSelectedPayslip(null);
      }
      fetchPayslips();
    } catch (error) {
      console.error('Error deleting payslip:', error);
    }
  };

  const handleFilteredResults = (filtered: Payslip[]) => {
    setFilteredPayslips(filtered);
  };

  const getUniqueDesignations = () => {
    return [...new Set(payslips.map(p => p.designation))];
  };

  const getUniqueDepartments = () => {
    return [...new Set(payslips.map(p => p.department))];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Premium Header with Enhanced Styling */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-lg dark:bg-slate-900/80 dark:border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
                    RV Associates
                  </h1>
                  <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide dark:text-indigo-400">
                    Payroll Management System
                  </p>
                </div>
              </div>
              <p className="text-slate-600 text-lg max-w-md dark:text-slate-300">
                Enterprise payroll solution for seamless workforce management
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ThemeToggle />
              <Button 
                onClick={() => window.open('/portal', '_blank')}
                variant="outline"
                className="bg-white/90 backdrop-blur-sm hover:bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              >
                <FileText className="h-4 w-4 mr-2" />
                Document Portal
              </Button>
              <Button 
                onClick={logout} 
                variant="outline" 
                className="bg-white/90 backdrop-blur-sm hover:bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout ({user?.name})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <Tabs defaultValue="payslip" className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/70 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/20 dark:bg-slate-800/70 dark:border-slate-700/20">
            <TabsTrigger 
              value="payslip" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 dark:data-[state=active]:bg-slate-700 dark:text-slate-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Payslips
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 dark:data-[state=active]:bg-slate-700 dark:text-slate-300"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 dark:data-[state=active]:bg-slate-700 dark:text-slate-300"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl font-medium transition-all duration-200 dark:data-[state=active]:bg-slate-700 dark:text-slate-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payslip" className="space-y-6">
            <SearchFilter
              payslips={payslips}
              onFilteredResults={handleFilteredResults}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              departmentFilter={departmentFilter}
              onDepartmentChange={setDepartmentFilter}
              salaryRangeFilter={salaryRangeFilter}
              onSalaryRangeChange={setSalaryRangeFilter}
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2 dark:text-slate-100">
                  Employee Payslips
                </h2>
                <p className="text-slate-600 dark:text-slate-300">Manage and generate payroll documents</p>
              </div>
              <div className="flex gap-3">
                {selectedPayslips.length > 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={handleMassDeletePayslips}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected ({selectedPayslips.length})
                  </Button>
                )}
                <Button 
                  onClick={() => setShowBulkManager(true)} 
                  variant="outline"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import
                </Button>
                <Button 
                  onClick={handleCreate} 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Payslip
                </Button>
              </div>
            </div>

            {payslips.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg dark:bg-slate-800">
                <Checkbox
                  checked={selectAllPayslips}
                  onCheckedChange={handleSelectAllPayslips}
                  aria-label="Select all payslips"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select All Payslips ({filteredPayslips.length > 0 ? filteredPayslips.length : payslips.length})
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {(filteredPayslips.length > 0 ? filteredPayslips : payslips).map((payslip) => (
                <Card key={payslip.id} className="group bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden dark:bg-slate-800/90 dark:hover:bg-slate-800/95">
                  <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100 dark:from-slate-800 dark:to-slate-700 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-slate-800 group-hover:text-indigo-600 transition-colors dark:text-slate-100 dark:group-hover:text-indigo-400">
                        {payslip.employee_name}
                      </CardTitle>
                      <Checkbox
                        checked={selectedPayslips.includes(payslip.id)}
                        onCheckedChange={() => handleSelectPayslip(payslip.id)}
                        aria-label={`Select ${payslip.employee_name}`}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium dark:text-slate-400">Employee ID:</span>
                        <span className="text-slate-800 font-semibold dark:text-slate-200">{payslip.employee_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium dark:text-slate-400">Designation:</span>
                        <span className="text-slate-800 dark:text-slate-200">{payslip.designation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium dark:text-slate-400">Department:</span>
                        <span className="text-slate-800 dark:text-slate-200">{payslip.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium dark:text-slate-400">Period:</span>
                        <span className="text-slate-800 dark:text-slate-200">{payslip.pay_period}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium dark:text-slate-400">Net Salary:</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                            ₹{payslip.net_salary.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <Button variant="outline" size="sm" onClick={() => handleView(payslip)} className="hover:bg-blue-50 dark:hover:bg-blue-950">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExportIndividualPDF(payslip)} className="hover:bg-green-50 dark:hover:bg-green-950">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(payslip)} className="hover:bg-indigo-50 dark:hover:bg-indigo-950">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(payslip.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            <PayrollDashboard payslips={payslips} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2 dark:text-slate-100">
                System Configuration
              </h2>
              <p className="text-slate-600 mb-6 dark:text-slate-300">Customize allowances and deductions</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 dark:bg-slate-800/90">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 dark:from-blue-950/50 dark:to-indigo-950/50 dark:border-slate-700">
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Custom Allowances</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-600 mb-6 dark:text-slate-300">Configure custom allowance types for enhanced payroll flexibility.</p>
                  <Button 
                    onClick={() => setShowCustomAllowances(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Allowances
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 dark:bg-slate-800/90">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-slate-100 dark:from-red-950/50 dark:to-pink-950/50 dark:border-slate-700">
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Custom Deductions</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-600 mb-6 dark:text-slate-300">Configure custom deduction types for comprehensive payroll management.</p>
                  <Button 
                    onClick={() => setShowCustomDeductions(true)}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Deductions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2 dark:text-slate-100">
                Export & Reports
              </h2>
              <p className="text-slate-600 mb-6 dark:text-slate-300">Generate comprehensive payroll reports</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 dark:bg-slate-800/90">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-100 dark:from-green-950/50 dark:to-emerald-950/50 dark:border-slate-700">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100">All Payslips</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Button 
                    onClick={() => exportToExcel(payslips, `all_payslips_${new Date().toISOString().split('T')[0]}`)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Export to Excel
                  </Button>
                  <Button 
                    onClick={() => exportToCSV(payslips, `all_payslips_${new Date().toISOString().split('T')[0]}`)}
                    className="w-full"
                    variant="outline"
                  >
                    Export to CSV
                  </Button>
                  <Button 
                    onClick={() => exportToPDF(payslips, `all_payslips_${new Date().toISOString().split('T')[0]}`)}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Export to PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 dark:bg-slate-800/90">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-100 dark:from-blue-950/50 dark:to-cyan-950/50 dark:border-slate-700">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100">By Designation</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3 max-h-80 overflow-y-auto">
                  {getUniqueDesignations().map(designation => (
                    <div key={designation} className="space-y-2 p-3 bg-slate-50 rounded-lg dark:bg-slate-700">
                      <p className="font-medium text-sm text-slate-700 dark:text-slate-300">{designation}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportByDesignation(payslips, designation, 'excel')}
                          className="flex-1"
                        >
                          Excel
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportByDesignation(payslips, designation, 'csv')}
                          className="flex-1"
                        >
                          CSV
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportByDesignation(payslips, designation, 'pdf')}
                          className="flex-1"
                        >
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300 dark:bg-slate-800/90">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-slate-100 dark:from-purple-950/50 dark:to-violet-950/50 dark:border-slate-700">
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100">By Department</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3 max-h-80 overflow-y-auto">
                  {getUniqueDepartments().map(department => (
                    <div key={department} className="space-y-2 p-3 bg-slate-50 rounded-lg dark:bg-slate-700">
                      <p className="font-medium text-sm text-slate-700 dark:text-slate-300">{department}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportByDepartment(payslips, department, 'excel')}
                          className="flex-1"
                        >
                          Excel
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportByDepartment(payslips, department, 'csv')}
                          className="flex-1"
                        >
                          CSV
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportByDepartment(payslips, department, 'pdf')}
                          className="flex-1"
                        >
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Payslip Form */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-6xl w-full bg-white shadow-2xl border-0 max-h-[95vh] overflow-y-auto rounded-2xl dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 dark:from-slate-800 dark:to-slate-700 dark:border-slate-700">
                <CardTitle className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {selectedPayslip ? 'Edit Payslip' : 'Create Payslip'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <PayslipForm
                  payslip={selectedPayslip}
                  employeeProfiles={[]}
                  onSubmit={handleSave}
                  onClose={handleCancel}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payslip Preview */}
        {isPreviewOpen && selectedPayslip && (
          <PayslipPreview
            payslip={selectedPayslip}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}

        {/* Custom Allowances Manager */}
        {showCustomAllowances && (
          <CustomAllowancesManager onClose={() => setShowCustomAllowances(false)} />
        )}

        {/* Custom Deductions Manager */}
        {showCustomDeductions && (
          <CustomDeductionsManager onClose={() => setShowCustomDeductions(false)} />
        )}

        {/* Bulk Payroll Manager */}
        {showBulkManager && (
          <BulkPayrollManager
            onClose={() => setShowBulkManager(false)}
            onImportComplete={() => {
              fetchPayslips();
            }}
          />
        )}
      </div>

      {/* Premium Copyright Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-slate-200/60 mt-16 dark:bg-slate-900/80 dark:border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">RV Associates</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Payroll Management Solutions</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                © June 2025 RV Associates. All rights reserved.
              </p>
              <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                Enterprise Payroll Management System
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PayslipGenerator;
