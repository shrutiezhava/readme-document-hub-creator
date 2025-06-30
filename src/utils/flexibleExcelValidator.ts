
import * as XLSX from 'xlsx';

export interface FlexibleValidationResult {
  isValid: boolean;
  data: any[];
  detectedColumns: string[];
  suggestedMappings: ColumnMapping[];
  warnings: string[];
  info: string[];
}

export interface ColumnMapping {
  detectedColumn: string;
  suggestedField: string;
  category: 'employee_info' | 'earnings' | 'deductions' | 'net_pay' | 'bank_details' | 'attendance' | 'other';
  confidence: 'high' | 'medium' | 'low';
}

// Common field mappings for intelligent detection
const FIELD_MAPPINGS = {
  employee_info: {
    'S.No': ['s.no', 'serial', 'sno', 'sr.no', 'sr no', 'number'],
    'Employee Code': ['employee code', 'emp code', 'empcode', 'code', 'emp id', 'employee id'],
    'Employee Name': ['employee name', 'emp name', 'name', 'full name'],
    'Designation': ['designation', 'position', 'role', 'job title', 'title'],
    'Department': ['department', 'dept', 'division']
  },
  earnings: {
    'Basic': ['basic', 'basic salary', 'basic pay'],
    'HRA': ['hra', 'house rent allowance', 'house allowance'],
    'Transport Allowance': ['transport', 'conveyance', 'travel allowance'],
    'Medical Allowance': ['medical', 'medical allowance'],
    'OTHER EARNING': ['other earning', 'other earnings', 'misc earning'],
    'PERFORMANCE ALLOWANCE': ['performance', 'performance allowance', 'bonus'],
    'SKILL ALLOWANCE': ['skill', 'skill allowance', 'special allowance'],
    'OS': ['os', 'overtime', 'ot', 'overtime pay'],
    'Total Earning (Gross)': ['total earning', 'gross', 'gross salary', 'total gross']
  },
  deductions: {
    'PF': ['pf', 'provident fund', 'epf'],
    'ESIC': ['esic', 'esi', 'employee state insurance'],
    'PT': ['pt', 'professional tax', 'prof tax'],
    'Tax Deduction': ['tax', 'income tax', 'tds'],
    'Other Deductions': ['other deduction', 'misc deduction', 'deduction'],
    'Total Deductions': ['total deduction', 'total deductions']
  },
  net_pay: {
    'Net Payment': ['net payment', 'net pay', 'net salary'],
    'FINAL NET PAY': ['final net pay', 'final net', 'take home']
  },
  bank_details: {
    'Bank Name': ['bank name', 'bank'],
    'Bank Account Number': ['account number', 'acc no', 'account no', 'bank account'],
    'IFSC Code': ['ifsc', 'ifsc code', 'bank code']
  },
  attendance: {
    'W Day': ['w day', 'working days', 'work days', 'total days'],
    'Present': ['present', 'present days', 'days present'],
    'OS Hours': ['os hours', 'overtime hours', 'ot hours']
  }
};

export const validateFlexibleExcel = (worksheet: any): FlexibleValidationResult => {
  const result: FlexibleValidationResult = {
    isValid: true,
    data: [],
    detectedColumns: [],
    suggestedMappings: [],
    warnings: [],
    info: []
  };

  try {
    const range = worksheet['!ref'];
    if (!range) {
      result.warnings.push('Empty or invalid Excel file detected');
      return result;
    }

    const decode = (r: any, c: any) => worksheet[`${String.fromCharCode(65 + c)}${r + 1}`];
    
    // Extract headers from first row
    let headers: string[] = [];
    for (let col = 0; col < 100; col++) {
      const cell = decode(0, col);
      if (cell && cell.v) {
        headers.push(String(cell.v).trim());
      } else if (headers.length > 0) {
        break;
      }
    }

    result.detectedColumns = headers;

    if (headers.length === 0) {
      result.warnings.push('No column headers found in the first row');
      return result;
    }

    result.info.push(`Detected ${headers.length} columns in your Excel file`);

    // Generate intelligent column mappings
    result.suggestedMappings = generateColumnMappings(headers);

    // Extract data rows
    const data: any[] = [];
    for (let row = 1; row < 1000; row++) {
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
        data.push(rowData);
      } else if (data.length > 0) {
        break;
      }
    }

    result.data = data;
    result.info.push(`Found ${data.length} data rows ready for payslip generation`);

    // Gentle warnings for commonly expected fields
    const commonFields = ['Employee Name', 'Employee Code'];
    commonFields.forEach(field => {
      const hasField = headers.some(h => 
        h.toLowerCase().includes(field.toLowerCase().replace(' ', '')) ||
        h.toLowerCase().includes(field.toLowerCase())
      );
      if (!hasField) {
        result.warnings.push(`Consider adding "${field}" for better payslip organization`);
      }
    });

    return result;

  } catch (error) {
    result.warnings.push(`File processing note: ${error}`);
    return result;
  }
};

const generateColumnMappings = (headers: string[]): ColumnMapping[] => {
  const mappings: ColumnMapping[] = [];

  headers.forEach(header => {
    const lowerHeader = header.toLowerCase().trim();
    let bestMatch: ColumnMapping | null = null;

    // Check each category for matches
    Object.entries(FIELD_MAPPINGS).forEach(([category, fields]) => {
      Object.entries(fields).forEach(([standardField, variations]) => {
        variations.forEach(variation => {
          if (lowerHeader.includes(variation) || variation.includes(lowerHeader)) {
            const confidence = lowerHeader === variation ? 'high' : 
                            lowerHeader.includes(variation) ? 'medium' : 'low';
            
            if (!bestMatch || confidence === 'high') {
              bestMatch = {
                detectedColumn: header,
                suggestedField: standardField,
                category: category as any,
                confidence: confidence as any
              };
            }
          }
        });
      });
    });

    if (bestMatch) {
      mappings.push(bestMatch);
    } else {
      // Default mapping for unrecognized columns
      mappings.push({
        detectedColumn: header,
        suggestedField: header,
        category: 'other',
        confidence: 'low'
      });
    }
  });

  return mappings;
};

export const convertFlexibleDataToPayslip = (rowData: any, columnMappings: ColumnMapping[]): any => {
  // Create a mapping object for easy lookup
  const mappingLookup = columnMappings.reduce((acc, mapping) => {
    acc[mapping.detectedColumn] = mapping.suggestedField;
    return acc;
  }, {} as Record<string, string>);

  const getValue = (originalColumn: string, fallbackColumns: string[] = []) => {
    const value = rowData[originalColumn];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
    
    // Try fallback columns
    for (const fallback of fallbackColumns) {
      const fallbackValue = rowData[fallback];
      if (fallbackValue !== undefined && fallbackValue !== null && fallbackValue !== '') {
        return fallbackValue;
      }
    }
    
    return 0;
  };

  const getStringValue = (originalColumn: string, fallbackColumns: string[] = []) => {
    const value = getValue(originalColumn, fallbackColumns);
    return String(value || '').trim();
  };

  const getNumericValue = (originalColumn: string, fallbackColumns: string[] = []) => {
    const value = getValue(originalColumn, fallbackColumns);
    return Number(value) || 0;
  };

  return {
    serial_number: getNumericValue('S.No', ['serial', 'sno', 'sr.no']),
    employee_code: getStringValue('Employee Code', ['emp code', 'empcode', 'code']),
    employee_name: getStringValue('Employee Name', ['emp name', 'name', 'full name']),
    employee_id: getStringValue('Employee Code', ['emp code', 'empcode', 'code']),
    designation: getStringValue('Designation', ['position', 'role', 'job title']),
    department: getStringValue('Department', ['dept', 'division']) || 'General',
    pay_period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    
    // Salary components with flexible mapping
    basic_salary: getNumericValue('Basic', ['basic salary', 'basic pay']),
    hra: getNumericValue('HRA', ['house rent allowance']),
    transport_allowance: getNumericValue('Transport Allowance', ['transport', 'conveyance']),
    medical_allowance: getNumericValue('Medical Allowance', ['medical']),
    other_allowances: getNumericValue('OTHER EARNING', ['other earning', 'other earnings']),
    
    // Attendance
    working_days: getNumericValue('W Day', ['working days', 'work days']),
    present_days: getNumericValue('Present', ['present days', 'days present']),
    os_hours: getNumericValue('OS Hours', ['overtime hours', 'ot hours']),
    
    // Earned wages
    earned_basic: getNumericValue('Basic_Earned', ['basic earned']) || getNumericValue('Basic', ['basic salary']),
    earned_hra: getNumericValue('HRA_Earned', ['hra earned']) || getNumericValue('HRA', ['house rent allowance']),
    earned_os: getNumericValue('OS', ['overtime', 'ot']),
    other_earning: getNumericValue('OTHER EARNING', ['other earning']),
    performance_allowance: getNumericValue('PERFORMANCE ALLOWANCE', ['performance', 'bonus']),
    skill_allowance: getNumericValue('SKILL ALLOWANCE', ['skill', 'special allowance']),
    attendance_incentive: getNumericValue('Att. Incentive / Att. Bonus', ['attendance incentive']),
    total_earning_gross: getNumericValue('Total Earning (Gross)', ['total earning', 'gross', 'gross salary']),
    
    // Deductions
    pf_deduction: getNumericValue('PF', ['provident fund', 'epf']),
    tax_deduction: getNumericValue('PT', ['professional tax', 'tax', 'income tax']),
    insurance_deduction: getNumericValue('ESIC', ['esi', 'employee state insurance']),
    other_deductions: getNumericValue('Other Deductions', ['other deduction', 'misc deduction']),
    
    // Net payment
    net_salary: getNumericValue('FINAL NET PAY', ['final net pay', 'net payment', 'net pay', 'take home']),
    
    // Bank details
    bank_name: getStringValue('Bank Name', ['bank']),
    bank_account_number: getStringValue('Bank Account Number', ['account number', 'acc no']),
    ifsc_code: getStringValue('IFSC Code', ['ifsc', 'bank code']),
    
    // Service charge
    service_charge: getNumericValue('SERVICE CHARGE', ['service charge']) || 0,
    
    // Company details
    company_name: 'RV Associates',
    company_address: 'Aarya Exotica, opposite KD-10, Bil, Vadodara 391410',
    
    // Store all original data for reference
    original_data: rowData,
    
    // Store column mappings used
    column_mappings: columnMappings
  };
};
