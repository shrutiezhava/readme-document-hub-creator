
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';

interface CustomDeductionsManagerProps {
  onClose: () => void;
}

const CustomDeductionsManager: React.FC<CustomDeductionsManagerProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Custom Deductions Manager</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              New Flexible Payroll System
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              The payroll system now uses a flexible structure that automatically adapts to your Excel files. 
              Custom deductions are now handled dynamically based on the columns in your uploaded files.
            </p>
            <p className="text-blue-700 text-sm">
              Simply upload your Excel file with any column structure, and the system will automatically detect and store all the data fields.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomDeductionsManager;
