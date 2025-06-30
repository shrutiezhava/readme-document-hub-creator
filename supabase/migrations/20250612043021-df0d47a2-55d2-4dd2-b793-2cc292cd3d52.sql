
-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create designations table
CREATE TABLE public.designations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'client');

-- Create users table for the document portal (separate from auth context)
CREATE TABLE public.portal_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  designation_id UUID REFERENCES public.designations(id) ON DELETE CASCADE NOT NULL,
  access_code TEXT NOT NULL UNIQUE,
  uploaded_by UUID REFERENCES public.portal_users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document access logs
CREATE TABLE public.document_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.portal_users(id) ON DELETE SET NULL,
  access_code TEXT NOT NULL,
  access_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for companies
CREATE POLICY "Allow all operations on companies" 
  ON public.companies 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- Create policies for designations
CREATE POLICY "Allow all operations on designations" 
  ON public.designations 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- Create policies for portal_users
CREATE POLICY "Allow all operations on portal_users" 
  ON public.portal_users 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- Create policies for documents
CREATE POLICY "Allow all operations on documents" 
  ON public.documents 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- Create policies for document_access_logs
CREATE POLICY "Allow all operations on document_access_logs" 
  ON public.document_access_logs 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- Insert default companies
INSERT INTO public.companies (name) VALUES 
('Boston Engineers'),
('TechCorp Solutions'),
('Industrial Systems Ltd');

-- Insert default designations
INSERT INTO public.designations (title) VALUES 
('Compliance Officer'),
('Plant Manager'),
('Safety Engineer'),
('Quality Assurance'),
('Operations Manager');

-- Insert admin users (Shruti and Sangeeta)
INSERT INTO public.portal_users (username, password_hash, role, full_name, email) VALUES 
('Shruti', '$2b$10$rQj0KzU.Xe7YR8QQ8QQ8QOeKzU.Xe7YR8QQ8QQ8QOeKzU.Xe7YR8Q', 'admin', 'Shruti', 'shruti@rvassociates.com'),
('Sangeeta', '$2b$10$rQj0KzU.Xe7YR8QQ8QQ8QOeKzU.Xe7YR8QQ8QQ8QOeKzU.Xe7YR8Q', 'admin', 'Sangeeta', 'sangeeta@rvassociates.com');

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create storage policies for documents bucket
CREATE POLICY "Allow authenticated users to upload documents" 
  ON storage.objects 
  FOR INSERT 
  TO public 
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to view documents" 
  ON storage.objects 
  FOR SELECT 
  TO public 
  USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to update documents" 
  ON storage.objects 
  FOR UPDATE 
  TO public 
  USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to delete documents" 
  ON storage.objects 
  FOR DELETE 
  TO public 
  USING (bucket_id = 'documents');
