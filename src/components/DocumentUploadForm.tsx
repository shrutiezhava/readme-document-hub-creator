
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DocumentBatchAccessCode from "./DocumentBatchAccessCode";
import DocumentInfoFormSection from "./DocumentInfoFormSection";
import DocumentFileUploadSection from "./DocumentFileUploadSection";
import { useDocumentUploadForm } from "@/hooks/useDocumentUploadForm";
import { Company, Designation } from "@/types/document-portal";

interface DocumentUploadFormProps {
  companies: Company[];
  designations: Designation[];
  onClose: () => void;
  onSuccess: () => void;
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  companies,
  designations,
  onClose,
  onSuccess,
}) => {
  const {
    formData,
    setFormData,
    files,
    loading,
    batchAccessCode,
    handleFileChange,
    handleSubmit,
    handleClose,
    fileInputs,
    copyToClipboard,
    months,
    years,
  } = useDocumentUploadForm({ companies, designations, onClose, onSuccess });

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Compliance Documents</DialogTitle>
        </DialogHeader>

        {batchAccessCode ? (
          <DocumentBatchAccessCode
            accessCode={batchAccessCode}
            monthLabel={months.find((m) => m.value === formData.month)?.label || ""}
            year={formData.year}
            onCopy={copyToClipboard}
            onDone={handleClose}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <DocumentInfoFormSection
              companies={companies}
              months={months}
              years={years}
              formData={formData}
              setFormData={setFormData}
            />
            <DocumentFileUploadSection
              fileInputs={fileInputs}
              files={files}
              onFileChange={handleFileChange}
            />
            <div className="flex gap-2 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  // @ts-ignore - lucide
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v6m8-8V6.828a2 2 0 0 0-.586-1.414l-4.828-4.828A2 2 0 0 0 13.172 0H6a2 2 0 0 0-2 2v14" /></svg>
                )}
                Upload Documents & Generate Access Code
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadForm;

