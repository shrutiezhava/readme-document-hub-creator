
-- Create tables for bulk allowances and deductions
CREATE TABLE public.bulk_allowances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_percentage BOOLEAN NOT NULL DEFAULT false,
  month_year TEXT NOT NULL, -- Format: "2025-04" for April 2025
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.bulk_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_percentage BOOLEAN NOT NULL DEFAULT false,
  month_year TEXT NOT NULL, -- Format: "2025-04" for April 2025
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction tables for employee-specific bulk entries
CREATE TABLE public.employee_bulk_allowances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  bulk_allowance_id UUID REFERENCES public.bulk_allowances(id) ON DELETE CASCADE,
  custom_amount DECIMAL(10,2), -- Override amount for specific employee
  is_applied BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.employee_bulk_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  bulk_deduction_id UUID REFERENCES public.bulk_deductions(id) ON DELETE CASCADE,
  custom_amount DECIMAL(10,2), -- Override amount for specific employee
  is_applied BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_bulk_allowances_month_year ON public.bulk_allowances(month_year);
CREATE INDEX idx_bulk_deductions_month_year ON public.bulk_deductions(month_year);
CREATE INDEX idx_employee_bulk_allowances_employee_id ON public.employee_bulk_allowances(employee_id);
CREATE INDEX idx_employee_bulk_deductions_employee_id ON public.employee_bulk_deductions(employee_id);
CREATE INDEX idx_payslips_pay_period ON public.payslips(pay_period);

-- Enable RLS on all tables
ALTER TABLE public.bulk_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_bulk_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_bulk_deductions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for now (you can make them more restrictive later)
CREATE POLICY "Allow all operations on bulk_allowances" ON public.bulk_allowances FOR ALL USING (true);
CREATE POLICY "Allow all operations on bulk_deductions" ON public.bulk_deductions FOR ALL USING (true);
CREATE POLICY "Allow all operations on employee_bulk_allowances" ON public.employee_bulk_allowances FOR ALL USING (true);
CREATE POLICY "Allow all operations on employee_bulk_deductions" ON public.employee_bulk_deductions FOR ALL USING (true);

-- Create a view for easy monthly payslip analysis
CREATE OR REPLACE VIEW public.monthly_payslip_summary AS
SELECT 
  pay_period,
  COUNT(*) as total_payslips,
  COUNT(DISTINCT department) as departments_count,
  SUM(net_salary) as total_net_salary,
  AVG(net_salary) as average_net_salary,
  MIN(net_salary) as min_net_salary,
  MAX(net_salary) as max_net_salary
FROM public.payslips
GROUP BY pay_period
ORDER BY pay_period DESC;
