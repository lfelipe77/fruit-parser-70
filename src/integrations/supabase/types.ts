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
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      asaas_webhook_logs: {
        Row: {
          event: string | null
          id: number
          raw: Json
          received_at: string | null
        }
        Insert: {
          event?: string | null
          id?: number
          raw: Json
          received_at?: string | null
        }
        Update: {
          event?: string | null
          id?: number
          raw?: Json
          received_at?: string | null
        }
        Relationships: []
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
      brazil_cities: {
        Row: {
          ibge_code: number | null
          id: string
          name: string
          uf: string
        }
        Insert: {
          ibge_code?: number | null
          id?: string
          name: string
          uf: string
        }
        Update: {
          ibge_code?: number | null
          id?: string
          name?: string
          uf?: string
        }
        Relationships: [
          {
            foreignKeyName: "brazil_cities_uf_fkey"
            columns: ["uf"]
            isOneToOne: false
            referencedRelation: "brazil_states"
            referencedColumns: ["uf"]
          },
        ]
      }
      brazil_states: {
        Row: {
          name: string
          uf: string
        }
        Insert: {
          name: string
          uf: string
        }
        Update: {
          name?: string
          uf?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          descricao: string | null
          destaque: boolean
          icon_emoji: string | null
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
          icon_emoji?: string | null
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
          icon_emoji?: string | null
          icone_url?: string | null
          id?: number
          nome?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      federal_draws: {
        Row: {
          concurso_number: string
          created_at: string | null
          draw_date: string
          first_prize: string | null
          id: number
          prizes: Json
          raw: Json | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          concurso_number: string
          created_at?: string | null
          draw_date: string
          first_prize?: string | null
          id?: number
          prizes?: Json
          raw?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          concurso_number?: string
          created_at?: string | null
          draw_date?: string
          first_prize?: string | null
          id?: number
          prizes?: Json
          raw?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ganhaveis_legacy: {
        Row: {
          affiliate_link: string | null
          category: string | null
          category_id: number | null
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
          product_name: string | null
          raised_amount: number | null
          sold_tickets: number | null
          start_date: string | null
          status: string | null
          subcategory: string | null
          subcategory_id: string | null
          ticket_price: number | null
          title: string
          total_tickets: number | null
          updated_at: string | null
        }
        Insert: {
          affiliate_link?: string | null
          category?: string | null
          category_id?: number | null
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
          product_name?: string | null
          raised_amount?: number | null
          sold_tickets?: number | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          subcategory_id?: string | null
          ticket_price?: number | null
          title: string
          total_tickets?: number | null
          updated_at?: string | null
        }
        Update: {
          affiliate_link?: string | null
          category?: string | null
          category_id?: number | null
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
          product_name?: string | null
          raised_amount?: number | null
          sold_tickets?: number | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          subcategory_id?: string | null
          ticket_price?: number | null
          title?: string
          total_tickets?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ganhaveis_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganhaveis_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganhaveis_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganhaveis_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganhaveis_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganhaveis_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganhaveis_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganhaveis_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganhaveis_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganhaveis_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategory_stats"
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
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_draws: {
        Row: {
          draw_date: string
          draw_ref: string
          id: number
          result_json: Json | null
          source: string
        }
        Insert: {
          draw_date: string
          draw_ref: string
          id?: number
          result_json?: Json | null
          source: string
        }
        Update: {
          draw_date?: string
          draw_ref?: string
          id?: number
          result_json?: Json | null
          source?: string
        }
        Relationships: []
      }
      lottery_latest_federal_store: {
        Row: {
          concurso_number: string
          draw_date: string
          game_slug: string
          numbers: string[]
          updated_at: string
        }
        Insert: {
          concurso_number: string
          draw_date: string
          game_slug?: string
          numbers: string[]
          updated_at?: string
        }
        Update: {
          concurso_number?: string
          draw_date?: string
          game_slug?: string
          numbers?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      lottery_latest_results: {
        Row: {
          concurso_number: string
          created_at: string | null
          draw_date: string | null
          game_name: string
          game_slug: string
          id: number
          numbers: Json
          raw: Json | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          concurso_number: string
          created_at?: string | null
          draw_date?: string | null
          game_name: string
          game_slug: string
          id?: number
          numbers?: Json
          raw?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          concurso_number?: string
          created_at?: string | null
          draw_date?: string | null
          game_name?: string
          game_slug?: string
          id?: number
          numbers?: Json
          raw?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lottery_next_draws: {
        Row: {
          game_name: string
          game_slug: string
          id: number
          next_date: string | null
          next_time: string | null
          raw: Json | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          game_name: string
          game_slug: string
          id?: number
          next_date?: string | null
          next_time?: string | null
          raw?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          game_name?: string
          game_slug?: string
          id?: number
          next_date?: string | null
          next_time?: string | null
          raw?: Json | null
          source_url?: string | null
          updated_at?: string | null
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
            referencedRelation: "ganhaveis_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_results_winning_ticket_id_fkey"
            columns: ["winning_ticket_id"]
            isOneToOne: false
            referencedRelation: "mv_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "lottery_results_winning_ticket_id_fkey"
            columns: ["winning_ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_results_winning_ticket_id_fkey"
            columns: ["winning_ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "lottery_results_winning_ticket_id_fkey"
            columns: ["winning_ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_numbers_resolved"
            referencedColumns: ["ticket_id"]
          },
        ]
      }
      payments_pending: {
        Row: {
          amount: number
          asaas_payment_id: string
          created_at: string
          expires_at: string
          id: string
          reservation_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          asaas_payment_id: string
          created_at?: string
          expires_at: string
          id?: string
          reservation_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          asaas_payment_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          reservation_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments_verified: {
        Row: {
          amount: number
          buyer_user_id: string | null
          created_at: string
          id: string
          provider: string
          provider_txid: string | null
          qty: number
          raffle_id: string
          status: string
        }
        Insert: {
          amount: number
          buyer_user_id?: string | null
          created_at?: string
          id?: string
          provider?: string
          provider_txid?: string | null
          qty?: number
          raffle_id: string
          status?: string
        }
        Update: {
          amount?: number
          buyer_user_id?: string | null
          created_at?: string
          id?: string
          provider?: string
          provider_txid?: string | null
          qty?: number
          raffle_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
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
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
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
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
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
      raffle_counters: {
        Row: {
          next_number: number
          raffle_id: string
        }
        Insert: {
          next_number?: number
          raffle_id: string
        }
        Update: {
          next_number?: number
          raffle_id?: string
        }
        Relationships: []
      }
      raffle_winner_logs: {
        Row: {
          concurso_number: string
          created_at: string | null
          draw_date: string
          error: string | null
          fetched_url: string | null
          game_slug: string
          header_authorized: boolean | null
          header_present: boolean | null
          http_status: number | null
          id: string
          meta: Json | null
          numbers: string[]
          pick_method: string
          picked_at: string
          provider: string
          raffle_id: string | null
          request_id: string | null
          status: string | null
          ticket_id: string | null
          updated_at: string | null
          user_id: string | null
          winners: Json | null
          winning_key: string
          winning_pairs: string[]
        }
        Insert: {
          concurso_number: string
          created_at?: string | null
          draw_date: string
          error?: string | null
          fetched_url?: string | null
          game_slug: string
          header_authorized?: boolean | null
          header_present?: boolean | null
          http_status?: number | null
          id?: string
          meta?: Json | null
          numbers?: string[]
          pick_method: string
          picked_at?: string
          provider: string
          raffle_id?: string | null
          request_id?: string | null
          status?: string | null
          ticket_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          winners?: Json | null
          winning_key: string
          winning_pairs: string[]
        }
        Update: {
          concurso_number?: string
          created_at?: string | null
          draw_date?: string
          error?: string | null
          fetched_url?: string | null
          game_slug?: string
          header_authorized?: boolean | null
          header_present?: boolean | null
          http_status?: number | null
          id?: string
          meta?: Json | null
          numbers?: string[]
          pick_method?: string
          picked_at?: string
          provider?: string
          raffle_id?: string | null
          request_id?: string | null
          status?: string | null
          ticket_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          winners?: Json | null
          winning_key?: string
          winning_pairs?: string[]
        }
        Relationships: []
      }
      raffle_winners: {
        Row: {
          concurso_number: string
          created_at: string | null
          delta: number
          draw_date: string
          drawn_number: string
          id: number
          raffle_id: string
          source: string
          ticket_id: string
          ticket_number: string
          user_id: string
        }
        Insert: {
          concurso_number: string
          created_at?: string | null
          delta: number
          draw_date: string
          drawn_number: string
          id?: number
          raffle_id: string
          source?: string
          ticket_id: string
          ticket_number: string
          user_id: string
        }
        Update: {
          concurso_number?: string
          created_at?: string | null
          delta?: number
          draw_date?: string
          drawn_number?: string
          id?: number
          raffle_id?: string
          source?: string
          ticket_id?: string
          ticket_number?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "mv_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_numbers_resolved"
            referencedColumns: ["ticket_id"]
          },
        ]
      }
      raffles: {
        Row: {
          category: string | null
          category_id: number | null
          city: string | null
          city_id: string | null
          closed_at: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          direct_purchase_link: string | null
          draw_date: string | null
          draw_ref: string | null
          draw_source: string | null
          draw_timestamp: string | null
          funded_at: string | null
          goal_amount: number | null
          id: string
          image_url: string | null
          location_city: string | null
          location_state: string | null
          organizer_id: string | null
          owner_user_id: string | null
          prize_value: number | null
          product_name: string | null
          product_value: number | null
          published: boolean | null
          slug: string | null
          state: string | null
          state_uf: string | null
          status: string | null
          subcategory_id: string | null
          ticket_price: number | null
          title: string | null
          total_tickets: number | null
          updated_at: string
          user_id: string
          vendor_link: string | null
          winner_ticket_id: string | null
          winner_user_id: string | null
          winners: Json | null
          winning_numbers: Json | null
        }
        Insert: {
          category?: string | null
          category_id?: number | null
          city?: string | null
          city_id?: string | null
          closed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          direct_purchase_link?: string | null
          draw_date?: string | null
          draw_ref?: string | null
          draw_source?: string | null
          draw_timestamp?: string | null
          funded_at?: string | null
          goal_amount?: number | null
          id?: string
          image_url?: string | null
          location_city?: string | null
          location_state?: string | null
          organizer_id?: string | null
          owner_user_id?: string | null
          prize_value?: number | null
          product_name?: string | null
          product_value?: number | null
          published?: boolean | null
          slug?: string | null
          state?: string | null
          state_uf?: string | null
          status?: string | null
          subcategory_id?: string | null
          ticket_price?: number | null
          title?: string | null
          total_tickets?: number | null
          updated_at?: string
          user_id?: string
          vendor_link?: string | null
          winner_ticket_id?: string | null
          winner_user_id?: string | null
          winners?: Json | null
          winning_numbers?: Json | null
        }
        Update: {
          category?: string | null
          category_id?: number | null
          city?: string | null
          city_id?: string | null
          closed_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          direct_purchase_link?: string | null
          draw_date?: string | null
          draw_ref?: string | null
          draw_source?: string | null
          draw_timestamp?: string | null
          funded_at?: string | null
          goal_amount?: number | null
          id?: string
          image_url?: string | null
          location_city?: string | null
          location_state?: string | null
          organizer_id?: string | null
          owner_user_id?: string | null
          prize_value?: number | null
          product_name?: string | null
          product_value?: number | null
          published?: boolean | null
          slug?: string | null
          state?: string | null
          state_uf?: string | null
          status?: string | null
          subcategory_id?: string | null
          ticket_price?: number | null
          title?: string | null
          total_tickets?: number | null
          updated_at?: string
          user_id?: string
          vendor_link?: string | null
          winner_ticket_id?: string | null
          winner_user_id?: string | null
          winners?: Json | null
          winning_numbers?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategory_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "categories_public_ext"
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
            foreignKeyName: "raffles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "brazil_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
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
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_state_uf_fkey"
            columns: ["state_uf"]
            isOneToOne: false
            referencedRelation: "brazil_states"
            referencedColumns: ["uf"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategory_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_ticket_id_fkey"
            columns: ["winner_ticket_id"]
            isOneToOne: false
            referencedRelation: "mv_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffles_winner_ticket_id_fkey"
            columns: ["winner_ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_ticket_id_fkey"
            columns: ["winner_ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffles_winner_ticket_id_fkey"
            columns: ["winner_ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_numbers_resolved"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
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
      reservation_audit_cache: {
        Row: {
          all_paid: boolean
          any_paid: boolean
          buyer_user_id: string
          first_ticket_at: string | null
          last_provider: string | null
          last_provider_payment_id: string | null
          last_ticket_at: string | null
          last_tx_amount: number | null
          last_tx_at: string | null
          last_tx_status: string | null
          raffle_id: string
          reservation_id: string
          ticket_count: number
          ticket_numbers: number[] | null
          ticket_statuses: Database["public"]["Enums"]["ticket_status"][] | null
          updated_at: string | null
        }
        Insert: {
          all_paid: boolean
          any_paid: boolean
          buyer_user_id: string
          first_ticket_at?: string | null
          last_provider?: string | null
          last_provider_payment_id?: string | null
          last_ticket_at?: string | null
          last_tx_amount?: number | null
          last_tx_at?: string | null
          last_tx_status?: string | null
          raffle_id: string
          reservation_id: string
          ticket_count: number
          ticket_numbers?: number[] | null
          ticket_statuses?:
            | Database["public"]["Enums"]["ticket_status"][]
            | null
          updated_at?: string | null
        }
        Update: {
          all_paid?: boolean
          any_paid?: boolean
          buyer_user_id?: string
          first_ticket_at?: string | null
          last_provider?: string | null
          last_provider_payment_id?: string | null
          last_ticket_at?: string | null
          last_tx_amount?: number | null
          last_tx_at?: string | null
          last_tx_status?: string | null
          raffle_id?: string
          reservation_id?: string
          ticket_count?: number
          ticket_numbers?: number[] | null
          ticket_statuses?:
            | Database["public"]["Enums"]["ticket_status"][]
            | null
          updated_at?: string | null
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
      subcategories: {
        Row: {
          category_id: number
          created_at: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          category_id: number
          created_at?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          category_id?: number
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_picks: {
        Row: {
          created_at: string | null
          id: string
          numbers: number[]
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          numbers: number[]
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          numbers?: number[]
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_picks_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "mv_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "ticket_picks_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_picks_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "ticket_picks_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_numbers_resolved"
            referencedColumns: ["ticket_id"]
          },
        ]
      }
      tickets: {
        Row: {
          buyer_user_id: string | null
          created_at: string | null
          ganhavel_id: string | null
          id: string
          is_paid: boolean | null
          number: number | null
          numbers: Json | null
          payment_session_id: string | null
          payment_status: string | null
          qty: number | null
          quantity: number | null
          raffle_id: string | null
          reservation_id: string | null
          reserved_by: string | null
          reserved_until: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_number: number | null
          total_amount: number | null
          transaction_id: string | null
          unit_price: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          buyer_user_id?: string | null
          created_at?: string | null
          ganhavel_id?: string | null
          id?: string
          is_paid?: boolean | null
          number?: number | null
          numbers?: Json | null
          payment_session_id?: string | null
          payment_status?: string | null
          qty?: number | null
          quantity?: number | null
          raffle_id?: string | null
          reservation_id?: string | null
          reserved_by?: string | null
          reserved_until?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: number | null
          total_amount?: number | null
          transaction_id?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          buyer_user_id?: string | null
          created_at?: string | null
          ganhavel_id?: string | null
          id?: string
          is_paid?: boolean | null
          number?: number | null
          numbers?: Json | null
          payment_session_id?: string | null
          payment_status?: string | null
          qty?: number | null
          quantity?: number | null
          raffle_id?: string | null
          reservation_id?: string | null
          reserved_by?: string | null
          reserved_until?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: number | null
          total_amount?: number | null
          transaction_id?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "ganhaveis_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "my_tickets_ext"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "tickets_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "my_tickets_ext_v2"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "tickets_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "my_tickets_ext_v3"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "tickets_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "my_tickets_ext_v5"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "tickets_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "my_tickets_ext_v6"
            referencedColumns: ["transaction_id"]
          },
          {
            foreignKeyName: "tickets_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions_paid_flat"
            referencedColumns: ["src_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          buyer_user_id: string | null
          created_at: string | null
          customer_cpf: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          due_date: string | null
          fee_amount: number | null
          fee_fixed: number | null
          fee_pct: number | null
          id: string
          numbers: Json
          payment_id: string | null
          payment_provider: string | null
          payment_reference: string | null
          provider: string | null
          provider_payment_id: string | null
          provider_ref: string | null
          raffle_id: string
          received_at: string | null
          reservation_id: string | null
          selected_numbers: string[] | null
          source: string | null
          status: string | null
          ticket_numbers: Json | null
          total_amount_computed: number | null
          type: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          buyer_user_id?: string | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          fee_amount?: number | null
          fee_fixed?: number | null
          fee_pct?: number | null
          id?: string
          numbers?: Json
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          provider_ref?: string | null
          raffle_id: string
          received_at?: string | null
          reservation_id?: string | null
          selected_numbers?: string[] | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          total_amount_computed?: number | null
          type?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          buyer_user_id?: string | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          fee_amount?: number | null
          fee_fixed?: number | null
          fee_pct?: number | null
          id?: string
          numbers?: Json
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          provider_ref?: string | null
          raffle_id?: string
          received_at?: string | null
          reservation_id?: string | null
          selected_numbers?: string[] | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          total_amount_computed?: number | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
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
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
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
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
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
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
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
          facebook: string | null
          full_name: string | null
          id: string
          instagram: string | null
          location: string | null
          rating: number | null
          role: string | null
          social_links: Json | null
          tax_id: string | null
          tax_kind: string | null
          telegram: string | null
          tiktok: string | null
          total_ganhaveis: number | null
          twitter: string | null
          updated_at: string | null
          username: string | null
          website_url: string | null
          whatsapp: string | null
          youtube: string | null
        }
        Insert: {
          avatar_url?: string | null
          banned?: boolean | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          facebook?: string | null
          full_name?: string | null
          id: string
          instagram?: string | null
          location?: string | null
          rating?: number | null
          role?: string | null
          social_links?: Json | null
          tax_id?: string | null
          tax_kind?: string | null
          telegram?: string | null
          tiktok?: string | null
          total_ganhaveis?: number | null
          twitter?: string | null
          updated_at?: string | null
          username?: string | null
          website_url?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Update: {
          avatar_url?: string | null
          banned?: boolean | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          facebook?: string | null
          full_name?: string | null
          id?: string
          instagram?: string | null
          location?: string | null
          rating?: number | null
          role?: string | null
          social_links?: Json | null
          tax_id?: string | null
          tax_kind?: string | null
          telegram?: string | null
          tiktok?: string | null
          total_ganhaveis?: number | null
          twitter?: string | null
          updated_at?: string | null
          username?: string | null
          website_url?: string | null
          whatsapp?: string | null
          youtube?: string | null
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
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_latest_federal_status: {
        Row: {
          concurso_number: string | null
          draw_date: string | null
          last_header_authorized: boolean | null
          last_header_present: boolean | null
          last_log_at: string | null
          last_pick_ok: boolean | null
          last_status: string | null
          latest_store_updated_at: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string | null
        }
        Insert: {
          id?: string | null
        }
        Update: {
          id?: string | null
        }
        Relationships: []
      }
      categories_public_ext: {
        Row: {
          created_at: string | null
          description: string | null
          featured: boolean | null
          icon_emoji: string | null
          icon_url: string | null
          id: number | null
          name: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          icon_emoji?: string | null
          icon_url?: string | null
          id?: number | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          icon_emoji?: string | null
          icon_url?: string | null
          id?: number | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      category_stats: {
        Row: {
          active_count: number | null
          color_class: string | null
          featured: boolean | null
          icon_name: string | null
          icone_url: string | null
          id: number | null
          name: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: []
      }
      federal_draw_latest: {
        Row: {
          concurso_number: string | null
          created_at: string | null
          draw_date: string | null
          first_prize: string | null
          id: number | null
          prizes: Json | null
          raw: Json | null
          source_url: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      ganhavel_categories_public: {
        Row: {
          active_raffles: number | null
          descricao: string | null
          destaque: boolean | null
          icone_url: string | null
          id: number | null
          nome: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: []
      }
      lottery_latest_federal: {
        Row: {
          concurso_number: string | null
          draw_date: string | null
          game_slug: string | null
          numbers: string[] | null
        }
        Insert: {
          concurso_number?: string | null
          draw_date?: string | null
          game_slug?: string | null
          numbers?: string[] | null
        }
        Update: {
          concurso_number?: string | null
          draw_date?: string | null
          game_slug?: string | null
          numbers?: string[] | null
        }
        Relationships: []
      }
      lottery_latest_per_game: {
        Row: {
          concurso_number: string | null
          created_at: string | null
          draw_date: string | null
          game_name: string | null
          game_slug: string | null
          id: number | null
          numbers: Json | null
          raw: Json | null
          source_url: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      lottery_next_draws_latest: {
        Row: {
          game_name: string | null
          game_slug: string | null
          id: number | null
          next_date: string | null
          next_time: string | null
          raw: Json | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          game_name?: string | null
          game_slug?: string | null
          id?: number | null
          next_date?: string | null
          next_time?: string | null
          raw?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          game_name?: string | null
          game_slug?: string | null
          id?: number | null
          next_date?: string | null
          next_time?: string | null
          raw?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mv_ticket_keys: {
        Row: {
          created_at: string | null
          numbers_key: string | null
          numbers_key_num: number | null
          raffle_id: string | null
          ticket_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      my_tickets_ext: {
        Row: {
          amount_raised: number | null
          buyer_user_id: string | null
          customer_cpf_mask: string | null
          customer_full_legal_name: string | null
          customer_phone: string | null
          draw_date: string | null
          goal_amount: number | null
          progress_pct_money: number | null
          purchase_date: string | null
          purchased_numbers: Json | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_title: string | null
          ticket_count: number | null
          transaction_id: string | null
          tx_status: string | null
          value: number | null
          winner_ticket_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raffles_winner_ticket_id_fkey"
            columns: ["winner_ticket_id"]
            isOneToOne: false
            referencedRelation: "mv_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffles_winner_ticket_id_fkey"
            columns: ["winner_ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_ticket_id_fkey"
            columns: ["winner_ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffles_winner_ticket_id_fkey"
            columns: ["winner_ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_numbers_resolved"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
        ]
      }
      my_tickets_ext_v2: {
        Row: {
          amount_raised: number | null
          buyer_user_id: string | null
          draw_date: string | null
          goal_amount: number | null
          progress_pct_money: number | null
          purchase_date: string | null
          purchased_numbers: Json | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_title: string | null
          ticket_count: number | null
          transaction_id: string | null
          tx_status: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
        ]
      }
      my_tickets_ext_v3: {
        Row: {
          amount_raised: number | null
          buyer_user_id: string | null
          draw_date: string | null
          goal_amount: number | null
          progress_pct_money: number | null
          purchase_date: string | null
          purchased_numbers: Json | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_title: string | null
          ticket_count: number | null
          transaction_id: string | null
          tx_status: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
        ]
      }
      my_tickets_ext_v5: {
        Row: {
          amount_raised: number | null
          buyer_user_id: string | null
          draw_date: string | null
          goal_amount: number | null
          progress_pct_money: number | null
          purchase_date: string | null
          purchased_numbers: Json | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_title: string | null
          ticket_count: number | null
          transaction_id: string | null
          tx_status: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
        ]
      }
      my_tickets_ext_v6: {
        Row: {
          amount_raised: number | null
          buyer_user_id: string | null
          draw_date: string | null
          goal_amount: number | null
          progress_pct_money: number | null
          purchase_date: string | null
          purchased_numbers: Json | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_title: string | null
          ticket_count: number | null
          transaction_id: string | null
          tx_status: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
        ]
      }
      paid_statuses: {
        Row: {
          s: string | null
        }
        Relationships: []
      }
      payments_all: {
        Row: {
          amount: number | null
          buyer_user_id: string | null
          created_at: string | null
          provider: string | null
          provider_txid: string | null
          qty: number | null
          raffle_id: string | null
          src_id: string | null
          status: string | null
        }
        Relationships: []
      }
      payments_verified_flat: {
        Row: {
          amount: number | null
          buyer_user_id: string | null
          created_at: string | null
          provider: string | null
          provider_txid: string | null
          qty: number | null
          raffle_id: string | null
          src_id: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          buyer_user_id?: string | null
          created_at?: string | null
          provider?: string | null
          provider_txid?: string | null
          qty?: number | null
          raffle_id?: string | null
          src_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          buyer_user_id?: string | null
          created_at?: string | null
          provider?: string | null
          provider_txid?: string | null
          qty?: number | null
          raffle_id?: string | null
          src_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
        ]
      }
      raffles_by_category_public: {
        Row: {
          amount_raised: number | null
          category_id: number | null
          category_slug: string | null
          goal_amount: number | null
          id: string | null
          image_url: string | null
          last_paid_at: string | null
          progress_pct_money: number | null
          status: string | null
          subcategory_id: string | null
          subcategory_slug: string | null
          ticket_price: number | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategory_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "categories_public_ext"
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
            foreignKeyName: "raffles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategory_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      raffles_money_view: {
        Row: {
          amount_raised: number | null
          goal_amount: number | null
          last_paid_at: string | null
          progress_pct_money: number | null
          raffle_id: string | null
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
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "categories_public_ext"
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
            foreignKeyName: "raffles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
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
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      raffles_public_ext: {
        Row: {
          category_id: number | null
          category_name: string | null
          created_at: string | null
          description: string | null
          draw_date: string | null
          id: string | null
          image_url: string | null
          paid_tickets: number | null
          progress_pct: number | null
          status: string | null
          subcategory_id: string | null
          subcategory_name: string | null
          ticket_price: number | null
          title: string | null
          total_tickets: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategory_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "categories_public_ext"
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
            foreignKeyName: "raffles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategory_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      raffles_public_money_ext: {
        Row: {
          amount_raised: number | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          description: string | null
          description_excerpt: string | null
          direct_purchase_link: string | null
          draw_date: string | null
          goal_amount: number | null
          id: string | null
          image_url: string | null
          last_paid_at: string | null
          location_city: string | null
          location_state: string | null
          participants_count: number | null
          progress_pct_money: number | null
          status: string | null
          subcategory_name: string | null
          subcategory_slug: string | null
          ticket_price: number | null
          title: string | null
        }
        Relationships: []
      }
      raffles_public_v2: {
        Row: {
          amount_collected: number | null
          category_id: number | null
          created_at: string | null
          description: string | null
          draw_date: string | null
          goal_amount: number | null
          id: string | null
          image_url: string | null
          last_paid_at: string | null
          lottery_type: string | null
          owner_user_id: string | null
          paid_tickets: number | null
          participants_count: number | null
          prize_value: number | null
          progress_pct: number | null
          status: string | null
          subcategory_id: string | null
          ticket_price: number | null
          tickets_remaining: number | null
          title: string | null
          total_tickets: number | null
          vendor_link: string | null
          winner_user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_raffles_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategory_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "categories_public_ext"
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
            foreignKeyName: "raffles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
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
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_subcategory_fk"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategory_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_audit_v1: {
        Row: {
          all_paid: boolean | null
          any_paid: boolean | null
          buyer_user_id: string | null
          first_ticket_at: string | null
          last_provider: string | null
          last_provider_payment_id: string | null
          last_ticket_at: string | null
          last_tx_amount: number | null
          last_tx_at: string | null
          last_tx_status: string | null
          raffle_id: string | null
          reservation_id: string | null
          ticket_count: number | null
          ticket_numbers: number[] | null
          ticket_statuses: Database["public"]["Enums"]["ticket_status"][] | null
        }
        Relationships: []
      }
      reservation_by_user_v1: {
        Row: {
          all_paid: boolean | null
          any_paid: boolean | null
          buyer_user_id: string | null
          first_ticket_at: string | null
          last_provider: string | null
          last_provider_payment_id: string | null
          last_ticket_at: string | null
          last_tx_amount: number | null
          last_tx_at: string | null
          last_tx_status: string | null
          raffle_id: string | null
          reservation_id: string | null
          ticket_count: number | null
          ticket_numbers: number[] | null
          ticket_statuses: Database["public"]["Enums"]["ticket_status"][] | null
        }
        Relationships: []
      }
      reservation_tickets_v1: {
        Row: {
          buyer_user_id: string | null
          is_paid: boolean | null
          last_provider: string | null
          last_provider_payment_id: string | null
          raffle_id: string | null
          reservation_id: string | null
          ticket_created_at: string | null
          ticket_number: number | null
          ticket_status: Database["public"]["Enums"]["ticket_status"] | null
          tx_amount: number | null
          tx_created_at: string | null
          tx_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
        ]
      }
      reservation_unpaid_v1: {
        Row: {
          all_paid: boolean | null
          any_paid: boolean | null
          buyer_user_id: string | null
          first_ticket_at: string | null
          last_provider: string | null
          last_provider_payment_id: string | null
          last_ticket_at: string | null
          last_tx_amount: number | null
          last_tx_at: string | null
          last_tx_status: string | null
          raffle_id: string | null
          reservation_id: string | null
          ticket_count: number | null
          ticket_numbers: number[] | null
          ticket_statuses: Database["public"]["Enums"]["ticket_status"][] | null
        }
        Relationships: []
      }
      subcategories_public: {
        Row: {
          active_raffles: number | null
          category_id: number | null
          category_nome: string | null
          category_slug: string | null
          id: string | null
          nome: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategory_stats: {
        Row: {
          category_id: number | null
          category_name: string | null
          category_slug: string | null
          id: string | null
          raffles_count: number | null
          subcategory_name: string | null
          subcategory_slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ganhavel_categories_public"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_paid_flat: {
        Row: {
          amount: number | null
          buyer_user_id: string | null
          created_at: string | null
          provider: string | null
          provider_txid: string | null
          qty: number | null
          raffle_id: string | null
          src_id: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
        ]
      }
      user_profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          facebook: string | null
          full_name: string | null
          id: string | null
          instagram: string | null
          location: string | null
          telegram: string | null
          tiktok: string | null
          twitter: string | null
          username: string | null
          website_url: string | null
          whatsapp: string | null
          youtube: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          facebook?: string | null
          full_name?: string | null
          id?: string | null
          instagram?: string | null
          location?: string | null
          telegram?: string | null
          tiktok?: string | null
          twitter?: string | null
          username?: string | null
          website_url?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          facebook?: string | null
          full_name?: string | null
          id?: string | null
          instagram?: string | null
          location?: string | null
          telegram?: string | null
          tiktok?: string | null
          twitter?: string | null
          username?: string | null
          website_url?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      v_federal_winners: {
        Row: {
          concurso_number: string | null
          draw_date: string | null
          draw_pairs: string[] | null
          fetched_url: string | null
          log_created_at: string | null
          provider: string | null
          raffle_id: string | null
          raffle_title: string | null
          ticket_created_at: string | null
          ticket_id: string | null
          ticket_numbers_json: Json | null
          user_id: string | null
          winner_full_name_raw: string | null
          winner_public_handle: string | null
        }
        Relationships: []
      }
      v_raffle_ticket_stats: {
        Row: {
          paid_tickets: number | null
          raffle_id: string | null
          tickets_remaining: number | null
        }
        Relationships: []
      }
      v_raffle_winners_public: {
        Row: {
          concurso_number: string | null
          created_at: string | null
          draw_date: string | null
          drawn_number: string | null
          raffle_id: string | null
          source: string | null
          winning_ticket: string | null
        }
        Insert: {
          concurso_number?: string | null
          created_at?: string | null
          draw_date?: string | null
          drawn_number?: string | null
          raffle_id?: string | null
          source?: string | null
          winning_ticket?: string | null
        }
        Update: {
          concurso_number?: string | null
          created_at?: string | null
          draw_date?: string | null
          drawn_number?: string | null
          raffle_id?: string | null
          source?: string | null
          winning_ticket?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
        ]
      }
      v_ticket_keys: {
        Row: {
          created_at: string | null
          numbers_key: string | null
          raffle_id: string | null
          ticket_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_by_category_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_money_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ticket_numbers_resolved: {
        Row: {
          raffle_id: string | null
          ticket_id: string | null
          ticket_number: string | null
          user_id: string | null
        }
        Insert: {
          raffle_id?: never
          ticket_id?: string | null
          ticket_number?: never
          user_id?: string | null
        }
        Update: {
          raffle_id?: never
          ticket_id?: string | null
          ticket_number?: never
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_delete_category: {
        Args: { p_id: number }
        Returns: undefined
      }
      admin_delete_subcategory: {
        Args: { p_id: string }
        Returns: undefined
      }
      admin_ping: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      admin_upsert_category: {
        Args: {
          p_destaque: boolean
          p_icone_url: string
          p_id: number
          p_nome: string
          p_slug: string
          p_sort_order: number
        }
        Returns: number
      }
      admin_upsert_subcategory: {
        Args: {
          p_category_id: number
          p_id: string
          p_name: string
          p_slug: string
          p_sort_order: number
        }
        Returns: string
      }
      allocate_numbers: {
        Args: { p_qty: number; p_raffle_id: string }
        Returns: number[]
      }
      anonymize_ip: {
        Args: { ip_address: string }
        Returns: string
      }
      approve_raffle: {
        Args: { p_raffle_id: string }
        Returns: Json
      }
      bytea_to_text: {
        Args: { data: string }
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
      col_exists: {
        Args: { col: string; sch: string; tbl: string }
        Returns: boolean
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
      expire_stale_reservations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      finalize_paid_purchase: {
        Args: {
          p_asaas_payment_id: string
          p_customer_cpf?: string
          p_customer_name?: string
          p_customer_phone?: string
          p_reservation_id: string
        }
        Returns: Json
      }
      finalize_payout: {
        Args: { p_raffle_id: string }
        Returns: string
      }
      get_admin_latest_federal_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          concurso_number: string
          draw_date: string
          last_header_authorized: boolean
          last_header_present: boolean
          last_log_at: string
          last_pick_ok: boolean
          last_status: string
          latest_store_updated_at: string
        }[]
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
      get_reservation_audit: {
        Args: { p_reservation_id: string }
        Returns: {
          all_paid: boolean | null
          any_paid: boolean | null
          buyer_user_id: string | null
          first_ticket_at: string | null
          last_provider: string | null
          last_provider_payment_id: string | null
          last_ticket_at: string | null
          last_tx_amount: number | null
          last_tx_at: string | null
          last_tx_status: string | null
          raffle_id: string | null
          reservation_id: string | null
          ticket_count: number | null
          ticket_numbers: number[] | null
          ticket_statuses: Database["public"]["Enums"]["ticket_status"][] | null
        }
      }
      hello_secure: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { data: Json; uri: string } | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { p_uid: string }
        Returns: boolean
      }
      is_admin_alias: {
        Args: { uid: string }
        Returns: boolean
      }
      is_valid_cnpj: {
        Args: { raw: string }
        Returns: boolean
      }
      is_valid_cpf: {
        Args: { raw: string }
        Returns: boolean
      }
      is_valid_cpf_or_cnpj: {
        Args: { raw: string }
        Returns: boolean
      }
      job_assign_next_draw: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      job_close_draws: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      job_mark_funded: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      list_reservations_audit: {
        Args: {
          p_cursor_last_ticket_at?: string
          p_cursor_reservation_id?: string
          p_limit?: number
        }
        Returns: {
          all_paid: boolean | null
          any_paid: boolean | null
          buyer_user_id: string | null
          first_ticket_at: string | null
          last_provider: string | null
          last_provider_payment_id: string | null
          last_ticket_at: string | null
          last_tx_amount: number | null
          last_tx_at: string | null
          last_tx_status: string | null
          raffle_id: string | null
          reservation_id: string | null
          ticket_count: number | null
          ticket_numbers: number[] | null
          ticket_statuses: Database["public"]["Enums"]["ticket_status"][] | null
        }[]
      }
      list_reservations_by_me: {
        Args: {
          p_cursor_last_ticket_at?: string
          p_cursor_reservation_id?: string
          p_limit?: number
        }
        Returns: {
          all_paid: boolean | null
          any_paid: boolean | null
          buyer_user_id: string | null
          first_ticket_at: string | null
          last_provider: string | null
          last_provider_payment_id: string | null
          last_ticket_at: string | null
          last_tx_amount: number | null
          last_tx_at: string | null
          last_tx_status: string | null
          raffle_id: string | null
          reservation_id: string | null
          ticket_count: number | null
          ticket_numbers: number[] | null
          ticket_statuses: Database["public"]["Enums"]["ticket_status"][] | null
        }[]
      }
      list_reservations_by_user_admin: {
        Args: {
          p_cursor_last_ticket_at?: string
          p_cursor_reservation_id?: string
          p_limit?: number
          p_user_id: string
        }
        Returns: {
          all_paid: boolean | null
          any_paid: boolean | null
          buyer_user_id: string | null
          first_ticket_at: string | null
          last_provider: string | null
          last_provider_payment_id: string | null
          last_ticket_at: string | null
          last_tx_amount: number | null
          last_tx_at: string | null
          last_tx_status: string | null
          raffle_id: string | null
          reservation_id: string | null
          ticket_count: number | null
          ticket_numbers: number[] | null
          ticket_statuses: Database["public"]["Enums"]["ticket_status"][] | null
        }[]
      }
      list_reservations_unpaid: {
        Args: {
          p_cursor_last_ticket_at?: string
          p_cursor_reservation_id?: string
          p_limit?: number
        }
        Returns: {
          all_paid: boolean | null
          any_paid: boolean | null
          buyer_user_id: string | null
          first_ticket_at: string | null
          last_provider: string | null
          last_provider_payment_id: string | null
          last_ticket_at: string | null
          last_tx_amount: number | null
          last_tx_at: string | null
          last_tx_status: string | null
          raffle_id: string | null
          reservation_id: string | null
          ticket_count: number | null
          ticket_numbers: number[] | null
          ticket_statuses: Database["public"]["Enums"]["ticket_status"][] | null
        }[]
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
        Args:
          | { p_payload: Json; p_type: string; p_user: string }
          | { p_payload: Json; p_type: string; p_user: string }
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
      log_transaction_webhook: {
        Args: {
          p_amount: number
          p_provider: string
          p_provider_payment_id: string
          p_reservation_id: string
        }
        Returns: undefined
      }
      log_user_action: {
        Args: { p_action: string; p_payload: Json; p_user_id: string }
        Returns: undefined
      }
      mark_tickets_paid: {
        Args: {
          p_provider: string
          p_provider_payment_id: string
          p_reservation_id: string
        }
        Returns: undefined
      }
      mask_audit_pii_row: {
        Args: { ctx: Json }
        Returns: Json
      }
      maybe_close_raffle: {
        Args: { p_raffle_id: string }
        Returns: undefined
      }
      only_digits: {
        Args: { v: string }
        Returns: string
      }
      pick_winners_from_latest_federal: {
        Args: Record<PropertyKey, never>
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
      raffle_ticket_aggregate: {
        Args: { p_raffle_id: string }
        Returns: {
          last_paid_at: string
          paid_tickets: number
          participants_count: number
        }[]
      }
      rebuild_reservation_audit_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      record_mock_purchase: {
        Args: {
          p_buyer_user_id: string
          p_numbers: Json
          p_payment_provider: string
          p_qty: number
          p_raffle_id: string
          p_unit_price: number
        }
        Returns: string
      }
      record_mock_purchase_admin: {
        Args: {
          p_buyer_user_id: string
          p_numbers: string[]
          p_provider_ref: string
          p_qty: number
          p_raffle_id: string
          p_unit_price: number
        }
        Returns: string
      }
      record_purchase_v2: {
        Args: {
          p_buyer_user_id: string
          p_customer_cpf: string
          p_customer_name: string
          p_customer_phone: string
          p_numbers: string[]
          p_provider_ref: string
          p_qty: number
          p_raffle_id: string
          p_unit_price: number
        }
        Returns: string
      }
      request_password_reset: {
        Args: { user_email: string }
        Returns: string
      }
      reserve_tickets: {
        Args: { p_qty: number; p_raffle_id: string }
        Returns: number[]
      }
      reserve_tickets_v2: {
        Args: { p_qty: number; p_raffle_id: string }
        Returns: {
          currency: string
          expires_at: string
          reservation_id: string
          total_amount: number
          unit_price: number
        }[]
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
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      ticket_tail5_key: {
        Args: { pairs: string[] }
        Returns: string
      }
      tickets_by_reservation: {
        Args: { p_reservation: string }
        Returns: {
          buyer_user_id: string | null
          created_at: string | null
          ganhavel_id: string | null
          id: string
          is_paid: boolean | null
          number: number | null
          numbers: Json | null
          payment_session_id: string | null
          payment_status: string | null
          qty: number | null
          quantity: number | null
          raffle_id: string | null
          reservation_id: string | null
          reserved_by: string | null
          reserved_until: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_number: number | null
          total_amount: number | null
          transaction_id: string | null
          unit_price: number | null
          updated_at: string
          user_id: string | null
        }[]
      }
      update_user_role: {
        Args: { new_role: string; user_id: string }
        Returns: undefined
      }
      upsert_reservation_audit: {
        Args: { p_reservation_id: string }
        Returns: undefined
      }
      upsert_verified_payment: {
        Args: {
          p_amount: number
          p_buyer_user_id: string
          p_created_at?: string
          p_provider: string
          p_provider_txid: string
          p_qty: number
          p_raffle_id: string
          p_status: string
        }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
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
      ticket_status: "reserved" | "paid" | "canceled" | "issued" | "cancelled"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
      ticket_status: ["reserved", "paid", "canceled", "issued", "cancelled"],
    },
  },
} as const
