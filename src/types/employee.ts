
export interface CustomAllowance {
  id: string;
  name: string;
  description?: string;
  default_amount: number;
  is_percentage: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomDeduction {
  id: string;
  name: string;
  description?: string;
  default_amount: number;
  is_percentage: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeProfile {
  id: string;
  employee_id: string;
  employee_name: string;
  designation: string;
  department: string;
  company_name: string;
  company_address: string;
  default_basic_salary: number;
  default_hra: number;
  default_transport_allowance: number;
  default_medical_allowance: number;
  default_other_allowances: number;
  default_pf_deduction: number;
  default_tax_deduction: number;
  default_insurance_deduction: number;
  default_other_deductions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  custom_allowances?: EmployeeCustomAllowance[];
  custom_deductions?: EmployeeCustomDeduction[];
}

export interface EmployeeCustomAllowance {
  id: string;
  employee_profile_id: string;
  custom_allowance_id: string;
  amount: number;
  created_at: string;
  custom_allowance?: CustomAllowance;
}

export interface EmployeeCustomDeduction {
  id: string;
  employee_profile_id: string;
  custom_deduction_id: string;
  amount: number;
  created_at: string;
  custom_deduction?: CustomDeduction;
}
