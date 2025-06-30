
-- Create payslips table
CREATE TABLE public.payslips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  pay_period TEXT NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL,
  hra DECIMAL(10,2) DEFAULT 0,
  transport_allowance DECIMAL(10,2) DEFAULT 0,
  medical_allowance DECIMAL(10,2) DEFAULT 0,
  other_allowances DECIMAL(10,2) DEFAULT 0,
  pf_deduction DECIMAL(10,2) DEFAULT 0,
  tax_deduction DECIMAL(10,2) DEFAULT 0,
  insurance_deduction DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  company_name TEXT NOT NULL DEFAULT 'Your Company Name',
  company_address TEXT NOT NULL DEFAULT 'Company Address',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (for future authentication if needed)
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (can be restricted later with authentication)
CREATE POLICY "Allow all operations on payslips" 
  ON public.payslips 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- Insert example payslip data
INSERT INTO public.payslips (
  employee_name, employee_id, designation, department, pay_period,
  basic_salary, hra, transport_allowance, medical_allowance, other_allowances,
  pf_deduction, tax_deduction, insurance_deduction, other_deductions,
  net_salary, company_name, company_address
) VALUES 
(
  'John Smith', 'EMP001', 'Software Engineer', 'IT Department', 'January 2024',
  5000.00, 1000.00, 500.00, 300.00, 200.00,
  600.00, 800.00, 150.00, 50.00,
  5400.00, 'Tech Solutions Inc.', '123 Business Street, Tech City, TC 12345'
),
(
  'Sarah Johnson', 'EMP002', 'Product Manager', 'Product', 'January 2024',
  7000.00, 1400.00, 500.00, 300.00, 300.00,
  840.00, 1200.00, 200.00, 60.00,
  7200.00, 'Tech Solutions Inc.', '123 Business Street, Tech City, TC 12345'
),
(
  'Mike Davis', 'EMP003', 'Marketing Specialist', 'Marketing', 'January 2024',
  4500.00, 900.00, 400.00, 250.00, 150.00,
  540.00, 700.00, 120.00, 40.00,
  4800.00, 'Tech Solutions Inc.', '123 Business Street, Tech City, TC 12345'
),
(
  'Emily Chen', 'EMP004', 'UX Designer', 'Design', 'January 2024',
  5500.00, 1100.00, 450.00, 275.00, 175.00,
  660.00, 850.00, 140.00, 45.00,
  5845.00, 'Tech Solutions Inc.', '123 Business Street, Tech City, TC 12345'
),
(
  'Alex Rodriguez', 'EMP005', 'Sales Manager', 'Sales', 'January 2024',
  6500.00, 1300.00, 600.00, 300.00, 400.00,
  780.00, 1050.00, 180.00, 70.00,
  7020.00, 'Tech Solutions Inc.', '123 Business Street, Tech City, TC 12345'
);
