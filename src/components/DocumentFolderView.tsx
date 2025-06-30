import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Folder, FileText, Download, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/document-portal';
import { useDocumentPortalAuth } from '@/contexts/DocumentPortalAuthContext';
import { toast } from '@/components/ui/use-toast';

interface DocumentFolder {
  monthYear: string;
  displayName: string;
  documentCount: number;
  documents: Document[];
}

interface YearFolder {
  year: number;
  displayName: string;
  documentCount: number;
  months: DocumentFolder[];
}

const DocumentFolderView: React.FC = () => {
  const { user } = useDocumentPortalAuth();
  const [yearFolders, setYearFolders] = useState<YearFolder[]>([]);
  const [selectedYear, setSelectedYear] = useState<YearFolder | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDocumentFolders();
    }
  }, [user]);

  const fetchDocumentFolders = async () => {
    try {
      setIsLoading(true);
      const { data: documents, error } = await supabase
        .from('documents')
        .select(`
          *,
          company:companies(*),
          designation:designations(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Find the earliest document year, default to current year if no documents
      const currentYear = new Date().getFullYear();
      const earliestYear = documents && documents.length > 0 
        ? Math.min(...documents.map(doc => new Date(doc.created_at).getFullYear()))
        : currentYear;

      // Generate all years from earliest to 2100
      const allYears = Array.from(
        { length: 2100 - earliestYear + 1 }, 
        (_, i) => earliestYear + i
      );

      // Group documents by year and month
      const yearMap = new Map<number, Map<string, Document[]>>();
      
      // Initialize all years
      allYears.forEach(year => {
        yearMap.set(year, new Map());
      });

      // Populate with actual documents
      documents?.forEach((doc) => {
        const date = new Date(doc.created_at);
        const year = date.getFullYear();
        const monthYear = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!yearMap.get(year)!.has(monthYear)) {
          yearMap.get(year)!.set(monthYear, []);
        }
        yearMap.get(year)!.get(monthYear)!.push(doc);
      });

      // Convert to year folder objects and sort by year (newest first)
      const yearArray: YearFolder[] = allYears
        .map(year => {
          const monthMap = yearMap.get(year)!;
          const months: DocumentFolder[] = Array.from(monthMap.entries())
            .map(([monthYear, docs]) => {
              const [yearStr, monthStr] = monthYear.split('-');
              const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1);
              const displayName = date.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              });
              
              return {
                monthYear,
                displayName,
                documentCount: docs.length,
                documents: docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              };
            })
            .sort((a, b) => {
              const [yearA, monthA] = a.monthYear.split('-').map(Number);
              const [yearB, monthB] = b.monthYear.split('-').map(Number);
              return yearB - yearA || monthB - monthA;
            });

          const totalDocuments = months.reduce((sum, month) => sum + month.documentCount, 0);

          return {
            year,
            displayName: year.toString(),
            documentCount: totalDocuments,
            months
          };
        })
        .sort((a, b) => b.year - a.year); // Sort years newest first

      setYearFolders(yearArray);
    } catch (error) {
      console.error('Error fetching document folders:', error);
      toast({
        title: "Error",
        description: "Failed to load document folders",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      console.log('Attempting to download:', document.file_path);
      
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) {
        console.error('Download error:', error);
        window.open(document.file_path, '_blank');
        return;
      }

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
      window.open(document.file_path, '_blank');
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
      month: 'short',
      day: 'numeric'
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96 bg-white border-slate-200">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  // Show individual document contents
  if (selectedFolder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedFolder(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {selectedYear?.displayName}
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{selectedFolder.displayName}</h2>
            <p className="text-slate-600">{selectedFolder.documentCount} documents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedFolder.documents.map((document) => (
            <Card key={document.id} className="bg-white border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <span className="truncate">{document.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      {document.company?.name}
                    </Badge>
                    <Badge variant="outline" className="border-slate-300 text-slate-600">
                      {document.designation?.title}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><strong>File:</strong> {document.filename}</p>
                    {document.file_size && (
                      <p><strong>Size:</strong> {formatFileSize(document.file_size)}</p>
                    )}
                    <p><strong>Access Code:</strong> 
                      <code className="ml-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-800">
                        {document.access_code}
                      </code>
                    </p>
                    <p><strong>Uploaded:</strong> {formatDate(document.created_at)}</p>
                  </div>

                  <Button 
                    onClick={() => handleDownload(document)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedFolder.documents.length === 0 && (
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6 text-center py-8">
              <p className="text-slate-600">No documents found in this folder.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Show month folders for selected year
  if (selectedYear) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedYear(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Years
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{selectedYear.displayName}</h2>
            <p className="text-slate-600">{selectedYear.documentCount} documents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {selectedYear.months.map((folder) => (
            <Card 
              key={folder.monthYear} 
              className="bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedFolder(folder)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Folder className="w-8 h-8 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{folder.displayName}</h3>
                    <Badge variant="secondary" className="mt-2 bg-slate-100 text-slate-700">
                      {folder.documentCount} {folder.documentCount === 1 ? 'document' : 'documents'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedYear.months.length === 0 && (
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6 text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <Folder className="w-16 h-16 text-slate-400" />
                <div>
                  <h3 className="text-lg font-medium text-slate-900">No Documents Yet for {selectedYear.displayName}</h3>
                  <p className="text-slate-600">Upload documents to see them organized by month.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Show year folders
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {yearFolders.map((yearFolder) => (
          <Card 
            key={yearFolder.year} 
            className={`bg-white border-slate-200 hover:shadow-md transition-shadow cursor-pointer ${
              yearFolder.documentCount === 0 ? 'opacity-60' : ''
            }`}
            onClick={() => setSelectedYear(yearFolder)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  yearFolder.documentCount > 0 ? 'bg-slate-100' : 'bg-slate-50'
                }`}>
                  <Folder className={`w-8 h-8 ${
                    yearFolder.documentCount > 0 ? 'text-slate-600' : 'text-slate-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{yearFolder.displayName}</h3>
                  <Badge variant="secondary" className="mt-2 bg-slate-100 text-slate-700">
                    {yearFolder.documentCount} {yearFolder.documentCount === 1 ? 'document' : 'documents'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {yearFolders.length === 0 && (
        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6 text-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <Folder className="w-16 h-16 text-slate-400" />
              <div>
                <h3 className="text-lg font-medium text-slate-900">No Documents Yet</h3>
                <p className="text-slate-600">Upload documents to see them organized by year and month.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentFolderView;
