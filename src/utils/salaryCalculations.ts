
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
    // Fallback calculation without bulk items - NEVER return 0 for net salary
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

// Function to fix existing payslips with zero net salary
export const recalculatePayslipNetSalary = async (payslipId: string) => {
  try {
    const { data: payslip, error } = await supabase
      .from('payslips')
      .select('*')
      .eq('id', payslipId)
      .single();

    if (error || !payslip) {
      console.error('Error fetching payslip:', error);
      return false;
    }

    // Calculate proper gross salary including all allowances
    const grossSalary = Number(payslip.basic_salary || 0) + 
                       Number(payslip.hra || 0) + 
                       Number(payslip.transport_allowance || 0) + 
                       Number(payslip.medical_allowance || 0) + 
                       Number(payslip.other_allowances || 0) + 
                       Number(payslip.performance_allowance || 0) +
                       Number(payslip.earned_basic || 0) +
                       Number(payslip.earned_hra || 0) +
                       Number(payslip.earned_os || 0) +
                       Number(payslip.other_earning || 0) +
                       Number(payslip.skill_allowance || 0) +
                       Number(payslip.attendance_incentive || 0);
    
    // Calculate total deductions
    const totalDeductions = Number(payslip.pf_deduction || 0) + 
                           Number(payslip.tax_deduction || 0) + 
                           Number(payslip.insurance_deduction || 0) + 
                           Number(payslip.other_deductions || 0) +
                           Number(payslip.service_charge || 0);
    
    // Calculate net salary - this should NEVER be hardcoded to 0
    const netSalary = grossSalary - totalDeductions;

    console.log(`Recalculating payslip ${payslipId}: Gross=${grossSalary}, Deductions=${totalDeductions}, Net=${netSalary}`);

    // Update the payslip with calculated values
    const { error: updateError } = await supabase
      .from('payslips')
      .update({ 
        net_salary: netSalary,
        total_earning_gross: grossSalary
      })
      .eq('id', payslipId);

    if (updateError) {
      console.error('Error updating payslip:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error recalculating payslip:', error);
    return false;
  }
};

// Function to bulk fix all payslips with zero net salary
export const fixAllZeroNetSalaryPayslips = async () => {
  try {
    // Fetch payslips with zero OR null net salary
    const { data: payslips, error } = await supabase
      .from('payslips')
      .select('*')
      .or('net_salary.eq.0,net_salary.is.null');

    if (error) {
      console.error('Error fetching zero net salary payslips:', error);
      return { success: false, count: 0 };
    }

    console.log(`Found ${payslips?.length || 0} payslips with zero/null net salary`);

    let fixedCount = 0;
    for (const payslip of payslips || []) {
      const success = await recalculatePayslipNetSalary(payslip.id);
      if (success) fixedCount++;
    }

    console.log(`Fixed ${fixedCount} payslips`);
    return { success: true, count: fixedCount };
  } catch (error) {
    console.error('Error fixing zero net salary payslips:', error);
    return { success: false, count: 0 };
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
