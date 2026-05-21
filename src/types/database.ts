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
      members: {
        Row: {
          id: string;
          name: string;
          color: string;
          emoji: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          emoji?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string;
          estimated_budget_cop: number | null;
          monthly_savings_quota_cop: number | null;
          archived: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string;
          color: string;
          estimated_budget_cop?: number | null;
          monthly_savings_quota_cop?: number | null;
          archived?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          notes: string | null;
          priority: number;
          status: "pending" | "done";
          due_date: string | null;
          assignee_id: string | null;
          category_id: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          notes?: string | null;
          priority?: number;
          status?: "pending" | "done";
          due_date?: string | null;
          assignee_id?: string | null;
          category_id?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
      fixed_expenses: {
        Row: {
          id: string;
          name: string;
          amount_cop: number;
          payment_day: number;
          payment_link: string | null;
          category_id: string | null;
          active: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          amount_cop: number;
          payment_day: number;
          payment_link?: string | null;
          category_id?: string | null;
          active?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fixed_expenses"]["Insert"]>;
        Relationships: [];
      };
      fixed_expense_payments: {
        Row: {
          id: string;
          fixed_expense_id: string;
          year: number;
          month: number;
          paid: boolean;
          paid_at: string | null;
          paid_amount_cop: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fixed_expense_id: string;
          year: number;
          month: number;
          paid?: boolean;
          paid_at?: string | null;
          paid_amount_cop?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fixed_expense_payments"]["Insert"]>;
        Relationships: [];
      };
      one_time_expenses: {
        Row: {
          id: string;
          title: string;
          amount_cop: number;
          expense_date: string;
          status: "planned" | "purchased";
          purchase_link: string | null;
          location: string | null;
          assignee_id: string | null;
          category_id: string | null;
          include_in_monthly: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          amount_cop: number;
          expense_date?: string;
          status?: "planned" | "purchased";
          purchase_link?: string | null;
          location?: string | null;
          assignee_id?: string | null;
          category_id?: string | null;
          include_in_monthly?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["one_time_expenses"]["Insert"]>;
        Relationships: [];
      };
      monthly_budgets: {
        Row: {
          id: string;
          year: number;
          month: number;
          income_cop: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          year: number;
          month: number;
          income_cop: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["monthly_budgets"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      v_month_summary: {
        Row: {
          year: number;
          month: number;
          income_cop: number;
          fixed_total_cop: number;
          fixed_paid_cop: number;
          fixed_pending_cop: number;
          one_time_total_cop: number;
          balance_cop: number;
        };
        Relationships: [];
      };
      v_category_summary: {
        Row: {
          category_id: string;
          name: string;
          color: string;
          icon: string;
          estimated_budget_cop: number | null;
          monthly_savings_quota_cop: number | null;
          spent_cop: number;
          task_pending_count: number;
          task_done_count: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];
