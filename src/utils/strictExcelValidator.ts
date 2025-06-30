
// Strict Excel validation for payroll data
export interface StrictPayrollStructure {
  // General Information
  'S.No': number;
  'Employee Code': string;
  'Employee Name': string;
  
  // Designation
  'Designation': string;
  
  // Salary Break-Up - Fixed Part
  'Basic': number;
  'HRA': number;
  
  // Salary Break-Up - Variable Part
  'OS Rate': number;
  'Att. Incentive': number;
  
  // Attendance
  'W Day': number;
  'Present': number;
  'OS Hours': number;
  
  // Earned Wages
  'Basic_Earned': number;
  'HRA_Earned': number;
  'OS': number;
  'OTHER EARNING': number;
  'PERFORMANCE ALLOWANCE': number;
  'SKILL ALLOWANCE': number;
  'Att. Incentive / Att. Bonus': number;
  'Total Earning (Gross)': number;
  
  // Deductions - Statutory
  'PF': number;
  'ESIC': number;
  'PT': number;
  
  // Deductions - Canteen
  'Lunch / Dinner': number;
  
  // Deductions - Cash/Bank Advances
  'BANK': number;
  'Maintenance': number;
  'LIGHT BILL': number;
  
  // Deductions - Other
  'Other Deductions': number;
  'GPA': number;
  'Police Verification': number;
  'Hostel': number;
  'Total Deductions': number;
  
  // Net Payment
  'Net Payment': number;
  'TICKET': number;
  'FINAL NET PAY': number;
  'RETENTION ALLO': number;
  
  // Bank Details
  'Bank Name': string;
  'Bank Account Number': string;
  'IFSC Code': string;
  
  // Service Charge
  'SERVICE CHARGE': number;
}

export const REQUIRED_COLUMNS = [
  'S.No',
  'Employee Code',
  'Employee Name',
  'Designation',
  'Basic',
  'HRA',
  'OS Rate',
  'Att. Incentive',
  'W Day',
  'Present',
  'OS Hours',
  'Basic_Earned',
  'HRA_Earned',
  'OS',
  'OTHER EARNING',
  'PERFORMANCE ALLOWANCE',
  'SKILL ALLOWANCE',
  'Att. Incentive / Att. Bonus',
  'Total Earning (Gross)',
  'PF',
  'ESIC',
  'PT',
  'Lunch / Dinner',
  'BANK',
  'Maintenance',
  'LIGHT BILL',
  'Other Deductions',
  'GPA',
  'Police Verification',
  'Hostel',
  'Total Deductions',
  'Net Payment',
  'TICKET',
  'FINAL NET PAY',
  'RETENTION ALLO',
  'Bank Name',
  'Bank Account Number',
  'IFSC Code',
  'SERVICE CHARGE'
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingColumns: string[];
  extraColumns: string[];
  data: any[];
}

export const validateStrictExcel = (worksheet: any): ValidationResult => {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    missingColumns: [],
    extraColumns: [],
    data: []
  };

  try {
    // Get the range and decode function
    const range = worksheet['!ref'];
    if (!range) {
      result.errors.push('Empty or invalid Excel file');
      return result;
    }

    const decode = (r: any, c: any) => worksheet[`${String.fromCharCode(65 + c)}${r + 1}`];
    
    // Find header row (assuming first row with data)
    let headerRow = 0;
    let headers: string[] = [];
    
    // Extract headers from first row
    for (let col = 0; col < 100; col++) {
      const cell = decode(headerRow, col);
      if (cell && cell.v) {
        headers.push(String(cell.v).trim());
      } else if (headers.length > 0) {
        break; // Stop when we hit empty cells after finding headers
      }
    }

    if (headers.length === 0) {
      result.errors.push('No headers found in Excel file');
      return result;
    }

    // Check for missing required columns
    const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    result.missingColumns = missingColumns;

    if (missingColumns.length > 0) {
      result.errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Check for extra columns
    const extraColumns = headers.filter(col => !REQUIRED_COLUMNS.includes(col));
    result.extraColumns = extraColumns;

    if (extraColumns.length > 0) {
      result.warnings.push(`Extra columns detected: ${extraColumns.join(', ')}`);
    }

    // Extract data rows
    const data: any[] = [];
    let dataStartRow = 1; // Assuming headers are in row 0, data starts in row 1

    for (let row = dataStartRow; row < 1000; row++) { // Reasonable limit
      const rowData: any = {};
      let hasData = false;

      for (let col = 0; col < headers.length; col++) {
        const header = headers[col];
        const cell = decode(row, col);
        const cellValue = cell ? cell.v : '';

        if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
          hasData = true;
        }

        rowData[header] = cellValue;
      }

      if (hasData) {
        // Validate critical fields
        if (!rowData['Employee Name'] || String(rowData['Employee Name']).trim() === '') {
          result.errors.push(`Row ${row + 1}: Employee Name is required`);
        }
        if (!rowData['Employee Code'] || String(rowData['Employee Code']).trim() === '') {
          result.errors.push(`Row ${row + 1}: Employee Code is required`);
        }

        data.push(rowData);
      } else if (data.length > 0) {
        break; // Stop processing when we hit empty rows after finding data
      }
    }

    result.data = data;

    if (data.length === 0) {
      result.errors.push('No data rows found in Excel file');
    }

    // Set validation result
    result.isValid = result.errors.length === 0;

    return result;

  } catch (error) {
    result.errors.push(`Error processing Excel file: ${error}`);
    return result;
  }
};

export const convertStrictDataToPayslip = (rowData: any): any => {
  return {
    serial_number: Number(rowData['S.No']) || 0,
    employee_code: String(rowData['Employee Code'] || '').trim(),
    employee_name: String(rowData['Employee Name'] || '').trim(),
    employee_id: String(rowData['Employee Code'] || '').trim(), // Using code as ID
    designation: String(rowData['Designation'] || '').trim(),
    department: 'General', // Default department
    pay_period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    
    // Salary components
    basic_salary: Number(rowData['Basic']) || 0,
    hra: Number(rowData['HRA']) || 0,
    
    // Attendance
    working_days: Number(rowData['W Day']) || 0,
    present_days: Number(rowData['Present']) || 0,
    os_hours: Number(rowData['OS Hours']) || 0,
    
    // Earned wages
    earned_basic: Number(rowData['Basic_Earned']) || 0,
    earned_hra: Number(rowData['HRA_Earned']) || 0,
    earned_os: Number(rowData['OS']) || 0,
    other_earning: Number(rowData['OTHER EARNING']) || 0,
    performance_allowance: Number(rowData['PERFORMANCE ALLOWANCE']) || 0,
    skill_allowance: Number(rowData['SKILL ALLOWANCE']) || 0,
    attendance_incentive: Number(rowData['Att. Incentive / Att. Bonus']) || 0,
    total_earning_gross: Number(rowData['Total Earning (Gross)']) || 0,
    
    // Deductions
    pf_deduction: Number(rowData['PF']) || 0,
    tax_deduction: Number(rowData['PT']) || 0, // Professional Tax
    insurance_deduction: Number(rowData['ESIC']) || 0,
    other_deductions: (Number(rowData['Other Deductions']) || 0) + 
                     (Number(rowData['GPA']) || 0) + 
                     (Number(rowData['Police Verification']) || 0) + 
                     (Number(rowData['Hostel']) || 0) + 
                     (Number(rowData['Lunch / Dinner']) || 0) + 
                     (Number(rowData['BANK']) || 0) + 
                     (Number(rowData['Maintenance']) || 0) + 
                     (Number(rowData['LIGHT BILL']) || 0),
    
    // Net payment
    net_salary: Number(rowData['FINAL NET PAY']) || 0,
    
    // Bank details
    bank_name: String(rowData['Bank Name'] || '').trim(),
    bank_account_number: String(rowData['Bank Account Number'] || '').trim(),
    ifsc_code: String(rowData['IFSC Code'] || '').trim(),
    
    // Service charge
    service_charge: Number(rowData['SERVICE CHARGE']) || 0,
    
    // Company details
    company_name: 'RV Associates',
    company_address: 'Aarya Exotica, opposite KD-10, Bil, Vadodara 391410',
    
    // Additional fields for completeness
    transport_allowance: 0,
    medical_allowance: 0,
    other_allowances: 0,
    
    // Store all original data for reference
    original_data: rowData
  };
};
