
export interface PayrollUpload {
  id: string;
  upload_name: string;
  upload_date: string;
  file_name: string;
  total_records: number;
  created_by?: string;
  created_at: string;
}

export interface PayrollData {
  id: string;
  upload_id: string;
  row_number: number;
  data_json: any; // Changed from Record<string, any> to any to match Supabase Json type
  created_at: string;
}

export interface PayrollSummary {
  upload_id: string;
  upload_name: string;
  upload_date: string;
  file_name: string;
  total_records: number;
  actual_records: number;
  created_at: string;
}
