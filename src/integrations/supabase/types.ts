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
            referencedRelation: "user_profile_preview"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "user_profile_preview"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "user_profile_preview"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "user_profile_preview"
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
          ganhavel_id: string | null
          id: string
          payment_id: string | null
          payment_provider: string | null
          payment_reference: string | null
          received_at: string | null
          source: string | null
          status: string | null
          ticket_numbers: Json | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          customer_email?: string | null
          due_date?: string | null
          ganhavel_id?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          received_at?: string | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          customer_email?: string | null
          due_date?: string | null
          ganhavel_id?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          received_at?: string | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
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
            referencedRelation: "user_profile_preview"
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
            referencedRelation: "user_profile_preview"
            referencedColumns: ["id"]
          },
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
      admin_log_view: {
        Row: {
          action: string | null
          context: Json | null
          created_at: string | null
          id: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_activity_log_translated: {
        Row: {
          action: string | null
          created_at: string | null
          details: string | null
          id: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: string | null
          id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: string | null
          id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_log_view: {
        Row: {
          action: string | null
          created_at: string | null
          details: string | null
          id: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: string | null
          id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: string | null
          id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile_preview: {
        Row: {
          id: string | null
          username: string | null
        }
        Insert: {
          id?: string | null
          username?: string | null
        }
        Update: {
          id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_admin_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          action: string
          context: Json
          created_at: string
        }[]
      }
      get_current_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      log_audit_event: {
        Args: { action: string; context?: Json }
        Returns: undefined
      }
      log_event: {
        Args: { user_id: string; action: string; context?: Json }
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
      update_user_role: {
        Args: { user_id: string; new_role: string }
        Returns: undefined
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
