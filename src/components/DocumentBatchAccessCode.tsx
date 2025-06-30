
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface DocumentBatchAccessCodeProps {
  accessCode: string;
  monthLabel: string;
  year: string;
  onCopy: (code: string) => void;
  onDone: () => void;
}

const DocumentBatchAccessCode: React.FC<DocumentBatchAccessCodeProps> = ({
  accessCode,
  monthLabel,
  year,
  onCopy,
  onDone,
}) => (
  <div className="space-y-6 text-center">
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-800 mb-2">Documents Uploaded Successfully!</h3>
      <p className="text-green-700 mb-4">Share this access code with clients to view this month's documents:</p>
      <div className="bg-white border-2 border-green-300 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-mono font-bold text-green-800">{accessCode}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy(accessCode)}
            className="ml-2"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-green-600">
        This code provides access to all documents uploaded for {monthLabel} {year}
      </p>
    </div>
    <Button onClick={onDone} className="w-full">
      Done
    </Button>
  </div>
);

export default DocumentBatchAccessCode;
