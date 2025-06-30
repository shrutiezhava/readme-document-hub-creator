
-- Add new columns to the payslips table
ALTER TABLE public.payslips 
ADD COLUMN serial_number INTEGER,
ADD COLUMN employee_code TEXT,
ADD COLUMN salary_fixed_part DECIMAL(10,2) DEFAULT 0,
ADD COLUMN salary_variable_part DECIMAL(10,2) DEFAULT 0,
ADD COLUMN working_days INTEGER DEFAULT 0,
ADD COLUMN present_days INTEGER DEFAULT 0,
ADD COLUMN os_hours DECIMAL(5,2) DEFAULT 0,
ADD COLUMN earned_basic DECIMAL(10,2) DEFAULT 0,
ADD COLUMN earned_hra DECIMAL(10,2) DEFAULT 0,
ADD COLUMN earned_os DECIMAL(10,2) DEFAULT 0,
ADD COLUMN other_earning DECIMAL(10,2) DEFAULT 0,
ADD COLUMN performance_allowance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN skill_allowance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN attendance_incentive DECIMAL(10,2) DEFAULT 0,
ADD COLUMN total_earning_gross DECIMAL(10,2) DEFAULT 0,
ADD COLUMN bank_name TEXT,
ADD COLUMN bank_account_number TEXT,
ADD COLUMN ifsc_code TEXT,
ADD COLUMN service_charge DECIMAL(10,2) DEFAULT 0;

-- Update the existing basic_salary column to be consistent with earned_basic if needed
-- (keeping both for backward compatibility)

-- Create an index for the new employee_code field for better performance
CREATE INDEX IF NOT EXISTS idx_payslips_employee_code ON public.payslips(employee_code);
CREATE INDEX IF NOT EXISTS idx_payslips_serial_number ON public.payslips(serial_number);
