
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { BulkAllowance, BulkDeduction, BulkFormData } from '@/types/bulk';

interface BulkAllowancesManagerProps {
  onClose: () => void;
}

const BulkAllowancesManager: React.FC<BulkAllowancesManagerProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'allowances' | 'deductions'>('allowances');
  const [allowances, setAllowances] = useState<BulkAllowance[]>([]);
  const [deductions, setDeductions] = useState<BulkDeduction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BulkAllowance | BulkDeduction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  const [formData, setFormData] = useState<BulkFormData>({
    name: '',
    description: '',
    amount: 0,
    is_percentage: false,
    month_year: selectedMonth,
    apply_to_all: true,
    selected_employees: []
  });

  useEffect(() => {
    fetchBulkItems();
  }, [selectedMonth]);

  const fetchBulkItems = async () => {
    try {
      // Fetch allowances
      const { data: allowancesData, error: allowancesError } = await supabase
        .from('bulk_allowances')
        .select('*')
        .eq('month_year', selectedMonth)
        .order('created_at', { ascending: false });

      if (allowancesError) throw allowancesError;
      setAllowances(allowancesData || []);

      // Fetch deductions
      const { data: deductionsData, error: deductionsError } = await supabase
        .from('bulk_deductions')
        .select('*')
        .eq('month_year', selectedMonth)
        .order('created_at', { ascending: false });

      if (deductionsError) throw deductionsError;
      setDeductions(deductionsData || []);

    } catch (error) {
      console.error('Error fetching bulk items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bulk items",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const table = activeTab === 'allowances' ? 'bulk_allowances' : 'bulk_deductions';
      
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from(table)
          .update({
            name: formData.name,
            description: formData.description,
            amount: formData.amount,
            is_percentage: formData.is_percentage,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({ title: "Success", description: `${activeTab.slice(0, -1)} updated successfully` });
      } else {
        // Create new item
        const { error } = await supabase
          .from(table)
          .insert({
            name: formData.name,
            description: formData.description,
            amount: formData.amount,
            is_percentage: formData.is_percentage,
            month_year: formData.month_year
          });

        if (error) throw error;
        toast({ title: "Success", description: `${activeTab.slice(0, -1)} created successfully` });
      }

      resetForm();
      fetchBulkItems();
    } catch (error) {
      console.error('Error saving bulk item:', error);
      toast({
        title: "Error",
        description: "Failed to save bulk item",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;

    try {
      const table = activeTab === 'allowances' ? 'bulk_allowances' : 'bulk_deductions';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Success", description: `${activeTab.slice(0, -1)} deleted successfully` });
      fetchBulkItems();
    } catch (error) {
      console.error('Error deleting bulk item:', error);
      toast({
        title: "Error",
        description: "Failed to delete bulk item",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: 0,
      is_percentage: false,
      month_year: selectedMonth,
      apply_to_all: true,
      selected_employees: []
    });
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: BulkAllowance | BulkDeduction) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      amount: item.amount,
      is_percentage: item.is_percentage,
      month_year: item.month_year,
      apply_to_all: true,
      selected_employees: []
    });
    setShowForm(true);
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = -6; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  };

  const currentItems = activeTab === 'allowances' ? allowances : deductions;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Allowances & Deductions Manager
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Month Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Label>Month:</Label>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <Button
              variant={activeTab === 'allowances' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('allowances')}
              className="border-b-2 border-transparent data-[state=active]:border-blue-500"
            >
              Allowances ({allowances.length})
            </Button>
            <Button
              variant={activeTab === 'deductions' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('deductions')}
              className="border-b-2 border-transparent data-[state=active]:border-blue-500"
            >
              Deductions ({deductions.length})
            </Button>
          </div>

          {/* Add New Button */}
          <Button onClick={() => setShowForm(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New {activeTab === 'allowances' ? 'Allowance' : 'Deduction'}
          </Button>

          {/* Form */}
          {showForm && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle>
                  {editingItem ? 'Edit' : 'Add New'} {activeTab === 'allowances' ? 'Allowance' : 'Deduction'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        placeholder="e.g., Transport Allowance, Medical Insurance"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Optional description..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_percentage"
                      checked={formData.is_percentage}
                      onCheckedChange={(checked) => setFormData({...formData, is_percentage: checked as boolean})}
                    />
                    <Label htmlFor="is_percentage">This is a percentage of basic salary</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingItem ? 'Update' : 'Create'} {activeTab === 'allowances' ? 'Allowance' : 'Deduction'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'allowances' ? 'Allowances' : 'Deductions'} for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No {activeTab} found for this month. Add some to get started!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          {item.is_percentage ? `${item.amount}%` : `₹${item.amount.toLocaleString()}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.is_percentage ? 'secondary' : 'default'}>
                            {item.is_percentage ? 'Percentage' : 'Fixed Amount'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.description || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkAllowancesManager;
