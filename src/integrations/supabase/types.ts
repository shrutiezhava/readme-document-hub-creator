export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          password: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          password: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          password?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      designations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_access_logs: {
        Row: {
          access_code: string
          access_time: string
          document_id: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_code: string
          access_time?: string
          document_id: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_code?: string
          access_time?: string
          document_id?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          access_code: string
          company_id: string
          content_type: string | null
          created_at: string
          designation_id: string
          file_path: string
          file_size: number | null
          filename: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          access_code: string
          company_id: string
          content_type?: string | null
          created_at?: string
          designation_id: string
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          access_code?: string
          company_id?: string
          content_type?: string | null
          created_at?: string
          designation_id?: string
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_data: {
        Row: {
          created_at: string
          data_json: Json
          id: string
          row_number: number
          upload_id: string | null
        }
        Insert: {
          created_at?: string
          data_json: Json
          id?: string
          row_number: number
          upload_id?: string | null
        }
        Update: {
          created_at?: string
          data_json?: Json
          id?: string
          row_number?: number
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_data_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "payroll_summary"
            referencedColumns: ["upload_id"]
          },
          {
            foreignKeyName: "payroll_data_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "payroll_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_uploads: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string
          id: string
          total_records: number | null
          upload_date: string
          upload_name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name: string
          id?: string
          total_records?: number | null
          upload_date?: string
          upload_name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string
          id?: string
          total_records?: number | null
          upload_date?: string
          upload_name?: string
        }
        Relationships: []
      }
      payslips: {
        Row: {
          attendance_incentive: number | null
          bank_account_number: string | null
          bank_name: string | null
          basic_salary: number
          column_mappings: Json | null
          company_address: string
          company_name: string
          created_at: string
          department: string
          designation: string
          earned_basic: number | null
          earned_hra: number | null
          earned_os: number | null
          employee_code: string | null
          employee_id: string
          employee_name: string
          hra: number
          id: string
          ifsc_code: string | null
          insurance_deduction: number
          medical_allowance: number
          net_salary: number
          original_data: Json | null
          os_hours: number | null
          other_allowances: number
          other_deductions: number
          other_earning: number | null
          pay_period: string
          performance_allowance: number | null
          pf_deduction: number
          present_days: number | null
          salary_fixed_part: number | null
          salary_variable_part: number | null
          serial_number: number | null
          service_charge: number | null
          skill_allowance: number | null
          tax_deduction: number
          total_earning_gross: number | null
          transport_allowance: number
          updated_at: string
          working_days: number | null
        }
        Insert: {
          attendance_incentive?: number | null
          bank_account_number?: string | null
          bank_name?: string | null
          basic_salary?: number
          column_mappings?: Json | null
          company_address?: string
          company_name?: string
          created_at?: string
          department: string
          designation: string
          earned_basic?: number | null
          earned_hra?: number | null
          earned_os?: number | null
          employee_code?: string | null
          employee_id: string
          employee_name: string
          hra?: number
          id?: string
          ifsc_code?: string | null
          insurance_deduction?: number
          medical_allowance?: number
          net_salary?: number
          original_data?: Json | null
          os_hours?: number | null
          other_allowances?: number
          other_deductions?: number
          other_earning?: number | null
          pay_period: string
          performance_allowance?: number | null
          pf_deduction?: number
          present_days?: number | null
          salary_fixed_part?: number | null
          salary_variable_part?: number | null
          serial_number?: number | null
          service_charge?: number | null
          skill_allowance?: number | null
          tax_deduction?: number
          total_earning_gross?: number | null
          transport_allowance?: number
          updated_at?: string
          working_days?: number | null
        }
        Update: {
          attendance_incentive?: number | null
          bank_account_number?: string | null
          bank_name?: string | null
          basic_salary?: number
          column_mappings?: Json | null
          company_address?: string
          company_name?: string
          created_at?: string
          department?: string
          designation?: string
          earned_basic?: number | null
          earned_hra?: number | null
          earned_os?: number | null
          employee_code?: string | null
          employee_id?: string
          employee_name?: string
          hra?: number
          id?: string
          ifsc_code?: string | null
          insurance_deduction?: number
          medical_allowance?: number
          net_salary?: number
          original_data?: Json | null
          os_hours?: number | null
          other_allowances?: number
          other_deductions?: number
          other_earning?: number | null
          pay_period?: string
          performance_allowance?: number | null
          pf_deduction?: number
          present_days?: number | null
          salary_fixed_part?: number | null
          salary_variable_part?: number | null
          serial_number?: number | null
          service_charge?: number | null
          skill_allowance?: number | null
          tax_deduction?: number
          total_earning_gross?: number | null
          transport_allowance?: number
          updated_at?: string
          working_days?: number | null
        }
        Relationships: []
      }
      portal_users: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          password_hash: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      payroll_summary: {
        Row: {
          actual_records: number | null
          created_at: string | null
          file_name: string | null
          total_records: number | null
          upload_date: string | null
          upload_id: string | null
          upload_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "client"],
    },
  },
} as const
