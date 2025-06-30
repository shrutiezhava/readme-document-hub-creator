
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Company } from '@/types/document-portal';

interface DocumentInfoFormSectionProps {
  companies: Company[];
  months: { value: string; label: string }[];
  years: number[];
  formData: any;
  setFormData: (data: any) => void;
}

const DocumentInfoFormSection: React.FC<DocumentInfoFormSectionProps> = ({
  companies,
  months,
  years,
  formData,
  setFormData,
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">Document Information</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="company">Company Name *</Label>
        <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Enter location"
          required
        />
      </div>
      <div>
        <Label htmlFor="month">Month *</Label>
        <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="year">Year *</Label>
        <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
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
    <div>
      <Label className="text-sm font-medium">Labour Type *</Label>
      <RadioGroup
        value={formData.labour_type}
        onValueChange={(value) => setFormData({ ...formData, labour_type: value })}
        className="flex gap-6 mt-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="FTE" id="fte" />
          <Label htmlFor="fte">FTE</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="CE" id="ce" />
          <Label htmlFor="ce">CE</Label>
        </div>
      </RadioGroup>
    </div>
    <div>
      <Label htmlFor="nature_of_work">Nature Of Work</Label>
      <Input
        id="nature_of_work"
        value={formData.nature_of_work}
        onChange={(e) => setFormData({ ...formData, nature_of_work: e.target.value })}
        placeholder="Enter nature of work"
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="pf_challan_no">PF Challan No</Label>
        <Input
          id="pf_challan_no"
          value={formData.pf_challan_no}
          onChange={(e) => setFormData({ ...formData, pf_challan_no: e.target.value })}
          placeholder="Enter PF challan number"
        />
      </div>
      <div>
        <Label htmlFor="pf_challan_date">PF Challan Date</Label>
        <Input
          id="pf_challan_date"
          type="date"
          value={formData.pf_challan_date}
          onChange={(e) => setFormData({ ...formData, pf_challan_date: e.target.value })}
        />
      </div>
    </div>
  </div>
);

export default DocumentInfoFormSection;
