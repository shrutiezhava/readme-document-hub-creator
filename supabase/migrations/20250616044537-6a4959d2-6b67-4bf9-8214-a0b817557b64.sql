
-- Remove existing payroll data and tables
DROP TABLE IF EXISTS public.employee_custom_allowances CASCADE;
DROP TABLE IF EXISTS public.employee_custom_deductions CASCADE;
DROP TABLE IF EXISTS public.employee_profiles CASCADE;
DROP TABLE IF EXISTS public.custom_allowances CASCADE;
DROP TABLE IF EXISTS public.custom_deductions CASCADE;
DROP TABLE IF EXISTS public.payslips CASCADE;

-- Create a flexible payroll data table that can store any Excel structure
CREATE TABLE public.payroll_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_name TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_name TEXT NOT NULL,
  total_records INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a flexible table to store actual payroll data with dynamic columns
CREATE TABLE public.payroll_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID REFERENCES public.payroll_uploads(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  data_json JSONB NOT NULL, -- Store all Excel data as JSON for flexibility
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payroll_data_upload_id ON public.payroll_data(upload_id);
CREATE INDEX IF NOT EXISTS idx_payroll_data_json ON public.payroll_data USING GIN (data_json);

-- Enable RLS
ALTER TABLE public.payroll_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_data ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for now
CREATE POLICY "Allow all operations on payroll_uploads" ON public.payroll_uploads FOR ALL USING (true);
CREATE POLICY "Allow all operations on payroll_data" ON public.payroll_data FOR ALL USING (true);

-- Create a view to make querying easier
CREATE OR REPLACE VIEW public.payroll_summary AS
SELECT 
  pu.id as upload_id,
  pu.upload_name,
  pu.upload_date,
  pu.file_name,
  pu.total_records,
  COUNT(pd.id) as actual_records,
  pu.created_at
FROM public.payroll_uploads pu
LEFT JOIN public.payroll_data pd ON pu.id = pd.upload_id
GROUP BY pu.id, pu.upload_name, pu.upload_date, pu.file_name, pu.total_records, pu.created_at
ORDER BY pu.created_at DESC;
