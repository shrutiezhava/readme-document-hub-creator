export interface Payslip {
  id: string;
  serial_number?: number;
  employee_name: string;
  employee_id: string;
  employee_code?: string;
  designation: string;
  department: string;
  pay_period: string;
  
  // Salary Breakup
  basic_salary: number;
  salary_fixed_part?: number;
  salary_variable_part?: number;
  
  // Attendance
  working_days?: number;
  present_days?: number;
  os_hours?: number;
  
  // Earned Wages
  earned_basic?: number;
  earned_hra?: number;
  earned_os?: number;
  other_earning?: number;
  performance_allowance?: number;
  skill_allowance?: number;
  attendance_incentive?: number;
  
  // Legacy allowances (keeping for backward compatibility)
  hra: number;
  transport_allowance: number;
  medical_allowance: number;
  other_allowances: number;
  
  // Total
  total_earning_gross?: number;
  
  // Deductions
  pf_deduction: number;
  tax_deduction: number;
  insurance_deduction: number;
  other_deductions: number;
  net_salary: number;
  
  // Bank Details
  bank_name?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  service_charge?: number;
  
  company_name: string;
  company_address: string;
  created_at?: string;
  updated_at?: string;
}

export interface PayslipFormData {
  serial_number?: number;
  employee_name: string;
  employee_id: string;
  employee_code?: string;
  designation: string;
  department: string;
  pay_period: string;
  
  // Salary Breakup
  basic_salary: number;
  salary_fixed_part?: number;
  salary_variable_part?: number;
  
  // Attendance
  working_days?: number;
  present_days?: number;
  os_hours?: number;
  
  // Earned Wages
  earned_basic?: number;
  earned_hra?: number;
  earned_os?: number;
  other_earning?: number;
  performance_allowance?: number;
  skill_allowance?: number;
  attendance_incentive?: number;
  
  // Legacy allowances
  hra: number;
  transport_allowance: number;
  medical_allowance: number;
  other_allowances: number;
  
  // Total
  total_earning_gross?: number;
  
  // Deductions
  pf_deduction: number;
  tax_deduction: number;
  insurance_deduction: number;
  other_deductions: number;
  net_salary: number;
  
  // Bank Details
  bank_name?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  service_charge?: number;
  
  company_name: string;
  company_address: string;
}
