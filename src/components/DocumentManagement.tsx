import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document, Company, Designation } from '@/types/document-portal';
import { useDocumentPortalAuth } from '@/contexts/DocumentPortalAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Filter, Upload, Pen, Trash, Eye } from 'lucide-react';
import DocumentUploadForm from './DocumentUploadForm';
import DocumentEditForm from './DocumentEditForm';
import DocumentFilters from './DocumentFilters';

interface DocumentManagementProps {
  onBack: () => void;
}

interface FilterState {
  company: string;
  designation: string;
  month: string;
  year: string;
  search: string;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ onBack }) => {
  const { user } = useDocumentPortalAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    company: '',
    designation: '',
    month: '',
    year: new Date().getFullYear().toString(),
    search: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchFilteredDocuments();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [documentsRes, companiesRes, designationsRes] = await Promise.all([
        supabase
          .from('documents')
          .select(`
            *,
            company:companies(*),
            designation:designations(*)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase.from('companies').select('*').order('name'),
        supabase.from('designations').select('*').order('title')
      ]);

      if (documentsRes.error) throw documentsRes.error;
      if (companiesRes.error) throw companiesRes.error;
      if (designationsRes.error) throw designationsRes.error;

      setDocuments(documentsRes.data || []);
      setCompanies(companiesRes.data || []);
      setDesignations(designationsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredDocuments = async () => {
    try {
      let query = supabase
        .from('documents')
        .select(`
          *,
          company:companies(*),
          designation:designations(*)
        `)
        .eq('is_active', true);

      if (filters.company) {
        query = query.eq('company_id', filters.company);
      }

      if (filters.designation) {
        query = query.eq('designation_id', filters.designation);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,filename.ilike.%${filters.search}%`);
      }

      if (filters.month && filters.year) {
        const startDate = new Date(parseInt(filters.year), parseInt(filters.month) - 1, 1);
        const endDate = new Date(parseInt(filters.year), parseInt(filters.month), 0, 23, 59, 59);
        query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
      } else if (filters.year) {
        const startDate = new Date(parseInt(filters.year), 0, 1);
        const endDate = new Date(parseInt(filters.year), 11, 31, 23, 59, 59);
        query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching filtered documents:', error);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ is_active: false })
        .eq('id', documentId);

      if (error) throw error;

      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast({
        title: "Success",
        description: "Document deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = async (document: Document) => {
    try {
      const duplicateData = {
        title: `${document.title} (Copy)`,
        filename: document.filename,
        file_path: document.file_path,
        file_size: document.file_size,
        content_type: document.content_type,
        company_id: document.company_id,
        designation_id: document.designation_id,
        access_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        uploaded_by: user?.id
      };

      const { error } = await supabase
        .from('documents')
        .insert([duplicateData]);

      if (error) throw error;

      await fetchFilteredDocuments();
      toast({
        title: "Success",
        description: "Document duplicated successfully"
      });
    } catch (error) {
      console.error('Error duplicating document:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate document",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600 mt-2">Manage compliance documents by month and company</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Back to Dashboard
            </Button>
            <Button onClick={() => setShowUploadForm(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search documents..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <DocumentFilters
                filters={filters}
                setFilters={setFilters}
                companies={companies}
                designations={designations}
              />
            )}
          </CardContent>
        </Card>

        {/* Enhanced Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate pr-2">{document.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(document.file_path, '_blank')}
                      title="View Document"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDocument(document)}
                      title="Edit Document"
                    >
                      <Pen className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(document)}
                      title="Duplicate Document"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(document.id)}
                      title="Delete Document"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{document.company?.name}</Badge>
                    <Badge variant="outline">{document.designation?.title}</Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>File:</strong> {document.filename}</p>
                    {document.file_size && (
                      <p><strong>Size:</strong> {formatFileSize(document.file_size)}</p>
                    )}
                    <p><strong>Access Code:</strong> 
                      <code className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs">
                        {document.access_code}
                      </code>
                    </p>
                    <p><strong>Uploaded:</strong> {formatDate(document.created_at)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(document.file_path, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setEditingDocument(document)}
                    >
                      <Pen className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {documents.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">No documents found matching your criteria.</p>
            </CardContent>
          </Card>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <DocumentUploadForm
            companies={companies}
            designations={designations}
            onClose={() => setShowUploadForm(false)}
            onSuccess={() => {
              setShowUploadForm(false);
              fetchFilteredDocuments();
            }}
          />
        )}

        {/* Edit Form Modal */}
        {editingDocument && (
          <DocumentEditForm
            document={editingDocument}
            companies={companies}
            designations={designations}
            onClose={() => setEditingDocument(null)}
            onSuccess={() => {
              setEditingDocument(null);
              fetchFilteredDocuments();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentManagement;
