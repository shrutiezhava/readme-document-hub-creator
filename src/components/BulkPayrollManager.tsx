
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import BulkImportUpload from './BulkImportUpload';
import ImportedDataManager from './ImportedDataManager';

interface BulkPayrollManagerProps {
  onClose: () => void;
  onImportComplete: () => void;
}

const BulkPayrollManager: React.FC<BulkPayrollManagerProps> = ({ onClose, onImportComplete }) => {
  const [currentView, setCurrentView] = useState<'upload' | 'manage'>('upload');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-7xl w-full bg-white shadow-2xl border-0 max-h-[95vh] overflow-y-auto rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-3">
              <Upload className="h-6 w-6" />
              Bulk Payroll Manager
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={() => setCurrentView('upload')}
              variant={currentView === 'upload' ? 'default' : 'outline'}
            >
              Upload Excel
            </Button>
            <Button 
              onClick={() => setCurrentView('manage')}
              variant={currentView === 'manage' ? 'default' : 'outline'}
            >
              Manage Imported Data
            </Button>
          </div>

          {currentView === 'upload' && (
            <BulkImportUpload 
              onImportComplete={() => {
                onImportComplete();
                setCurrentView('manage');
              }} 
            />
          )}

          {currentView === 'manage' && (
            <ImportedDataManager onConvertToPayslip={onImportComplete} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkPayrollManager;
