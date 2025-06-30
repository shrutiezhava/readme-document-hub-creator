
export interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Designation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface PortalUser {
  id: string;
  username: string;
  role: 'admin' | 'client';
  company_id?: string;
  full_name: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Document {
  id: string;
  title: string;
  filename: string;
  file_path: string;
  file_size?: number;
  content_type?: string;
  company_id: string;
  designation_id: string;
  access_code: string;
  uploaded_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company?: Company;
  designation?: Designation;
}

export interface DocumentAccessLog {
  id: string;
  document_id: string;
  user_id?: string;
  access_code: string;
  access_time: string;
  ip_address?: string;
  user_agent?: string;
}
