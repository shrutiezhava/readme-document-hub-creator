
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/types/document-portal';

const CompaniesManager: React.FC = () => {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCompanyName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([{ name: newCompanyName.trim() }])
        .select()
        .single();

      if (error) throw error;

      setCompanies([...companies, data]);
      setNewCompanyName('');
      toast({
        title: "Success",
        description: "Company added successfully"
      });
    } catch (error) {
      console.error('Error adding company:', error);
      toast({
        title: "Error",
        description: "Failed to add company",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const { error } = await supabase
        .from('companies')
        .update({ name: editingName.trim() })
        .eq('id', id);

      if (error) throw error;

      setCompanies(companies.map(company => 
        company.id === id ? { ...company, name: editingName.trim() } : company
      ));
      setEditingId(null);
      setEditingName('');
      toast({
        title: "Success",
        description: "Company updated successfully"
      });
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Error",
        description: "Failed to update company",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCompanies(companies.filter(company => company.id !== id));
      toast({
        title: "Success",
        description: "Company deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive"
      });
    }
  };

  const startEdit = (company: Company) => {
    setEditingId(company.id);
    setEditingName(company.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-600">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-slate-800">Add New Company</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              placeholder="Company name"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1"
            />
            <Button 
              onClick={handleAdd}
              disabled={!newCompanyName.trim()}
              className="bg-slate-800 hover:bg-slate-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-slate-800">Companies ({companies.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {companies.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No companies found. Add one above to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-slate-700">Company Name</TableHead>
                  <TableHead className="text-slate-700">Created</TableHead>
                  <TableHead className="text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id} className="border-slate-200">
                    <TableCell>
                      {editingId === company.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleEdit(company.id)}
                          className="max-w-xs"
                        />
                      ) : (
                        <span className="text-slate-800 font-medium">{company.name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(company.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === company.id ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(company.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="border-slate-300 text-slate-600 hover:bg-slate-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(company)}
                            className="border-slate-300 text-slate-600 hover:bg-slate-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(company.id, company.name)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompaniesManager;
