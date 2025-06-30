
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileText, Download, LogOut, Search } from 'lucide-react';
import { useDocumentPortalAuth } from '@/contexts/DocumentPortalAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/document-portal';
import { toast } from '@/components/ui/use-toast';

const ClientAccess: React.FC = () => {
  const { user, logout } = useDocumentPortalAuth();
  const [accessCode, setAccessCode] = useState('');
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccessDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setIsLoading(true);
    try {
      console.log('Searching for document with access code:', accessCode.trim());

      // First, let's check what documents exist
      const { data: allDocs, error: allDocsError } = await supabase
        .from('documents')
        .select('access_code, title, is_active')
        .eq('is_active', true);

      console.log('All active documents:', allDocs);

      const { data: docData, error } = await supabase
        .from('documents')
        .select(`
          *,
          company:companies(*),
          designation:designations(*)
        `)
        .eq('access_code', accessCode.trim())
        .eq('is_active', true)
        .maybeSingle();

      console.log('Search result:', { docData, error });

      if (error) {
        console.error('Database query error:', error);
        toast({
          title: "Database Error",
          description: "Failed to search for document. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!docData) {
        toast({
          title: "Document Not Found",
          description: `No active document found with access code: ${accessCode.trim()}`,
          variant: "destructive",
        });
        return;
      }

      setDocument(docData);

      // Log the access
      const { error: logError } = await supabase.from('document_access_logs').insert({
        document_id: docData.id,
        user_id: user?.id,
        access_code: accessCode.trim(),
        ip_address: 'client_ip',
        user_agent: navigator.userAgent
      });

      if (logError) {
        console.error('Failed to log access:', logError);
      }

      toast({
        title: "Document Found",
        description: "Document is ready for download.",
      });
    } catch (error) {
      console.error('Access error:', error);
      toast({
        title: "Error",
        description: "Failed to access document.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      console.log('Attempting to download:', document.file_path);
      
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) {
        console.error('Download error:', error);
        // Try direct URL access as fallback
        window.open(document.file_path, '_blank');
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your document is being downloaded.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document. Trying direct access...",
        variant: "destructive",
      });
      // Fallback: open in new tab
      window.open(document.file_path, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Document Access</h1>
            <p className="text-gray-600">Welcome, {user?.full_name}</p>
          </div>
          <Button onClick={logout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Access Form */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Enter Access Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccessDocument} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Document Access Code</Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Enter your access code (e.g., ABC123)"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Access Document'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Document Display */}
        {document && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{document.title}</h3>
                  <p className="text-gray-600">{document.company?.name} • {document.designation?.title}</p>
                  <p className="text-sm text-gray-500">File: {document.filename}</p>
                  <p className="text-sm text-gray-500">Access Code: {document.access_code}</p>
                </div>
                <Button onClick={handleDownload} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Document
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientAccess;
