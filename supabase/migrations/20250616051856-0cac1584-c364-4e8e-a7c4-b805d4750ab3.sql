
-- Create the payslips table to store individual payslip records
CREATE TABLE public.payslips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  pay_period TEXT NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  hra DECIMAL(10,2) NOT NULL DEFAULT 0,
  transport_allowance DECIMAL(10,2) NOT NULL DEFAULT 0,
  medical_allowance DECIMAL(10,2) NOT NULL DEFAULT 0,
  other_allowances DECIMAL(10,2) NOT NULL DEFAULT 0,
  pf_deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
  insurance_deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
  other_deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  company_name TEXT NOT NULL DEFAULT 'RV Associates',
  company_address TEXT NOT NULL DEFAULT 'Aarya Exotica, opposite KD-10, Bil, Vadodara 391410',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- Create policies for payslips access (allowing all operations for now)
CREATE POLICY "Allow all operations on payslips" 
  ON public.payslips 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create an index for faster employee lookups
CREATE INDEX idx_payslips_employee_id ON public.payslips(employee_id);
CREATE INDEX idx_payslips_created_at ON public.payslips(created_at);
