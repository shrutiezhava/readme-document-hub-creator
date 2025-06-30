
import React from 'react';
import { DocumentPortalAuthProvider, useDocumentPortalAuth } from '@/contexts/DocumentPortalAuthContext';
import DocumentPortalLogin from '@/components/DocumentPortalLogin';
import AdminDashboard from '@/components/AdminDashboard';
import ClientAccess from '@/components/ClientAccess';

const DocumentPortalContent: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useDocumentPortalAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <DocumentPortalLogin />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <ClientAccess />;
};

const DocumentPortal: React.FC = () => {
  return (
    <DocumentPortalAuthProvider>
      <DocumentPortalContent />
    </DocumentPortalAuthProvider>
  );
};

export default DocumentPortal;
