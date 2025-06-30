
import { supabase } from '@/integrations/supabase/client';
import { BulkAllowance, BulkDeduction, EmployeeBulkAllowance, EmployeeBulkDeduction } from '@/types/bulk';

export interface SalaryBreakdown {
  basicSalary: number;
  allowances: {
    hra: number;
    transport: number;
    medical: number;
    performance: number;
    other: number;
    bulk: number;
  };
  deductions: {
    pf: number;
    tax: number;
    insurance: number;
    other: number;
    bulk: number;
  };
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

export const calculateNetSalary = async (
  employeeId: string,
  basicSalary: number,
  allowances: {
    hra: number;
    transport: number;
    medical: number;
    performance: number;
    other: number;
  },
  deductions: {
    pf: number;
    tax: number;
    insurance: number;
    other: number;
  },
  monthYear: string
): Promise<SalaryBreakdown> => {
  try {
    // Fetch bulk allowances for this employee and month
    const { data: bulkAllowances, error: allowancesError } = await supabase
      .from('employee_bulk_allowances')
      .select(`
        *,
        bulk_allowance:bulk_allowances(*)
      `)
      .eq('employee_id', employeeId)
      .eq('is_applied', true);

    if (allowancesError) throw allowancesError;

    // Fetch bulk deductions for this employee and month
    const { data: bulkDeductions, error: deductionsError } = await supabase
      .from('employee_bulk_deductions')
      .select(`
        *,
        bulk_deduction:bulk_deductions(*)
      `)
      .eq('employee_id', employeeId)
      .eq('is_applied', true);

    if (deductionsError) throw deductionsError;

    // Calculate bulk allowances
    let totalBulkAllowances = 0;
    if (bulkAllowances) {
      for (const empAllowance of bulkAllowances) {
        const allowance = empAllowance.bulk_allowance;
        if (allowance && allowance.month_year === monthYear) {
          const amount = empAllowance.custom_amount || allowance.amount;
          if (allowance.is_percentage) {
            totalBulkAllowances += (basicSalary * amount) / 100;
          } else {
            totalBulkAllowances += amount;
          }
        }
      }
    }

    // Calculate bulk deductions
    let totalBulkDeductions = 0;
    if (bulkDeductions) {
      for (const empDeduction of bulkDeductions) {
        const deduction = empDeduction.bulk_deduction;
        if (deduction && deduction.month_year === monthYear) {
          const amount = empDeduction.custom_amount || deduction.amount;
          if (deduction.is_percentage) {
            totalBulkDeductions += (basicSalary * amount) / 100;
          } else {
            totalBulkDeductions += amount;
          }
        }
      }
    }

    // Calculate totals
    const totalAllowances = allowances.hra + allowances.transport + allowances.medical + 
                           allowances.performance + allowances.other + totalBulkAllowances;
    
    const grossSalary = basicSalary + totalAllowances;
    
    const totalDeductions = deductions.pf + deductions.tax + deductions.insurance + 
                           deductions.other + totalBulkDeductions;
    
    const netSalary = grossSalary - totalDeductions;

    return {
      basicSalary,
      allowances: {
        hra: allowances.hra,
        transport: allowances.transport,
        medical: allowances.medical,
        performance: allowances.performance,
        other: allowances.other,
        bulk: totalBulkAllowances
      },
      deductions: {
        pf: deductions.pf,
        tax: deductions.tax,
        insurance: deductions.insurance,
        other: deductions.other,
        bulk: totalBulkDeductions
      },
      grossSalary,
      totalDeductions,
      netSalary
    };

  } catch (error) {
    console.error('Error calculating net salary:', error);
    // Fallback calculation without bulk items
    const totalAllowances = allowances.hra + allowances.transport + allowances.medical + 
                           allowances.performance + allowances.other;
    const grossSalary = basicSalary + totalAllowances;
    const totalDeductions = deductions.pf + deductions.tax + deductions.insurance + deductions.other;
    const netSalary = grossSalary - totalDeductions;

    return {
      basicSalary,
      allowances: {
        hra: allowances.hra,
        transport: allowances.transport,
        medical: allowances.medical,
        performance: allowances.performance,
        other: allowances.other,
        bulk: 0
      },
      deductions: {
        pf: deductions.pf,
        tax: deductions.tax,
        insurance: deductions.insurance,
        other: deductions.other,
        bulk: 0
      },
      grossSalary,
      totalDeductions,
      netSalary
    };
  }
};

export const applyBulkAllowancesToEmployee = async (
  employeeId: string,
  monthYear: string,
  bulkAllowanceIds: string[]
) => {
  try {
    // Remove existing bulk allowances for this employee and month
    await supabase
      .from('employee_bulk_allowances')
      .delete()
      .eq('employee_id', employeeId);

    // Add new bulk allowances
    const insertData = bulkAllowanceIds.map(allowanceId => ({
      employee_id: employeeId,
      bulk_allowance_id: allowanceId,
      is_applied: true
    }));

    const { error } = await supabase
      .from('employee_bulk_allowances')
      .insert(insertData);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error applying bulk allowances:', error);
    return false;
  }
};

export const applyBulkDeductionsToEmployee = async (
  employeeId: string,
  monthYear: string,
  bulkDeductionIds: string[]
) => {
  try {
    // Remove existing bulk deductions for this employee and month
    await supabase
      .from('employee_bulk_deductions')
      .delete()
      .eq('employee_id', employeeId);

    // Add new bulk deductions
    const insertData = bulkDeductionIds.map(deductionId => ({
      employee_id: employeeId,
      bulk_deduction_id: deductionId,
      is_applied: true
    }));

    const { error } = await supabase
      .from('employee_bulk_deductions')
      .insert(insertData);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error applying bulk deductions:', error);
    return false;
  }
};
