
import { Company } from "@/types/document-portal";

export const generateBatchAccessCode = (
  companies: Company[],
  company_id: string,
  months: { value: string; label: string }[],
  formData: { month: string, year: string }
) => {
  const company = companies.find((c) => c.id === company_id);
  const monthName = months.find((m) => m.value === formData.month)?.label;
  const prefix = company?.name.substring(0, 3).toUpperCase() || "DOC";
  const monthCode = monthName?.substring(0, 3).toUpperCase() || "XXX";
  const yearCode = formData.year.substring(2);
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${monthCode}${yearCode}-${randomCode}`;
};

export const generateAccessCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

