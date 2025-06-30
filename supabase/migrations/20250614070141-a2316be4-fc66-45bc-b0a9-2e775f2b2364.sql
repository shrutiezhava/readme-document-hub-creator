
-- Add tables to store employee-specific custom allowances and deductions
CREATE TABLE IF NOT EXISTS public.employee_custom_allowances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_profile_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  custom_allowance_id UUID REFERENCES public.custom_allowances(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employee_custom_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_profile_id UUID REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  custom_deduction_id UUID REFERENCES public.custom_deductions(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints to link employee profiles with custom allowances/deductions
ALTER TABLE public.employee_custom_allowances 
ADD CONSTRAINT fk_employee_profile 
FOREIGN KEY (employee_profile_id) REFERENCES public.employee_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.employee_custom_allowances 
ADD CONSTRAINT fk_custom_allowance 
FOREIGN KEY (custom_allowance_id) REFERENCES public.custom_allowances(id) ON DELETE CASCADE;

ALTER TABLE public.employee_custom_deductions 
ADD CONSTRAINT fk_employee_profile_deduction 
FOREIGN KEY (employee_profile_id) REFERENCES public.employee_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.employee_custom_deductions 
ADD CONSTRAINT fk_custom_deduction 
FOREIGN KEY (custom_deduction_id) REFERENCES public.custom_deductions(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_custom_allowances_employee 
ON public.employee_custom_allowances(employee_profile_id);

CREATE INDEX IF NOT EXISTS idx_employee_custom_deductions_employee 
ON public.employee_custom_deductions(employee_profile_id);
