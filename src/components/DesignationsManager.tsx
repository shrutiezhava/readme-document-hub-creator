
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Designation } from '@/types/document-portal';

const DesignationsManager: React.FC = () => {
  const { toast } = useToast();
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [newDesignationTitle, setNewDesignationTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      const { data, error } = await supabase
        .from('designations')
        .select('*')
        .order('title');

      if (error) throw error;
      setDesignations(data || []);
    } catch (error) {
      console.error('Error fetching designations:', error);
      toast({
        title: "Error",
        description: "Failed to load designations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newDesignationTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('designations')
        .insert([{ title: newDesignationTitle.trim() }])
        .select()
        .single();

      if (error) throw error;

      setDesignations([...designations, data]);
      setNewDesignationTitle('');
      toast({
        title: "Success",
        description: "Designation added successfully"
      });
    } catch (error) {
      console.error('Error adding designation:', error);
      toast({
        title: "Error",
        description: "Failed to add designation",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (id: string) => {
    if (!editingTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('designations')
        .update({ title: editingTitle.trim() })
        .eq('id', id);

      if (error) throw error;

      setDesignations(designations.map(designation => 
        designation.id === id ? { ...designation, title: editingTitle.trim() } : designation
      ));
      setEditingId(null);
      setEditingTitle('');
      toast({
        title: "Success",
        description: "Designation updated successfully"
      });
    } catch (error) {
      console.error('Error updating designation:', error);
      toast({
        title: "Error",
        description: "Failed to update designation",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('designations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDesignations(designations.filter(designation => designation.id !== id));
      toast({
        title: "Success",
        description: "Designation deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting designation:', error);
      toast({
        title: "Error",
        description: "Failed to delete designation",
        variant: "destructive"
      });
    }
  };

  const startEdit = (designation: Designation) => {
    setEditingId(designation.id);
    setEditingTitle(designation.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-600">Loading designations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-slate-800">Add New Designation</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              placeholder="Designation title"
              value={newDesignationTitle}
              onChange={(e) => setNewDesignationTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1"
            />
            <Button 
              onClick={handleAdd}
              disabled={!newDesignationTitle.trim()}
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
          <CardTitle className="text-slate-800">Designations ({designations.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {designations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No designations found. Add one above to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-slate-700">Designation Title</TableHead>
                  <TableHead className="text-slate-700">Created</TableHead>
                  <TableHead className="text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {designations.map((designation) => (
                  <TableRow key={designation.id} className="border-slate-200">
                    <TableCell>
                      {editingId === designation.id ? (
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleEdit(designation.id)}
                          className="max-w-xs"
                        />
                      ) : (
                        <span className="text-slate-800 font-medium">{designation.title}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(designation.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === designation.id ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(designation.id)}
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
                            onClick={() => startEdit(designation)}
                            className="border-slate-300 text-slate-600 hover:bg-slate-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(designation.id, designation.title)}
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

export default DesignationsManager;
