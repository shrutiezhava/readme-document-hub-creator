
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Company, Designation } from '@/types/document-portal';

interface FilterState {
  company: string;
  designation: string;
  month: string;
  year: string;
  search: string;
}

interface DocumentFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  companies: Company[];
  designations: Designation[];
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  setFilters,
  companies,
  designations
}) => {
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const clearFilters = () => {
    setFilters({
      company: 'all',
      designation: 'all',
      month: 'all',
      year: currentYear.toString(),
      search: ''
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Company</label>
          <Select value={filters.company || "all"} onValueChange={(value) => setFilters({ ...filters, company: value === "all" ? "all" : value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id || "unknown"}>
                  {company.name || "Unknown Company"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Designation</label>
          <Select value={filters.designation || "all"} onValueChange={(value) => setFilters({ ...filters, designation: value === "all" ? "all" : value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Designations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Designations</SelectItem>
              {designations.map((designation) => (
                <SelectItem key={designation.id} value={designation.id || "unknown"}>
                  {designation.title || "Unknown Designation"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Month</label>
          <Select value={filters.month || "all"} onValueChange={(value) => setFilters({ ...filters, month: value === "all" ? "all" : value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Year</label>
          <Select value={filters.year || currentYear.toString()} onValueChange={(value) => setFilters({ ...filters, year: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default DocumentFilters;
