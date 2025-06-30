
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download } from 'lucide-react';
import { Payslip } from '../types/payslip';

interface PayslipPreviewProps {
  payslip: Payslip;
  onClose: () => void;
}

const PayslipPreview: React.FC<PayslipPreviewProps> = ({ payslip, onClose }) => {
  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadPDF = () => {
    // Simple HTML to PDF conversion using browser's print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payslip - ${payslip.employee_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .payslip { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 18px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .total-row { font-weight: bold; border-top: 1px solid #333; padding-top: 10px; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .net-salary { font-size: 20px; font-weight: bold; text-align: center; margin-top: 20px; padding: 15px; background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="payslip">
            <div class="header">
              <div class="company-name">${payslip.company_name}</div>
              <div>${payslip.company_address}</div>
              <h2>SALARY SLIP</h2>
            </div>
            
            <div class="section">
              <div class="row"><span>Employee Name:</span><span>${payslip.employee_name}</span></div>
              <div class="row"><span>Employee ID:</span><span>${payslip.employee_id}</span></div>
              <div class="row"><span>Designation:</span><span>${payslip.designation}</span></div>
              <div class="row"><span>Department:</span><span>${payslip.department}</span></div>
              <div class="row"><span>Pay Period:</span><span>${payslip.pay_period}</span></div>
            </div>

            <table>
              <tr><th>EARNINGS</th><th>AMOUNT</th><th>DEDUCTIONS</th><th>AMOUNT</th></tr>
              <tr><td>Basic Salary</td><td>${formatIndianCurrency(payslip.basic_salary)}</td><td>Provident Fund (EPF)</td><td>${formatIndianCurrency(payslip.pf_deduction)}</td></tr>
              <tr><td>House Rent Allowance (HRA)</td><td>${formatIndianCurrency(payslip.hra)}</td><td>Income Tax (TDS)</td><td>${formatIndianCurrency(payslip.tax_deduction)}</td></tr>
              <tr><td>Transport Allowance</td><td>${formatIndianCurrency(payslip.transport_allowance)}</td><td>Employee State Insurance (ESI)</td><td>${formatIndianCurrency(payslip.insurance_deduction)}</td></tr>
              <tr><td>Medical Allowance</td><td>${formatIndianCurrency(payslip.medical_allowance)}</td><td>Other Deductions</td><td>${formatIndianCurrency(payslip.other_deductions)}</td></tr>
              <tr><td>Other Allowances</td><td>${formatIndianCurrency(payslip.other_allowances)}</td><td></td><td></td></tr>
              <tr class="total-row">
                <td><strong>Total Earnings</strong></td>
                <td><strong>${formatIndianCurrency(payslip.basic_salary + payslip.hra + payslip.transport_allowance + payslip.medical_allowance + payslip.other_allowances)}</strong></td>
                <td><strong>Total Deductions</strong></td>
                <td><strong>${formatIndianCurrency(payslip.pf_deduction + payslip.tax_deduction + payslip.insurance_deduction + payslip.other_deductions)}</strong></td>
              </tr>
            </table>

            <div class="net-salary">
              NET SALARY: ${formatIndianCurrency(payslip.net_salary)}
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const totalEarnings = payslip.basic_salary + payslip.hra + payslip.transport_allowance + payslip.medical_allowance + payslip.other_allowances;
  const totalDeductions = payslip.pf_deduction + payslip.tax_deduction + payslip.insurance_deduction + payslip.other_deductions;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Payslip Preview</h2>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
              <h1 className="text-3xl font-bold mb-2">{payslip.company_name}</h1>
              <p className="text-gray-600 mb-4">{payslip.company_address}</p>
              <h2 className="text-2xl font-semibold">SALARY SLIP</h2>
            </div>

            {/* Employee Details */}
            <div className="mb-8 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Employee Name:</span>
                <span>{payslip.employee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Employee ID:</span>
                <span>{payslip.employee_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Designation:</span>
                <span>{payslip.designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Department:</span>
                <span>{payslip.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Pay Period:</span>
                <span>{payslip.pay_period}</span>
              </div>
            </div>

            {/* Earnings and Deductions Table */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-300 pb-2">EARNINGS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span>{formatIndianCurrency(payslip.basic_salary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>House Rent Allowance (HRA)</span>
                    <span>{formatIndianCurrency(payslip.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport Allowance</span>
                    <span>{formatIndianCurrency(payslip.transport_allowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Allowance</span>
                    <span>{formatIndianCurrency(payslip.medical_allowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Allowances</span>
                    <span>{formatIndianCurrency(payslip.other_allowances)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-300 pt-3">
                    <span>Total Earnings</span>
                    <span>{formatIndianCurrency(totalEarnings)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-300 pb-2">DEDUCTIONS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Provident Fund (EPF)</span>
                    <span>{formatIndianCurrency(payslip.pf_deduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Tax (TDS)</span>
                    <span>{formatIndianCurrency(payslip.tax_deduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employee State Insurance (ESI)</span>
                    <span>{formatIndianCurrency(payslip.insurance_deduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Deductions</span>
                    <span>{formatIndianCurrency(payslip.other_deductions)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-300 pt-3">
                    <span>Total Deductions</span>
                    <span>{formatIndianCurrency(totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="text-center bg-gray-100 p-6 rounded-lg">
              <div className="text-2xl font-bold">
                NET SALARY: {formatIndianCurrency(payslip.net_salary)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayslipPreview;
