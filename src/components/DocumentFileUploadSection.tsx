
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FileInputConfig {
  key: string;
  label: string;
}

interface DocumentFileUploadSectionProps {
  fileInputs: FileInputConfig[];
  files: Record<string, File | null>;
  onFileChange: (key: string, file: File | null) => void;
}

const DocumentFileUploadSection: React.FC<DocumentFileUploadSectionProps> = ({
  fileInputs,
  files,
  onFileChange,
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">Upload All Necessary Documents Here</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fileInputs.map((fileInput) => (
        <div key={fileInput.key} className="space-y-2">
          <Label htmlFor={fileInput.key}>{fileInput.label}</Label>
          <Input
            id={fileInput.key}
            type="file"
            onChange={(e) => onFileChange(fileInput.key, e.target.files?.[0] || null)}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {files[fileInput.key] && (
            <p className="text-xs text-gray-600">
              Selected: {files[fileInput.key]!.name} ({(files[fileInput.key]!.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default DocumentFileUploadSection;
