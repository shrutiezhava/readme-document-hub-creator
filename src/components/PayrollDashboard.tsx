
import React, { useState } from 'react';
import { BarChart3, FileText, Upload, Plus } from 'lucide-react';
import PayslipGenerator from './PayslipGenerator';
import BulkImportUpload from './BulkImportUpload';
import PayslipManagement from './PayslipManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BulkPayrollManager from './BulkPayrollManager';
import { Payslip } from '@/types/payslip';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
}

interface PayrollDashboardProps {
  payslips?: Payslip[];
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </CardContent>
  </Card>
);

const PayrollDashboard: React.FC<PayrollDashboardProps> = ({ payslips = [] }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showBulkManager, setShowBulkManager] = useState(false);
  
  // Calculate dashboard metrics from payslips
  const totalEmployees = payslips.length;
  const uniqueDepartments = [...new Set(payslips.map(p => p.department))].length;
  const averageSalary = payslips.length > 0 
    ? Math.round(payslips.reduce((sum, p) => sum + Number(p.net_salary), 0) / payslips.length)
    : 0;
  const totalPayrollCost = payslips.reduce((sum, p) => sum + Number(p.net_salary), 0);

  const handleOpenBulkManager = () => {
    setShowBulkManager(true);
  };

  const handleCloseBulkManager = () => {
    setShowBulkManager(false);
  };

  const refreshData = () => {
    // Add any refresh logic here
    console.log('Refreshing payroll data...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Payroll Dashboard
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'payslips', label: 'Manage Payslips', icon: FileText },
                { id: 'bulk-import', label: 'Excel Import', icon: Upload },
                { id: 'generator', label: 'Manual Entry', icon: Plus },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard title="Total Employees" value={totalEmployees} description="Active employees" />
              <DashboardCard title="Departments" value={uniqueDepartments} description="Number of departments" />
              <DashboardCard title="Average Salary" value={`₹${averageSalary.toLocaleString()}`} description="Per month" />
              <DashboardCard title="Total Payroll Cost" value={`₹${totalPayrollCost.toLocaleString()}`} description="Monthly payroll expense" />
            </div>
          )}

          {activeTab === 'payslips' && (
            <PayslipManagement />
          )}

          {activeTab === 'bulk-import' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <BulkImportUpload onImportComplete={refreshData} />
            </div>
          )}

          {activeTab === 'generator' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <PayslipGenerator />
            </div>
          )}
        </div>
      </div>

      {/* Bulk Manager Modal */}
      {showBulkManager && (
        <BulkPayrollManager onClose={handleCloseBulkManager} onImportComplete={refreshData} />
      )}
    </div>
  );
};

export default PayrollDashboard;
