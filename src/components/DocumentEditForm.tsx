
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Document, Company, Designation } from '@/types/document-portal';
import { Pen } from 'lucide-react';

interface DocumentEditFormProps {
  document: Document;
  companies: Company[];
  designations: Designation[];
  onClose: () => void;
  onSuccess: () => void;
}

const DocumentEditForm: React.FC<DocumentEditFormProps> = ({
  document,
  companies,
  designations,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: document.title,
    company_id: document.company_id || 'select_company',
    designation_id: document.designation_id || 'select_designation'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.company_id === 'select_company' || formData.designation_id === 'select_designation') {
      toast({
        title: "Error",
        description: "Please select both company and designation",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          title: formData.title,
          company_id: formData.company_id,
          designation_id: formData.designation_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document updated successfully"
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Document Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter document title"
              required
            />
          </div>

          <div>
            <Label htmlFor="company">Company *</Label>
            <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select_company" disabled>Select company</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id || "unknown"}>
                    {company.name || "Unknown Company"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="designation">Designation *</Label>
            <Select value={formData.designation_id} onValueChange={(value) => setFormData({ ...formData, designation_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select_designation" disabled>Select designation</SelectItem>
                {designations.map((designation) => (
                  <SelectItem key={designation.id} value={designation.id || "unknown"}>
                    {designation.title || "Unknown Designation"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Current File:</strong> {document.filename}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Access Code:</strong> {document.access_code}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Pen className="w-4 h-4 mr-2" />
              )}
              Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentEditForm;
