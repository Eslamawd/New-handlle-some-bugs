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
      admin_notifications: {
        Row: {
          amount: number | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          id: string
          is_read: boolean | null
          link_to: string | null
          message: string | null
          payment_method: string | null
          service_id: string | null
          service_name: string | null
          subscription_id: string | null
          title: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          is_read?: boolean | null
          link_to?: string | null
          message?: string | null
          payment_method?: string | null
          service_id?: string | null
          service_name?: string | null
          subscription_id?: string | null
          title?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          is_read?: boolean | null
          link_to?: string | null
          message?: string | null
          payment_method?: string | null
          service_id?: string | null
          service_name?: string | null
          subscription_id?: string | null
          title?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          added_at: string
          id: string
          price: number
          quantity: number
          service_id: string
          service_name: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          price: number
          quantity?: number
          service_id: string
          service_name: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          price?: number
          quantity?: number
          service_id?: string
          service_name?: string
          user_id?: string
        }
        Relationships: []
      }
      credential_stock: {
        Row: {
          created_at: string
          credentials: Json
          id: string
          order_id: string | null
          service_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credentials: Json
          id?: string
          order_id?: string | null
          service_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credentials?: Json
          id?: string
          order_id?: string | null
          service_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          account_id: string | null
          completed_at: string | null
          created_at: string
          credentials: Json | null
          duration_months: number | null
          id: string
          notes: string | null
          quantity: number
          service_id: string
          service_name: string
          status: string
          total_price: number
          user_id: string
        }
        Insert: {
          account_id?: string | null
          completed_at?: string | null
          created_at?: string
          credentials?: Json | null
          duration_months?: number | null
          id: string
          notes?: string | null
          quantity?: number
          service_id: string
          service_name: string
          status?: string
          total_price: number
          user_id: string
        }
        Update: {
          account_id?: string | null
          completed_at?: string | null
          created_at?: string
          credentials?: Json | null
          duration_months?: number | null
          id?: string
          notes?: string | null
          quantity?: number
          service_id?: string
          service_name?: string
          status?: string
          total_price?: number
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          method: string
          notes: string | null
          order_id: string | null
          receipt_url: string | null
          reviewed_at: string | null
          status: string
          transaction_id: string | null
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          method: string
          notes?: string | null
          order_id?: string | null
          receipt_url?: string | null
          reviewed_at?: string | null
          status: string
          transaction_id?: string | null
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          method?: string
          notes?: string | null
          order_id?: string | null
          receipt_url?: string | null
          reviewed_at?: string | null
          status?: string
          transaction_id?: string | null
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          balance?: number | null
          company?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          balance?: number | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      servex: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      service_pricing: {
        Row: {
          created_at: string
          duration_months: number
          id: string
          price: number
          service_id: string
          updated_at: string
          wholesale_price: number
        }
        Insert: {
          created_at?: string
          duration_months: number
          id?: string
          price: number
          service_id: string
          updated_at?: string
          wholesale_price: number
        }
        Update: {
          created_at?: string
          duration_months?: number
          id?: string
          price?: number
          service_id?: string
          updated_at?: string
          wholesale_price?: number
        }
        Relationships: []
      }
      stock_issue_logs: {
        Row: {
          created_at: string
          customer_name: string | null
          fulfilled_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          priority: string | null
          resolved_at: string | null
          service_id: string
          service_name: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          priority?: string | null
          resolved_at?: string | null
          service_id: string
          service_name?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          priority?: string | null
          resolved_at?: string | null
          service_id?: string
          service_name?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          credential_stock_id: string | null
          credentials: Json | null
          duration_months: number | null
          end_date: string
          id: string
          service_id: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_stock_id?: string | null
          credentials?: Json | null
          duration_months?: number | null
          end_date: string
          id?: string
          service_id: string
          start_date?: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          credential_stock_id?: string | null
          credentials?: Json | null
          duration_months?: number | null
          end_date?: string
          id?: string
          service_id?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_credential_stock_id_fkey"
            columns: ["credential_stock_id"]
            isOneToOne: false
            referencedRelation: "credential_stock"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wholesale_customers: {
        Row: {
          address: string | null
          balance: number | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          wholesaler_id: string
        }
        Insert: {
          address?: string | null
          balance?: number | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          wholesaler_id: string
        }
        Update: {
          address?: string | null
          balance?: number | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          wholesaler_id?: string
        }
        Relationships: []
      }
      wholesale_metrics: {
        Row: {
          average_order_value: number
          created_at: string | null
          id: string
          monthly_sales: Json | null
          sales_by_customer: Json | null
          sales_by_service: Json | null
          total_customers: number
          total_sales: number
          total_services: number
          updated_at: string | null
          wholesaler_id: string
        }
        Insert: {
          average_order_value?: number
          created_at?: string | null
          id?: string
          monthly_sales?: Json | null
          sales_by_customer?: Json | null
          sales_by_service?: Json | null
          total_customers?: number
          total_sales?: number
          total_services?: number
          updated_at?: string | null
          wholesaler_id: string
        }
        Update: {
          average_order_value?: number
          created_at?: string | null
          id?: string
          monthly_sales?: Json | null
          sales_by_customer?: Json | null
          sales_by_service?: Json | null
          total_customers?: number
          total_sales?: number
          total_services?: number
          updated_at?: string | null
          wholesaler_id?: string
        }
        Relationships: []
      }
      wholesale_orders: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_company: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          duration_months: number | null
          id: string
          notes: string | null
          quantity: number | null
          service_id: string
          status: string
          total_price: number
          updated_at: string
          wholesaler_id: string | null
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_company?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          duration_months?: number | null
          id?: string
          notes?: string | null
          quantity?: number | null
          service_id: string
          status?: string
          total_price: number
          updated_at?: string
          wholesaler_id?: string | null
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_company?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          duration_months?: number | null
          id?: string
          notes?: string | null
          quantity?: number | null
          service_id?: string
          status?: string
          total_price?: number
          updated_at?: string
          wholesaler_id?: string | null
        }
        Relationships: []
      }
      wholesale_subscriptions: {
        Row: {
          created_at: string
          credentials: Json | null
          customer_id: string
          duration_months: number | null
          end_date: string
          id: string
          service_id: string
          start_date: string
          status: string
          updated_at: string
          wholesaler_id: string
        }
        Insert: {
          created_at?: string
          credentials?: Json | null
          customer_id: string
          duration_months?: number | null
          end_date: string
          id?: string
          service_id: string
          start_date?: string
          status?: string
          updated_at?: string
          wholesaler_id: string
        }
        Update: {
          created_at?: string
          credentials?: Json | null
          customer_id?: string
          duration_months?: number | null
          end_date?: string
          id?: string
          service_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          wholesaler_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "wholesale_customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_credential: {
        Args: {
          p_service_id: string
          p_user_id: string
          p_order_id: string
        }
        Returns: string
      }
      check_credential_stock: {
        Args: {
          service_id: string
        }
        Returns: number
      }
      has_role: {
        Args: {
          role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "wholesale"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
