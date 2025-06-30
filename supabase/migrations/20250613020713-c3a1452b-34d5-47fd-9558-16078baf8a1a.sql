
-- Add tables for custom allowances and deductions
CREATE TABLE public.custom_allowances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  default_amount NUMERIC DEFAULT 0,
  is_percentage BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.custom_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  default_amount NUMERIC DEFAULT 0,
  is_percentage BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add employee profiles table to remember payroll data
CREATE TABLE public.employee_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  employee_name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_address TEXT NOT NULL,
  default_basic_salary NUMERIC DEFAULT 0,
  default_hra NUMERIC DEFAULT 0,
  default_transport_allowance NUMERIC DEFAULT 0,
  default_medical_allowance NUMERIC DEFAULT 0,
  default_other_allowances NUMERIC DEFAULT 0,
  default_pf_deduction NUMERIC DEFAULT 0,
  default_tax_deduction NUMERIC DEFAULT 0,
  default_insurance_deduction NUMERIC DEFAULT 0,
  default_other_deductions NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add tables to link custom allowances/deductions to employee profiles
CREATE TABLE public.employee_custom_allowances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_profile_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  custom_allowance_id UUID REFERENCES public.custom_allowances(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.employee_custom_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_profile_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  custom_deduction_id UUID REFERENCES public.custom_deductions(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.custom_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_custom_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_custom_deductions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for now (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on custom_allowances" ON public.custom_allowances FOR ALL USING (true);
CREATE POLICY "Allow all operations on custom_deductions" ON public.custom_deductions FOR ALL USING (true);
CREATE POLICY "Allow all operations on employee_profiles" ON public.employee_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on employee_custom_allowances" ON public.employee_custom_allowances FOR ALL USING (true);
CREATE POLICY "Allow all operations on employee_custom_deductions" ON public.employee_custom_deductions FOR ALL USING (true);
