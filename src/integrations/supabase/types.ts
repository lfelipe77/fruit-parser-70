export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          context?: Json | null
          created_at?: string | null
          id?: string
          payload?: Json | null
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
      categories: {
        Row: {
          created_at: string
          descricao: string | null
          destaque: boolean
          icone_url: string | null
          id: number
          nome: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          icone_url?: string | null
          id?: number
          nome: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          icone_url?: string | null
          id?: number
          nome?: string
          slug?: string
          sort_order?: number | null
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
      payouts: {
        Row: {
          commission_amount: number
          commission_pct: number
          created_at: string
          gross_amount: number
          id: string
          net_amount: number
          provider_fee_total: number
          raffle_id: string
          settled_at: string | null
        }
        Insert: {
          commission_amount: number
          commission_pct?: number
          created_at?: string
          gross_amount: number
          id?: string
          net_amount: number
          provider_fee_total?: number
          raffle_id: string
          settled_at?: string | null
        }
        Update: {
          commission_amount?: number
          commission_pct?: number
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          provider_fee_total?: number
          raffle_id?: string
          settled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
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
          category_id: number | null
          created_at: string | null
          description: string | null
          draw_date: string | null
          draw_timestamp: string | null
          id: string
          image_url: string | null
          organizer_id: string | null
          owner_user_id: string | null
          prize_value: number | null
          product_name: string | null
          product_value: number | null
          slug: string | null
          status: string | null
          ticket_price: number | null
          title: string | null
          total_tickets: number | null
          updated_at: string
          user_id: string
          winner_user_id: string | null
        }
        Insert: {
          category?: string | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          draw_date?: string | null
          draw_timestamp?: string | null
          id?: string
          image_url?: string | null
          organizer_id?: string | null
          owner_user_id?: string | null
          prize_value?: number | null
          product_name?: string | null
          product_value?: number | null
          slug?: string | null
          status?: string | null
          ticket_price?: number | null
          title?: string | null
          total_tickets?: number | null
          updated_at?: string
          user_id?: string
          winner_user_id?: string | null
        }
        Update: {
          category?: string | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          draw_date?: string | null
          draw_timestamp?: string | null
          id?: string
          image_url?: string | null
          organizer_id?: string | null
          owner_user_id?: string | null
          prize_value?: number | null
          product_name?: string | null
          product_value?: number | null
          slug?: string | null
          status?: string | null
          ticket_price?: number | null
          title?: string | null
          total_tickets?: number | null
          updated_at?: string
          user_id?: string
          winner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raffles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          number: number | null
          payment_session_id: string | null
          payment_status: string | null
          quantity: number | null
          raffle_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_number: number | null
          total_amount: number | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          ganhavel_id?: string | null
          id?: string
          is_paid?: boolean | null
          number?: number | null
          payment_session_id?: string | null
          payment_status?: string | null
          quantity?: number | null
          raffle_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: number | null
          total_amount?: number | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          ganhavel_id?: string | null
          id?: string
          is_paid?: boolean | null
          number?: number | null
          payment_session_id?: string | null
          payment_status?: string | null
          quantity?: number | null
          raffle_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: number | null
          total_amount?: number | null
          transaction_id?: string | null
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
            foreignKeyName: "tickets_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
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
          fee_amount: number | null
          fee_fixed: number | null
          fee_pct: number | null
          ganhavel_id: string
          id: string
          payment_id: string | null
          payment_provider: string | null
          payment_reference: string | null
          received_at: string | null
          source: string | null
          status: string | null
          ticket_numbers: Json | null
          total_amount_computed: number | null
          type: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          customer_email?: string | null
          due_date?: string | null
          fee_amount?: number | null
          fee_fixed?: number | null
          fee_pct?: number | null
          ganhavel_id: string
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          received_at?: string | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          total_amount_computed?: number | null
          type?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          customer_email?: string | null
          due_date?: string | null
          fee_amount?: number | null
          fee_fixed?: number | null
          fee_pct?: number | null
          ganhavel_id?: string
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          received_at?: string | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          total_amount_computed?: number | null
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
      transactions_raffle: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id: string
          raffle_id: string
          raw_payload: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id: string
          raffle_id: string
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id?: string
          raffle_id?: string
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_user_id_fkey"
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
          banned: boolean | null
          bio: string | null
          created_at: string | null
          display_name: string | null
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
          banned?: boolean | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
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
          banned?: boolean | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
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
      category_stats: {
        Row: {
          color_class: string | null
          featured: boolean | null
          ganhavel_count: number | null
          icon_name: string | null
          id: number | null
          name: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: []
      }
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
      raffles_public: {
        Row: {
          amount_collected: number | null
          category: string | null
          category_id: number | null
          created_at: string | null
          description: string | null
          draw_date: string | null
          draw_timestamp: string | null
          goal_amount: number | null
          id: string | null
          image_url: string | null
          organizer_id: string | null
          owner_user_id: string | null
          paid_tickets: number | null
          prize_value: number | null
          product_name: string | null
          product_value: number | null
          progress_pct: number | null
          slug: string | null
          status: string | null
          ticket_price: number | null
          tickets_remaining: number | null
          title: string | null
          total_tickets: number | null
          updated_at: string | null
          user_id: string | null
          winner_user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raffles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_raffle_ticket_stats: {
        Row: {
          paid_tickets: number | null
          raffle_id: string | null
          tickets_remaining: number | null
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
          max_count: number
          p_action: string
          p_ip: string
          window_seconds: number
        }
        Returns: boolean
      }
      check_suspicious_actions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      confirm_payment: {
        Args: {
          p_provider: Database["public"]["Enums"]["payment_provider"]
          p_provider_payment_id: string
        }
        Returns: undefined
      }
      create_raffle: {
        Args: {
          p_category_id: number
          p_description: string
          p_draw_date: string
          p_image_url: string
          p_prize_value: number
          p_ticket_price: number
          p_title: string
          p_total_tickets: number
        }
        Returns: string
      }
      create_security_alert: {
        Args: {
          alert_context?: Json
          alert_description: string
          alert_ip_address?: string
          alert_severity?: string
          alert_type: string
          alert_user_id?: string
        }
        Returns: string
      }
      create_security_alert_admin: {
        Args:
          | {
              p_context?: Json
              p_description: string
              p_ip_address?: string
              p_severity?: string
              p_type: string
              p_user_id?: string
            }
          | { p_message: string; p_meta: Json; p_type: string }
        Returns: undefined
      }
      create_security_alert_admin_v2: {
        Args: { p_message: string; p_meta: Json; p_type: string }
        Returns: undefined
      }
      current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      ensure_profile: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      example_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      finalize_payout: {
        Args: { p_raffle_id: string }
        Returns: string
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
          | { p_action?: string; p_limit?: number; p_minutes?: number }
          | { p_limit?: number }
        Returns: {
          action: string | null
          context: Json | null
          created_at: string | null
          id: string
          payload: Json | null
          user_id: string | null
        }[]
      }
      get_audit_statistics: {
        Args: { days_back?: number }
        Returns: {
          admin_actions: number
          login_events: number
          payment_events: number
          security_events: number
          top_actions: Json
          total_events: number
        }[]
      }
      get_current_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_my_audit_logs: {
        Args: { p_action?: string; p_limit?: number; p_minutes?: number }
        Returns: {
          action: string
          context: Json
          created_at: string
          id: string
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
          | { action: string; actor_id: string; context: Json }
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
        Args: { action: string; context?: Json; user_id: string }
        Returns: undefined
      }
      log_public_visit: {
        Args:
          | {
              dedup_minutes?: number
              visit_ip: string
              visit_url: string
              visit_user_agent?: string
              visit_user_id?: string
            }
          | {
              visit_city?: string
              visit_country?: string
              visit_ip: string
              visit_referer?: string
              visit_url?: string
              visit_user_agent?: string
            }
        Returns: undefined
      }
      log_ticket_purchase: {
        Args: {
          p_raffle_id: string
          p_ticket_count: number
          p_total_amount: number
          p_user_id: string
        }
        Returns: undefined
      }
      log_user_action: {
        Args: { p_action: string; p_payload: Json; p_user_id: string }
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
      reserve_tickets: {
        Args: { p_qty: number; p_raffle_id: string }
        Returns: number[]
      }
      run_security_checks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sanitize_audit_context: {
        Args: { input_context: Json }
        Returns: Json
      }
      search_audit_logs: {
        Args: {
          days_back?: number
          limit_results?: number
          search_action?: string
          search_context?: string
          search_user_id?: string
        }
        Returns: {
          action: string
          context: Json
          created_at: string
          id: string
          user_email: string
          user_id: string
        }[]
      }
      select_winner: {
        Args: { p_raffle_id: string }
        Returns: string
      }
      set_payment_context: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
        Args: { new_role: string; user_id: string }
        Returns: undefined
      }
      validate_rate_limit_before_action: {
        Args: {
          action_type: string
          max_attempts?: number
          time_window_minutes?: number
          user_identifier: string
        }
        Returns: boolean
      }
    }
    Enums: {
      payment_provider: "asaas" | "stripe"
      payment_status: "pending" | "paid" | "failed" | "refunded" | "canceled"
      raffle_status:
        | "draft"
        | "under_review"
        | "approved"
        | "rejected"
        | "closed"
        | "delivered"
      ticket_status: "reserved" | "paid" | "canceled"
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
    Enums: {
      payment_provider: ["asaas", "stripe"],
      payment_status: ["pending", "paid", "failed", "refunded", "canceled"],
      raffle_status: [
        "draft",
        "under_review",
        "approved",
        "rejected",
        "closed",
        "delivered",
      ],
      ticket_status: ["reserved", "paid", "canceled"],
    },
  },
} as const
