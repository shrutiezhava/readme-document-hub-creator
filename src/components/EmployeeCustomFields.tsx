
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface EmployeeCustomFieldsProps {
  employeeProfileId: string | null;
  onCustomFieldsChange: (allowances: any[], deductions: any[]) => void;
}

const EmployeeCustomFields: React.FC<EmployeeCustomFieldsProps> = ({ 
  employeeProfileId, 
  onCustomFieldsChange 
}) => {
  // Call the callback with empty arrays since we're using flexible payroll now
  React.useEffect(() => {
    onCustomFieldsChange([], []);
  }, [onCustomFieldsChange]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Custom Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              New Flexible Payroll System
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Employee custom fields are now handled dynamically through Excel uploads. 
              The system automatically detects and stores all data fields from your payroll files.
            </p>
            <p className="text-blue-700 text-sm">
              To manage employee allowances and deductions, use the Payroll Management section 
              and upload Excel files with the desired column structure.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeCustomFields;
