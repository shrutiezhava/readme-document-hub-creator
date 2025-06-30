
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDocumentPortalAuth } from '@/contexts/DocumentPortalAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Document, Company, Designation } from '@/types/document-portal';
import { FileText, Users, Building, LogOut, Folder, Settings } from 'lucide-react';
import DocumentManagement from './DocumentManagement';
import DocumentFolderView from './DocumentFolderView';
import CompaniesManager from './CompaniesManager';
import DesignationsManager from './DesignationsManager';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useDocumentPortalAuth();
  const [documentCount, setDocumentCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [designationCount, setDesignationCount] = useState(0);
  const [currentView, setCurrentView] = useState<'dashboard' | 'document-management' | 'folder-view' | 'companies' | 'designations'>('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [documentsRes, companiesRes, designationsRes] = await Promise.all([
        supabase
          .from('documents')
          .select('*', { count: 'exact' })
          .eq('is_active', true),
        supabase.from('companies').select('*', { count: 'exact' }),
        supabase.from('designations').select('*', { count: 'exact' })
      ]);

      setDocumentCount(documentsRes.count || 0);
      setCompanyCount(companiesRes.count || 0);
      setDesignationCount(designationsRes.count || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage documents, companies, and designations</p>
          </div>
          <Button onClick={logout} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Documents Card */}
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer bg-white border-slate-200"
            onClick={() => setCurrentView('document-management')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Documents</h3>
                    <p className="text-sm text-slate-500">{documentCount} files</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {documentCount}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Companies Card */}
          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer bg-white border-slate-200"
            onClick={() => setCurrentView('companies')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Companies</h3>
                    <p className="text-sm text-slate-500">{companyCount} companies</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {companyCount}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Designations Card */}
          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer bg-white border-slate-200"
            onClick={() => setCurrentView('designations')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Designations</h3>
                    <p className="text-sm text-slate-500">{designationCount} roles</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {designationCount}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Document Archive Card */}
          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer bg-white border-slate-200"
            onClick={() => setCurrentView('folder-view')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Folder className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Document Archive</h3>
                    <p className="text-sm text-slate-500">Browse by date</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Views */}
        {currentView === 'dashboard' && (
          <Card className="bg-white border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="text-slate-800">Dashboard Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Admin Control Center</h3>
                <p className="text-slate-600">
                  Use the cards above to manage documents, companies, and designations.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {currentView === 'document-management' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('dashboard')}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                ← Back to Dashboard
              </Button>
              <h2 className="text-xl font-semibold text-slate-900">Document Management</h2>
            </div>
            <DocumentManagement onBack={() => setCurrentView('dashboard')} />
          </div>
        )}

        {currentView === 'folder-view' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('dashboard')}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                ← Back to Dashboard
              </Button>
              <h2 className="text-xl font-semibold text-slate-900">Document Archive</h2>
            </div>
            <DocumentFolderView />
          </div>
        )}

        {currentView === 'companies' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('dashboard')}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                ← Back to Dashboard
              </Button>
              <h2 className="text-xl font-semibold text-slate-900">Companies Management</h2>
            </div>
            <CompaniesManager />
          </div>
        )}

        {currentView === 'designations' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('dashboard')}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                ← Back to Dashboard
              </Button>
              <h2 className="text-xl font-semibold text-slate-900">Designations Management</h2>
            </div>
            <DesignationsManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
