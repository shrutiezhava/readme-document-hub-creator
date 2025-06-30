
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Payslip } from '@/types/payslip';

export const exportToExcel = (payslips: Payslip[], filename: string) => {
  const workbook = XLSX.utils.book_new();
  
  const data = payslips.map(payslip => ({
    'S. No.': payslip.serial_number || '',
    'Employee Code': payslip.employee_code || payslip.employee_id,
    'Employee Name': payslip.employee_name,
    'Designation': payslip.designation,
    'Department': payslip.department,
    'Pay Period': payslip.pay_period,
    
    // Salary Breakup
    'Fixed Part': payslip.salary_fixed_part || 0,
    'Variable Part': payslip.salary_variable_part || 0,
    
    // Attendance
    'W Day': payslip.working_days || 0,
    'Present': payslip.present_days || 0,
    'OS Hours': payslip.os_hours || 0,
    
    // Earned Wages
    'Basic': payslip.earned_basic || payslip.basic_salary || 0,
    'HRA': payslip.earned_hra || payslip.hra || 0,
    'OS': payslip.earned_os || 0,
    'Other Earning': payslip.other_earning || 0,
    'Performance Allowance': payslip.performance_allowance || 0,
    'Skill Allowance': payslip.skill_allowance || 0,
    'Att. Incentive/Att. Bonus': payslip.attendance_incentive || 0,
    
    // Legacy allowances
    'Transport Allowance': payslip.transport_allowance,
    'Medical Allowance': payslip.medical_allowance,
    'Other Allowances': payslip.other_allowances,
    
    'Total Earning (Gross)': payslip.total_earning_gross || 0,
    
    // Deductions
    'PF Deduction': payslip.pf_deduction,
    'Tax Deduction': payslip.tax_deduction,
    'Insurance Deduction': payslip.insurance_deduction,
    'Other Deductions': payslip.other_deductions,
    
    // Bank Details
    'Bank Name': payslip.bank_name || '',
    'Bank Account Number': payslip.bank_account_number || '',
    'IFSC Code': payslip.ifsc_code || '',
    'Service Charge': payslip.service_charge || 0,
    
    'Net Salary': payslip.net_salary,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payslips');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToCSV = (payslips: Payslip[], filename: string) => {
  const data = payslips.map(payslip => ({
    'S. No.': payslip.serial_number || '',
    'Employee Code': payslip.employee_code || payslip.employee_id,
    'Employee Name': payslip.employee_name,
    'Designation': payslip.designation,
    'Department': payslip.department,
    'Pay Period': payslip.pay_period,
    'Fixed Part': payslip.salary_fixed_part || 0,
    'Variable Part': payslip.salary_variable_part || 0,
    'W Day': payslip.working_days || 0,
    'Present': payslip.present_days || 0,
    'OS Hours': payslip.os_hours || 0,
    'Basic': payslip.earned_basic || payslip.basic_salary || 0,
    'HRA': payslip.earned_hra || payslip.hra || 0,
    'OS': payslip.earned_os || 0,
    'Other Earning': payslip.other_earning || 0,
    'Performance Allowance': payslip.performance_allowance || 0,
    'Skill Allowance': payslip.skill_allowance || 0,
    'Att. Incentive': payslip.attendance_incentive || 0,
    'Total Earning (Gross)': payslip.total_earning_gross || 0,
    'PF Deduction': payslip.pf_deduction,
    'Tax Deduction': payslip.tax_deduction,
    'Insurance Deduction': payslip.insurance_deduction,
    'Other Deductions': payslip.other_deductions,
    'Bank Name': payslip.bank_name || '',
    'Bank Account Number': payslip.bank_account_number || '',
    'IFSC Code': payslip.ifsc_code || '',
    'Service Charge': payslip.service_charge || 0,
    'Net Salary': payslip.net_salary,
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payslips');
  XLSX.writeFile(workbook, `${filename}.csv`);
};

export const exportToPDF = (payslips: Payslip[], filename: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('RV Associates - Payslip Report', 14, 22);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  const tableData = payslips.map(payslip => [
    payslip.serial_number || '',
    payslip.employee_code || payslip.employee_id,
    payslip.employee_name,
    payslip.designation,
    payslip.department,
    payslip.pay_period,
    `₹${(payslip.earned_basic || payslip.basic_salary || 0)}`,
    `₹${payslip.total_earning_gross || 0}`,
    `₹${payslip.net_salary}`,
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['S.No.', 'Code', 'Name', 'Designation', 'Department', 'Period', 'Basic', 'Gross', 'Net Salary']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
  });

  doc.save(`${filename}.pdf`);
};

export const exportByDesignation = (payslips: Payslip[], designation: string, format: 'excel' | 'csv' | 'pdf') => {
  const filtered = payslips.filter(p => p.designation.toLowerCase() === designation.toLowerCase());
  const filename = `payslips_${designation.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'excel':
      exportToExcel(filtered, filename);
      break;
    case 'csv':
      exportToCSV(filtered, filename);
      break;
    case 'pdf':
      exportToPDF(filtered, filename);
      break;
  }
};

export const exportByDepartment = (payslips: Payslip[], department: string, format: 'excel' | 'csv' | 'pdf') => {
  const filtered = payslips.filter(p => p.department.toLowerCase() === department.toLowerCase());
  const filename = `payslips_${department.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'excel':
      exportToExcel(filtered, filename);
      break;
    case 'csv':
      exportToCSV(filtered, filename);
      break;
    case 'pdf':
      exportToPDF(filtered, filename);
      break;
  }
};

export const exportByEmployee = (payslips: Payslip[], employeeId: string, format: 'excel' | 'csv' | 'pdf') => {
  const filtered = payslips.filter(p => p.employee_id === employeeId);
  const filename = `payslip_${employeeId}_${new Date().toISOString().split('T')[0]}`;
  
  switch (format) {
    case 'excel':
      exportToExcel(filtered, filename);
      break;
    case 'csv':
      exportToCSV(filtered, filename);
      break;
    case 'pdf':
      exportToPDF(filtered, filename);
      break;
  }
};
