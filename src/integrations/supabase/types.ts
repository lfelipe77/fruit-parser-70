export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      action_logs: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string | null
          context: Json | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      backup_rate_limit_attempts: {
        Row: {
          action: string | null
          created_at: string | null
          id: string | null
          identifier: string | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id?: string | null
          identifier?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: string | null
          identifier?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ganhaveis: {
        Row: {
          affiliate_link: string | null
          category: string | null
          country_region: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          direct_purchase_link: string | null
          end_date: string | null
          goal_amount: number | null
          id: string
          image_url: string | null
          location: string | null
          lottery_type: string | null
          raised_amount: number | null
          sold_tickets: number | null
          start_date: string | null
          status: string | null
          subcategory: string | null
          ticket_price: number | null
          title: string
          total_tickets: number | null
          updated_at: string | null
        }
        Insert: {
          affiliate_link?: string | null
          category?: string | null
          country_region?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          direct_purchase_link?: string | null
          end_date?: string | null
          goal_amount?: number | null
          id?: string
          image_url?: string | null
          location?: string | null
          lottery_type?: string | null
          raised_amount?: number | null
          sold_tickets?: number | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          ticket_price?: number | null
          title: string
          total_tickets?: number | null
          updated_at?: string | null
        }
        Update: {
          affiliate_link?: string | null
          category?: string | null
          country_region?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          direct_purchase_link?: string | null
          end_date?: string | null
          goal_amount?: number | null
          id?: string
          image_url?: string | null
          location?: string | null
          lottery_type?: string | null
          raised_amount?: number | null
          sold_tickets?: number | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          ticket_price?: number | null
          title?: string
          total_tickets?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ganhaveis_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ganhavel_categories: {
        Row: {
          created_at: string | null
          descricao: string | null
          destaque: boolean | null
          icone_url: string | null
          id: string
          nome: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          icone_url?: string | null
          id?: string
          nome: string
          slug: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          icone_url?: string | null
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          action: string
          context: Json | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          context?: Json | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          context?: Json | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_results: {
        Row: {
          created_at: string | null
          ganhavel_id: string | null
          id: string
          lottery_draw_numbers: string | null
          result_date: string | null
          verified: boolean | null
          winning_ticket_id: string | null
        }
        Insert: {
          created_at?: string | null
          ganhavel_id?: string | null
          id?: string
          lottery_draw_numbers?: string | null
          result_date?: string | null
          verified?: boolean | null
          winning_ticket_id?: string | null
        }
        Update: {
          created_at?: string | null
          ganhavel_id?: string | null
          id?: string
          lottery_draw_numbers?: string | null
          result_date?: string | null
          verified?: boolean | null
          winning_ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "ganhaveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_results_winning_ticket_id_fkey"
            columns: ["winning_ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      public_visits: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          ip_address: string
          pathname: string
          referer: string | null
          url: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address: string
          pathname?: string
          referer?: string | null
          url: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string
          pathname?: string
          referer?: string | null
          url?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      raffles: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          organizer_id: string | null
          product_name: string | null
          product_value: number | null
          status: string | null
          ticket_price: number | null
          title: string | null
          total_tickets: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          organizer_id?: string | null
          product_name?: string | null
          product_value?: number | null
          status?: string | null
          ticket_price?: number | null
          title?: string | null
          total_tickets?: number | null
          user_id?: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          organizer_id?: string | null
          product_name?: string | null
          product_value?: number | null
          status?: string | null
          ticket_price?: number | null
          title?: string | null
          total_tickets?: number | null
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_attempts: {
        Row: {
          action: string
          created_at: string
          id: string
          identifier: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          identifier: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          identifier?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          context: Json | null
          created_at: string
          description: string
          id: string
          ip_address: string | null
          message: string | null
          meta: Json
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          description: string
          id?: string
          ip_address?: string | null
          message?: string | null
          meta?: Json
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          description?: string
          id?: string
          ip_address?: string | null
          message?: string | null
          meta?: Json
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string | null
          ganhavel_id: string | null
          id: string
          is_paid: boolean | null
          payment_session_id: string | null
          payment_status: string | null
          quantity: number | null
          raffle_id: string | null
          ticket_number: number | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          ganhavel_id?: string | null
          id?: string
          is_paid?: boolean | null
          payment_session_id?: string | null
          payment_status?: string | null
          quantity?: number | null
          raffle_id?: string | null
          ticket_number?: number | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          ganhavel_id?: string | null
          id?: string
          is_paid?: boolean | null
          payment_session_id?: string | null
          payment_status?: string | null
          quantity?: number | null
          raffle_id?: string | null
          ticket_number?: number | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "ganhaveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "ganhaveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          customer_email: string | null
          due_date: string | null
          ganhavel_id: string
          id: string
          payment_id: string | null
          payment_provider: string | null
          payment_reference: string | null
          received_at: string | null
          source: string | null
          status: string | null
          ticket_numbers: Json | null
          type: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          customer_email?: string | null
          due_date?: string | null
          ganhavel_id: string
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          received_at?: string | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          type?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          customer_email?: string | null
          due_date?: string | null
          ganhavel_id?: string
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          received_at?: string | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_ganhavel_fk"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "ganhaveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "ganhaveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          banned: boolean
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          location: string | null
          rating: number | null
          role: string | null
          social_links: Json | null
          total_ganhaveis: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          banned?: boolean
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          rating?: number | null
          role?: string | null
          social_links?: Json | null
          total_ganhaveis?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          banned?: boolean
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          rating?: number | null
          role?: string | null
          social_links?: Json | null
          total_ganhaveis?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ganhavel_categories_public: {
        Row: {
          descricao: string | null
          destaque: boolean | null
          icone_url: string | null
          id: string | null
          nome: string | null
          slug: string | null
        }
        Insert: {
          descricao?: string | null
          destaque?: boolean | null
          icone_url?: string | null
          id?: string | null
          nome?: string | null
          slug?: string | null
        }
        Update: {
          descricao?: string | null
          destaque?: boolean | null
          icone_url?: string | null
          id?: string | null
          nome?: string | null
          slug?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_ping: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      anonymize_ip: {
        Args: { ip_address: string }
        Returns: string
      }
      check_login_abuse: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_raffle_spam: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_rate_limit: {
        Args: {
          p_ip: string
          p_action: string
          window_seconds: number
          max_count: number
        }
        Returns: boolean
      }
      check_suspicious_actions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_security_alert: {
        Args: {
          alert_type: string
          alert_description: string
          alert_ip_address?: string
          alert_user_id?: string
          alert_context?: Json
          alert_severity?: string
        }
        Returns: string
      }
      create_security_alert_admin: {
        Args:
          | {
              p_type: string
              p_description: string
              p_severity?: string
              p_context?: Json
              p_ip_address?: string
              p_user_id?: string
            }
          | { p_type: string; p_message: string; p_meta: Json }
        Returns: undefined
      }
      create_security_alert_admin_v2: {
        Args: { p_type: string; p_message: string; p_meta: Json }
        Returns: undefined
      }
      example_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_logs: {
        Args: Record<PropertyKey, never> | { p_limit?: number }
        Returns: {
          action: string
          created_at: string | null
          details: string | null
          id: string
          user_id: string | null
        }[]
      }
      get_audit_logs_recent: {
        Args:
          | { p_limit?: number }
          | { p_limit?: number; p_minutes?: number; p_action?: string }
        Returns: {
          action: string | null
          context: Json | null
          created_at: string | null
          id: string
          user_id: string | null
        }[]
      }
      get_audit_statistics: {
        Args: { days_back?: number }
        Returns: {
          total_events: number
          login_events: number
          admin_actions: number
          payment_events: number
          security_events: number
          top_actions: Json
        }[]
      }
      get_current_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_my_audit_logs: {
        Args: { p_limit?: number; p_minutes?: number; p_action?: string }
        Returns: {
          id: string
          created_at: string
          action: string
          context: Json
        }[]
      }
      hello_secure: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { p_uid: string }
        Returns: boolean
      }
      log_audit_event: {
        Args:
          | { action: string; context: Json; actor_id: string }
          | { action: string; context?: Json }
        Returns: undefined
      }
      log_audit_event_json: {
        Args: { payload: Json }
        Returns: undefined
      }
      log_bulk_admin_action: {
        Args: { action_type: string; affected_ids: string[]; reason?: string }
        Returns: undefined
      }
      log_event: {
        Args: { user_id: string; action: string; context?: Json }
        Returns: undefined
      }
      log_public_visit: {
        Args:
          | {
              visit_ip: string
              visit_user_agent?: string
              visit_url?: string
              visit_referer?: string
              visit_country?: string
              visit_city?: string
            }
          | {
              visit_url: string
              visit_ip: string
              visit_user_agent?: string
              visit_user_id?: string
              dedup_minutes?: number
            }
        Returns: undefined
      }
      log_ticket_purchase: {
        Args: {
          p_user_id: string
          p_raffle_id: string
          p_ticket_count: number
          p_total_amount: number
        }
        Returns: undefined
      }
      log_user_action: {
        Args: { p_user_id: string; p_action_type: string; p_context?: Json }
        Returns: undefined
      }
      mask_audit_pii_row: {
        Args: { ctx: Json }
        Returns: Json
      }
      purge_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      purge_old_public_visits: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      purge_old_visit_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      request_password_reset: {
        Args: { user_email: string }
        Returns: string
      }
      run_security_checks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_audit_logs: {
        Args: {
          search_user_id?: string
          search_action?: string
          search_context?: string
          days_back?: number
          limit_results?: number
        }
        Returns: {
          id: string
          user_id: string
          action: string
          context: Json
          created_at: string
          user_email: string
        }[]
      }
      should_log_visit: {
        Args: { visit_ip: string; visit_url: string }
        Returns: boolean
      }
      some_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_role: {
        Args: { user_id: string; new_role: string }
        Returns: undefined
      }
      validate_rate_limit_before_action: {
        Args: {
          action_type: string
          user_identifier: string
          max_attempts?: number
          time_window_minutes?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
