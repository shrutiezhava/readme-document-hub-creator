export interface HeaderStructure {
  mainHeader: string;
  subHeader?: string;
  mappedField: string;
  originalColumn: string;
  level: number;
}

export interface ExcelStructure {
  headers: HeaderStructure[];
  data: Record<string, any>[];
  hierarchicalFields: Record<string, string[]>;
}

// Enhanced payslip field mapping with all new columns
const payslipFieldMapping: Record<string, string[]> = {
  // Basic Employee Information
  serial_number: ['serial_number', 's_no', 'sno', 'sr_no', 'sr no', 's no', 'serial no', 'sl no'],
  employee_name: ['employee_name', 'name', 'emp_name', 'employee name', 'full name', 'fullname', 'staff name'],
  employee_id: ['employee_id', 'emp_id', 'id', 'employee id', 'emp id', 'staff id'],
  employee_code: ['employee_code', 'emp_code', 'code', 'employee code', 'emp code', 'staff code'],
  designation: ['designation', 'position', 'job_title', 'title', 'role', 'post'],
  department: ['department', 'dept', 'division', 'section'],
  pay_period: ['pay_period', 'period', 'month', 'pay period', 'salary period', 'payroll period'],
  
  // Salary Breakup
  basic_salary: ['basic_salary', 'basic', 'base_salary', 'basic pay', 'base pay', 'basic wage'],
  salary_fixed_part: ['salary_fixed_part', 'fixed_part', 'fixed salary', 'fixed pay', 'fixed component'],
  salary_variable_part: ['salary_variable_part', 'variable_part', 'variable salary', 'variable pay', 'variable component'],
  
  // Attendance
  working_days: ['working_days', 'w_day', 'w day', 'work days', 'total days', 'days'],
  present_days: ['present_days', 'present', 'attendance', 'days present', 'working'],
  os_hours: ['os_hours', 'os hours', 'overtime hours', 'ot hours', 'extra hours'],
  
  // Earned Wages
  earned_basic: ['earned_basic', 'basic', 'earned basic', 'basic earned'],
  earned_hra: ['earned_hra', 'hra', 'earned hra', 'house rent allowance', 'house rent'],
  earned_os: ['earned_os', 'os', 'overtime', 'ot', 'earned os', 'earned overtime'],
  other_earning: ['other_earning', 'other earnings', 'misc earnings', 'additional earnings'],
  performance_allowance: ['performance_allowance', 'performance', 'performance bonus', 'perf allowance'],
  skill_allowance: ['skill_allowance', 'skill', 'skill bonus', 'technical allowance'],
  attendance_incentive: ['attendance_incentive', 'att_incentive', 'att incentive', 'attendance bonus', 'att bonus'],
  
  // Legacy allowances (keeping for backward compatibility)
  hra: ['hra', 'house_rent_allowance', 'house rent allowance', 'house rent', 'rent allowance'],
  transport_allowance: ['transport_allowance', 'transport', 'conveyance', 'travel allowance', 'ta', 'conveyance allowance'],
  medical_allowance: ['medical_allowance', 'medical', 'health allowance', 'medical benefit', 'health benefit'],
  other_allowances: ['other_allowances', 'other allowances', 'misc allowances', 'miscellaneous allowances', 'additional allowances'],
  
  // Total
  total_earning_gross: ['total_earning_gross', 'total earning', 'gross earning', 'total earnings', 'gross', 'gross salary'],
  
  // Deductions
  pf_deduction: ['pf_deduction', 'pf', 'provident_fund', 'provident fund', 'epf', 'pf contribution'],
  tax_deduction: ['tax_deduction', 'tax', 'income_tax', 'income tax', 'tds', 'tax deducted at source'],
  insurance_deduction: ['insurance_deduction', 'insurance', 'health_insurance', 'life insurance', 'insurance premium'],
  other_deductions: ['other_deductions', 'other deductions', 'misc deductions', 'miscellaneous deductions', 'additional deductions'],
  
  // Final Amounts
  gross_salary: ['gross_salary', 'gross', 'gross pay', 'total earnings', 'gross amount'],
  total_deductions: ['total_deductions', 'total deduction', 'deductions', 'total ded'],
  net_salary: ['net_salary', 'net', 'take_home', 'take home', 'net pay', 'in hand', 'net amount'],
  
  // Bank Details
  bank_name: ['bank_name', 'bank name', 'bank', 'bank details'],
  bank_account_number: ['bank_account_number', 'account_number', 'account no', 'acc no', 'bank account', 'account'],
  ifsc_code: ['ifsc_code', 'ifsc', 'ifsc code', 'branch code'],
  service_charge: ['service_charge', 'service charge', 'bank charge', 'charges'],
  
  // Company Information
  company_name: ['company_name', 'company', 'organization', 'employer'],
  company_address: ['company_address', 'address', 'company address', 'office address']
};

// Enhanced function to detect Excel structure including merged cells and subheaders
export const analyzeExcelStructure = (worksheet: any): ExcelStructure => {
  const range = worksheet['!ref'];
  if (!range) {
    return { headers: [], data: [], hierarchicalFields: {} };
  }

  const decode = (r: any, c: any) => worksheet[`${String.fromCharCode(65 + c)}${r + 1}`];
  
  // Find the actual data start by looking for the first row with substantial content
  let headerRow = 0;
  let subHeaderRow = -1;
  let dataStartRow = 1;
  
  // Look for merged cells which often indicate main headers with subheaders
  const merges = worksheet['!merges'] || [];
  const mergedCells = new Map();
  
  merges.forEach((merge: any) => {
    for (let row = merge.s.r; row <= merge.e.r; row++) {
      for (let col = merge.s.c; col <= merge.e.c; col++) {
        mergedCells.set(`${row},${col}`, {
          mainRow: merge.s.r,
          mainCol: merge.s.c,
          spanRows: merge.e.r - merge.s.r + 1,
          spanCols: merge.e.c - merge.s.c + 1
        });
      }
    }
  });

  // Analyze first few rows to detect structure
  const maxCols = 50; // Reasonable limit for analysis
  const analysisRows = 5;
  
  let structure: any[] = [];
  
  for (let row = 0; row < analysisRows; row++) {
    let rowData: any[] = [];
    for (let col = 0; col < maxCols; col++) {
      const cell = decode(row, col);
      const cellValue = cell ? (cell.v || '').toString().trim() : '';
      rowData.push(cellValue);
    }
    structure.push(rowData);
    
    // If this row has substantial non-empty content, it might be headers
    const nonEmptyCount = rowData.filter(cell => cell && cell.length > 0).length;
    if (nonEmptyCount > 2 && headerRow === 0) {
      headerRow = row;
      // Check if next row might be subheaders
      if (row + 1 < analysisRows) {
        const nextRowData = [];
        for (let col = 0; col < maxCols; col++) {
          const nextCell = decode(row + 1, col);
          nextRowData.push(nextCell ? (nextCell.v || '').toString().trim() : '');
        }
        const nextNonEmptyCount = nextRowData.filter(cell => cell && cell.length > 0).length;
        if (nextNonEmptyCount > nonEmptyCount / 2) {
          subHeaderRow = row + 1;
          dataStartRow = row + 2;
        } else {
          dataStartRow = row + 1;
        }
      }
      break;
    }
  }

  // Extract headers with hierarchy - PRESERVE ALL HEADERS
  const headers: HeaderStructure[] = [];
  const hierarchicalFields: Record<string, string[]> = {};
  
  const mainHeaders = structure[headerRow] || [];
  const subHeaders = subHeaderRow >= 0 ? structure[subHeaderRow] || [] : [];
  
  for (let col = 0; col < mainHeaders.length; col++) {
    const mainHeader = mainHeaders[col];
    const subHeader = subHeaders[col];
    
    // IMPORTANT: Include ALL columns, even if they appear empty
    if (!mainHeader && !subHeader && col < 100) {
      // Create a placeholder for empty columns to ensure we don't lose data
      headers.push({
        mainHeader: `Column_${col + 1}`,
        subHeader: undefined,
        mappedField: '',
        originalColumn: `Column_${col + 1}`,
        level: 1
      });
      continue;
    }
    
    if (!mainHeader && !subHeader) continue;
    
    // Create a combined column identifier
    let columnKey = '';
    let displayName = '';
    let mappedField = '';
    
    if (mainHeader && subHeader) {
      columnKey = `${mainHeader}_${subHeader}`;
      displayName = `${mainHeader} - ${subHeader}`;
      mappedField = findBestFieldMapping(columnKey) || findBestFieldMapping(subHeader) || findBestFieldMapping(mainHeader);
      
      // Group subheaders under main headers
      if (!hierarchicalFields[mainHeader]) {
        hierarchicalFields[mainHeader] = [];
      }
      hierarchicalFields[mainHeader].push(subHeader);
    } else if (mainHeader) {
      columnKey = mainHeader;
      displayName = mainHeader;
      mappedField = findBestFieldMapping(mainHeader);
    } else if (subHeader) {
      columnKey = subHeader;
      displayName = subHeader;
      mappedField = findBestFieldMapping(subHeader);
    }
    
    headers.push({
      mainHeader: mainHeader || '',
      subHeader: subHeader || undefined,
      mappedField: mappedField || '',
      originalColumn: columnKey,
      level: subHeader ? 2 : 1
    });
  }

  // Extract actual data - PRESERVE ALL COLUMNS
  const jsonData: Record<string, any>[] = [];
  const maxRows = 1000; // Reasonable limit
  
  for (let row = dataStartRow; row < Math.min(dataStartRow + maxRows, 1048576); row++) {
    const rowData: Record<string, any> = {};
    let hasData = false;
    
    // Process ALL columns up to the number of headers we found
    for (let col = 0; col < Math.max(headers.length, 50); col++) {
      const header = headers[col];
      const cell = decode(row, col);
      const cellValue = cell ? cell.v : '';
      
      if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
        hasData = true;
      }
      
      // Use the original column key as the field name
      const fieldKey = header ? header.originalColumn : `Column_${col + 1}`;
      rowData[fieldKey] = cellValue;
      
      // Also map to the payslip field if available
      if (header && header.mappedField) {
        rowData[header.mappedField] = cellValue;
      }
    }
    
    if (hasData) {
      jsonData.push(rowData);
    } else if (jsonData.length > 0) {
      // Stop if we hit empty rows after finding data
      break;
    }
  }

  return {
    headers,
    data: jsonData,
    hierarchicalFields
  };
};

// Enhanced field mapping function
const findBestFieldMapping = (columnName: string): string => {
  if (!columnName) return '';
  
  const normalizedColumn = columnName.toLowerCase().trim().replace(/[_\s-]+/g, ' ');
  
  for (const [payslipField, variants] of Object.entries(payslipFieldMapping)) {
    for (const variant of variants) {
      const normalizedVariant = variant.toLowerCase().trim();
      
      // Exact match
      if (normalizedColumn === normalizedVariant) {
        return payslipField;
      }
      
      // Contains match
      if (normalizedColumn.includes(normalizedVariant) || normalizedVariant.includes(normalizedColumn)) {
        return payslipField;
      }
      
      // Fuzzy match for common abbreviations
      if (fuzzyMatch(normalizedColumn, normalizedVariant)) {
        return payslipField;
      }
    }
  }
  
  return '';
};

// Simple fuzzy matching for common patterns
const fuzzyMatch = (str1: string, str2: string): boolean => {
  // Remove common words and check similarity
  const cleanStr1 = str1.replace(/\b(the|and|of|to|in|for|with|by)\b/g, '').trim();
  const cleanStr2 = str2.replace(/\b(the|and|of|to|in|for|with|by)\b/g, '').trim();
  
  // Check if one contains most words of the other
  const words1 = cleanStr1.split(/\s+/);
  const words2 = cleanStr2.split(/\s+/);
  
  if (words1.length === 0 || words2.length === 0) return false;
  
  const matchCount = words1.filter(word1 => 
    words2.some(word2 => word1.includes(word2) || word2.includes(word1))
  ).length;
  
  return matchCount / Math.max(words1.length, words2.length) >= 0.6;
};

// Enhanced conversion function to handle ALL fields from Excel
export const convertToPayslipData = (data: Record<string, any>, headers: HeaderStructure[]): any => {
  const payslipData: any = {
    // Standard fields with defaults
    serial_number: null,
    employee_name: '',
    employee_id: '',
    employee_code: '',
    designation: '',
    department: '',
    pay_period: '',
    basic_salary: 0,
    salary_fixed_part: 0,
    salary_variable_part: 0,
    working_days: 0,
    present_days: 0,
    os_hours: 0,
    earned_basic: 0,
    earned_hra: 0,
    earned_os: 0,
    other_earning: 0,
    performance_allowance: 0,
    skill_allowance: 0,
    attendance_incentive: 0,
    hra: 0,
    transport_allowance: 0,
    medical_allowance: 0,
    other_allowances: 0,
    total_earning_gross: 0,
    pf_deduction: 0,
    tax_deduction: 0,
    insurance_deduction: 0,
    other_deductions: 0,
    net_salary: 0,
    bank_name: '',
    bank_account_number: '',
    ifsc_code: '',
    service_charge: 0,
    company_name: 'RV Associates',
    company_address: 'Aarya Exotica, opposite KD-10, Bil, Vadodara 391410'
  };

  // CRITICAL: Process ALL headers and preserve EVERY column from Excel
  headers.forEach(header => {
    const value = data[header.originalColumn];
    const fieldKey = header.originalColumn;
    
    // Always include the original field, regardless of mapping
    if (value !== undefined && value !== null) {
      if (typeof value === 'number' || (!isNaN(Number(value)) && value !== '')) {
        payslipData[fieldKey] = Number(value) || 0;
      } else {
        payslipData[fieldKey] = String(value).trim();
      }
    } else {
      payslipData[fieldKey] = '';
    }
    
    // Also handle standard mappings if they exist
    if (header.mappedField && value !== undefined && value !== null) {
      if (['serial_number', 'working_days', 'present_days'].includes(header.mappedField)) {
        payslipData[header.mappedField] = parseInt(value) || 0;
      } else if (header.mappedField === 'os_hours') {
        payslipData[header.mappedField] = parseFloat(value) || 0;
      } else if (header.mappedField.includes('salary') || 
                 header.mappedField.includes('allowance') || 
                 header.mappedField.includes('deduction') ||
                 header.mappedField.includes('earning') ||
                 header.mappedField.includes('charge') ||
                 header.mappedField.includes('incentive') ||
                 header.mappedField === 'hra' ||
                 header.mappedField === 'total_earning_gross') {
        payslipData[header.mappedField] = Number(value) || 0;
      } else {
        payslipData[header.mappedField] = String(value).trim();
      }
    }
    
    // If there's hierarchy, create structured field names
    if (header.subHeader) {
      const hierarchicalKey = `${header.mainHeader}_${header.subHeader}`;
      payslipData[hierarchicalKey] = payslipData[fieldKey];
    }
  });

  // Calculate totals only if not already provided
  if (!payslipData.total_earning_gross) {
    payslipData.total_earning_gross = 
      (payslipData.earned_basic || payslipData.basic_salary || 0) + 
      (payslipData.earned_hra || payslipData.hra || 0) + 
      (payslipData.earned_os || 0) +
      (payslipData.other_earning || payslipData.other_allowances || 0) +
      (payslipData.performance_allowance || 0) +
      (payslipData.skill_allowance || 0) +
      (payslipData.attendance_incentive || 0) +
      (payslipData.transport_allowance || 0) + 
      (payslipData.medical_allowance || 0);
  }

  if (!payslipData.total_deductions) {
    payslipData.total_deductions = 
      (payslipData.pf_deduction || 0) + 
      (payslipData.tax_deduction || 0) + 
      (payslipData.insurance_deduction || 0) + 
      (payslipData.other_deductions || 0) +
      (payslipData.service_charge || 0);
  }

  if (!payslipData.net_salary) {
    payslipData.net_salary = (payslipData.total_earning_gross || 0) - (payslipData.total_deductions || 0);
  }

  return payslipData;
};
