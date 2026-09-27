export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: 'admin' | 'staff';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          role?: 'admin' | 'staff';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          role?: 'admin' | 'staff';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          joining_date: string;
          salary_type: 'Fixed' | 'Commission' | 'Per Job' | 'Percentage' | 'Hybrid' | 'Fixed Monthly';
          monthly_salary: number;
          commission_percentage: number;
          status: 'Active' | 'Inactive' | 'On Leave';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          joining_date?: string;
          salary_type?: 'Fixed' | 'Commission' | 'Per Job' | 'Percentage' | 'Hybrid' | 'Fixed Monthly';
          monthly_salary?: number;
          commission_percentage?: number;
          status?: 'Active' | 'Inactive' | 'On Leave';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          joining_date?: string;
          salary_type?: 'Fixed' | 'Commission' | 'Per Job' | 'Percentage' | 'Hybrid' | 'Fixed Monthly';
          monthly_salary?: number;
          commission_percentage?: number;
          status?: 'Active' | 'Inactive' | 'On Leave';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_income: {
        Row: {
          id: string;
          date: string;
          staff_id: string | null;
          daily_total: number;
          number_of_jobs: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          staff_id?: string | null;
          daily_total: number;
          number_of_jobs?: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          staff_id?: string | null;
          daily_total?: number;
          number_of_jobs?: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expense_categories: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          expense_date: string;
          category: string;
          description: string;
          amount: number;
          paid_by: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expense_date?: string;
          category: string;
          description: string;
          amount: number;
          paid_by?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          expense_date?: string;
          category?: string;
          description?: string;
          amount?: number;
          paid_by?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      salary_payments: {
        Row: {
          id: string;
          staff_id: string;
          salary_month: string;
          basic_salary: number;
          bonus: number;
          commission: number;
          deductions: number;
          other_payments: number;
          final_salary: number;
          payment_status: 'Paid' | 'Pending' | 'Partially Paid' | 'Processing';
          payment_date: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          salary_month: string;
          basic_salary: number;
          bonus?: number;
          commission?: number;
          deductions?: number;
          other_payments?: number;
          final_salary: number;
          payment_status?: 'Paid' | 'Pending' | 'Partially Paid' | 'Processing';
          payment_date?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          staff_id?: string;
          salary_month?: string;
          basic_salary?: number;
          bonus?: number;
          commission?: number;
          deductions?: number;
          other_payments?: number;
          final_salary?: number;
          payment_status?: 'Paid' | 'Pending' | 'Partially Paid' | 'Processing';
          payment_date?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
