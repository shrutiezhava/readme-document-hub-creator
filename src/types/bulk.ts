
export interface BulkAllowance {
  id: string;
  name: string;
  description?: string;
  amount: number;
  is_percentage: boolean;
  month_year: string;
  created_at: string;
  updated_at: string;
}

export interface BulkDeduction {
  id: string;
  name: string;
  description?: string;
  amount: number;
  is_percentage: boolean;
  month_year: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeBulkAllowance {
  id: string;
  employee_id: string;
  bulk_allowance_id: string;
  custom_amount?: number;
  is_applied: boolean;
  created_at: string;
  bulk_allowance?: BulkAllowance;
}

export interface EmployeeBulkDeduction {
  id: string;
  employee_id: string;
  bulk_deduction_id: string;
  custom_amount?: number;
  is_applied: boolean;
  created_at: string;
  bulk_deduction?: BulkDeduction;
}

export interface MonthlyPayslipSummary {
  pay_period: string;
  total_payslips: number;
  departments_count: number;
  total_net_salary: number;
  average_net_salary: number;
  min_net_salary: number;
  max_net_salary: number;
}

export interface BulkFormData {
  name: string;
  description?: string;
  amount: number;
  is_percentage: boolean;
  month_year: string;
  apply_to_all?: boolean;
  selected_employees?: string[];
}
