
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { Payslip } from '@/types/payslip';

interface SearchFilterProps {
  payslips: Payslip[];
  onFilteredResults: (filtered: Payslip[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  departmentFilter: string;
  onDepartmentChange: (dept: string) => void;
  salaryRangeFilter: string;
  onSalaryRangeChange: (range: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  payslips,
  onFilteredResults,
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  salaryRangeFilter,
  onSalaryRangeChange,
}) => {
  const departments = [...new Set(payslips.map(p => p.department).filter(dept => dept && dept.trim() !== ''))];
  
  const salaryRanges = [
    { value: 'all', label: 'All Salaries' },
    { value: '0-30000', label: '₹0 - ₹30,000' },
    { value: '30000-50000', label: '₹30,000 - ₹50,000' },
    { value: '50000-75000', label: '₹50,000 - ₹75,000' },
    { value: '75000-100000', label: '₹75,000 - ₹1,00,000' },
    { value: '100000+', label: '₹1,00,000+' },
  ];

  const applyFilters = React.useCallback(() => {
    let filtered = payslips;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payslip =>
        payslip.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payslip.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payslip.designation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter && departmentFilter !== 'all') {
      filtered = filtered.filter(payslip => payslip.department === departmentFilter);
    }

    // Salary range filter
    if (salaryRangeFilter && salaryRangeFilter !== 'all') {
      filtered = filtered.filter(payslip => {
        const salary = payslip.net_salary;
        switch (salaryRangeFilter) {
          case '0-30000':
            return salary >= 0 && salary <= 30000;
          case '30000-50000':
            return salary > 30000 && salary <= 50000;
          case '50000-75000':
            return salary > 50000 && salary <= 75000;
          case '75000-100000':
            return salary > 75000 && salary <= 100000;
          case '100000+':
            return salary > 100000;
          default:
            return true;
        }
      });
    }

    onFilteredResults(filtered);
  }, [payslips, searchTerm, departmentFilter, salaryRangeFilter, onFilteredResults]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const clearFilters = () => {
    onSearchChange('');
    onDepartmentChange('all');
    onSalaryRangeChange('all');
  };

  const hasActiveFilters = searchTerm || (departmentFilter && departmentFilter !== 'all') || (salaryRangeFilter && salaryRangeFilter !== 'all');

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-0 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, ID, or designation..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Department Filter */}
        <div className="w-full lg:w-48">
          <Select value={departmentFilter || "all"} onValueChange={onDepartmentChange}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept || "unknown"}>
                  {dept || "Unknown Department"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Salary Range Filter */}
        <div className="w-full lg:w-48">
          <Select value={salaryRangeFilter || "all"} onValueChange={onSalaryRangeChange}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Salary Range" />
            </SelectTrigger>
            <SelectContent>
              {salaryRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="h-11 px-4 border-gray-300 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}

        {/* Filter Icon */}
        <div className="flex items-center gap-2 text-gray-500">
          <Filter className="h-4 w-4" />
          <span className="text-sm">
            {hasActiveFilters ? 'Filters applied' : 'No filters'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
