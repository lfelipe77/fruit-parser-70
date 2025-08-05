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
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
