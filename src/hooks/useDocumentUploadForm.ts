
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentPortalAuth } from "@/contexts/DocumentPortalAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Company, Designation } from "@/types/document-portal";
import { uploadFile } from "@/utils/documentUploadUtils";
import { generateBatchAccessCode, generateAccessCode } from "@/utils/documentUploadHelpers";

interface FileUploadState {
  [key: string]: File | null;
}

const initialFiles: FileUploadState = {
  pf_challan: null,
  pf_challan_payment_receipt: null,
  form_17: null,
  pf_ecr_copy: null,
  id_card_registered: null,
  form_28: null,
  esic_ecr_copy: null,
  esic_payment_receipt: null,
  bank_payment_sheet: null,
  invoices_copies: null,
  professional_tax_receipt: null,
  gst_r1: null,
  gst_r3b: null,
  payslips: null,
  joining_forms: null,
};

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const useDocumentUploadForm = ({
  companies,
  designations,
  onClose,
  onSuccess,
}: {
  companies: Company[];
  designations: Designation[];
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { user } = useDocumentPortalAuth();
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const [loading, setLoading] = useState(false);
  const [batchAccessCode, setBatchAccessCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_id: "",
    location: "",
    month: "",
    year: new Date().getFullYear().toString(),
    labour_type: "",
    nature_of_work: "",
    pf_challan_no: "",
    pf_challan_date: "",
  });

  const [files, setFiles] = useState<FileUploadState>({ ...initialFiles });

  const fileInputs = [
    { key: "pf_challan", label: "PF Challan" },
    { key: "pf_challan_payment_receipt", label: "PF Challan Payment Receipt" },
    { key: "form_17", label: "Form 17 (Wages Registered Certified)" },
    { key: "pf_ecr_copy", label: "PF ECR Copy" },
    { key: "id_card_registered", label: "ID Card Registered Updated" },
    { key: "form_28", label: "Form 28 (Master Roll)" },
    { key: "esic_ecr_copy", label: "ESIC ECR Copy" },
    { key: "esic_payment_receipt", label: "ESIC Payment Receipt" },
    { key: "bank_payment_sheet", label: "Bank Payment Sheet" },
    { key: "invoices_copies", label: "Invoices Copies" },
    { key: "professional_tax_receipt", label: "Professional Tax Receipt" },
    { key: "gst_r1", label: "GST R1" },
    { key: "gst_r3b", label: "GST R3B" },
    { key: "payslips", label: "Payslips (Upload)" },
    { key: "joining_forms", label: "Joining Forms (Upload)" },
  ];

  const handleFileChange = (key: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Access code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getComplianceDesignationId = () => {
    // Look for "Compliance Officer" which is the actual designation in the database
    const complianceDesignation = designations.find(
      (d) => d.title.trim().toLowerCase() === "compliance officer"
    );
    return complianceDesignation?.id || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_id || !formData.location || !formData.month || !formData.labour_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check compliance designation before proceeding
    const complianceDesignationId = getComplianceDesignationId();
    if (!complianceDesignationId) {
      toast({
        title: "Error",
        description: "Compliance Officer designation not found in system. Please contact admin.",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one file is selected
    const hasFiles = Object.values(files).some((file) => file !== null);
    if (!hasFiles) {
      toast({
        title: "Error",
        description: "Please select at least one document to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate a batch access code for this month's documents
      const generatedBatchCode = generateBatchAccessCode(
        companies,
        formData.company_id,
        months,
        { month: formData.month, year: formData.year }
      );

      // Upload files and create document records
      let lastError = null;
      for (const [key, file] of Object.entries(files)) {
        if (file) {
          try {
            const fileName = `${Date.now()}_${key}`;
            const fileUrl = await uploadFile(file, fileName);

            const { error: insertError } = await supabase
              .from("documents")
              .insert({
                title: fileInputs.find((f) => f.key === key)?.label || key,
                filename: file.name,
                file_path: fileUrl,
                file_size: file.size,
                content_type: file.type,
                company_id: formData.company_id,
                designation_id: complianceDesignationId,
                access_code: generateAccessCode(),
                uploaded_by: user?.id,
                is_active: true,
              });

            if (insertError) {
              lastError = insertError;
              throw insertError;
            }
          } catch (fileError) {
            lastError = fileError;
            throw fileError;
          }
        }
      }

      setBatchAccessCode(generatedBatchCode);

      toast({
        title: "Success",
        description: "Documents uploaded successfully! Share the batch access code with clients.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload documents: " + (error?.message || JSON.stringify(error)),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (batchAccessCode) {
      onSuccess();
    }
    onClose();
  };

  return {
    formData,
    setFormData,
    files,
    setFiles,
    fileInputs,
    loading,
    batchAccessCode,
    handleFileChange,
    handleSubmit,
    handleClose,
    copyToClipboard,
    months,
    years,
  };
};
