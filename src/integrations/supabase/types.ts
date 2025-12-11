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
      _tickets_numbers_backup: {
        Row: {
          backed_up_at: string
          numbers_backup: Json | null
          ticket_id: string
        }
        Insert: {
          backed_up_at?: string
          numbers_backup?: Json | null
          ticket_id: string
        }
        Update: {
          backed_up_at?: string
          numbers_backup?: Json | null
          ticket_id?: string
        }
        Relationships: []
      }
      _tx_numbers_quarantine: {
        Row: {
          id: string
          noted_at: string | null
          numbers_raw: Json | null
        }
        Insert: {
          id: string
          noted_at?: string | null
          numbers_raw?: Json | null
        }
        Update: {
          id?: string
          noted_at?: string | null
          numbers_raw?: Json | null
        }
        Relationships: []
      }
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "action_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
        ]
      }
      admin_pick_log: {
        Row: {
          action: string
          candidate_count: number | null
          created_at: string
          error_text: string | null
          federal_concurso_number: string | null
          federal_draw_date: string | null
          id: number
          outcome: string
          raffle_id: string
          run_id: string
          ticket_id: string | null
          trigger_source: string
          winner_user_id: string | null
        }
        Insert: {
          action: string
          candidate_count?: number | null
          created_at?: string
          error_text?: string | null
          federal_concurso_number?: string | null
          federal_draw_date?: string | null
          id?: number
          outcome: string
          raffle_id: string
          run_id: string
          ticket_id?: string | null
          trigger_source?: string
          winner_user_id?: string | null
        }
        Update: {
          action?: string
          candidate_count?: number | null
          created_at?: string
          error_text?: string | null
          federal_concurso_number?: string | null
          federal_draw_date?: string | null
          id?: number
          outcome?: string
          raffle_id?: string
          run_id?: string
          ticket_id?: string | null
          trigger_source?: string
          winner_user_id?: string | null
        }
        Relationships: []
      }
      admin_users_base: {
        Row: {
          created_at: string
          id: string
          note: string | null
        }
        Insert: {
          created_at?: string
          id: string
          note?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
        }
        Relationships: []
      }
      asaas_events: {
        Row: {
          asaas_event_id: string
          event_type: string
          id: number
          payload: Json
          received_at: string | null
        }
        Insert: {
          asaas_event_id: string
          event_type: string
          id?: number
          payload: Json
          received_at?: string | null
        }
        Update: {
          asaas_event_id?: string
          event_type?: string
          id?: number
          payload?: Json
          received_at?: string | null
        }
        Relationships: []
      }
      asaas_payments: {
        Row: {
          amount: number | null
          asaas_payment_id: string
          created_at: string | null
          id: string
          raffle_id: string | null
          raw: Json | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          asaas_payment_id: string
          created_at?: string | null
          id?: string
          raffle_id?: string | null
          raw?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          asaas_payment_id?: string
          created_at?: string | null
          id?: string
          raffle_id?: string | null
          raw?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      asaas_receipts: {
        Row: {
          amount: number | null
          asaas_payment_id: string
          created_at: string
          id: string
          purchase_id: string
          status: string
        }
        Insert: {
          amount?: number | null
          asaas_payment_id: string
          created_at?: string
          id?: string
          purchase_id: string
          status: string
        }
        Update: {
          amount?: number | null
          asaas_payment_id?: string
          created_at?: string
          id?: string
          purchase_id?: string
          status?: string
        }
        Relationships: []
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
      audit_transactions_dupes: {
        Row: {
          amount: number | null
          archived_at: string | null
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
          reason: string | null
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
          archived_at?: string | null
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
          reason?: string | null
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
          archived_at?: string | null
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
          reason?: string | null
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
        Relationships: []
      }
      audit_transactions_dupes_log: {
        Row: {
          amount: number | null
          archived_at: string | null
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
          id: string | null
          numbers: Json | null
          payment_id: string | null
          payment_provider: string | null
          payment_reference: string | null
          provider: string | null
          provider_payment_id: string | null
          provider_ref: string | null
          raffle_id: string | null
          reason: string | null
          received_at: string | null
          reservation_id: string | null
          selected_numbers: string[] | null
          source: string | null
          status: string | null
          ticket_numbers: Json | null
          total_amount_computed: number | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          archived_at?: string | null
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
          id?: string | null
          numbers?: Json | null
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          provider_ref?: string | null
          raffle_id?: string | null
          reason?: string | null
          received_at?: string | null
          reservation_id?: string | null
          selected_numbers?: string[] | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          total_amount_computed?: number | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          archived_at?: string | null
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
          id?: string | null
          numbers?: Json | null
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          provider_ref?: string | null
          raffle_id?: string | null
          reason?: string | null
          received_at?: string | null
          reservation_id?: string | null
          selected_numbers?: string[] | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          total_amount_computed?: number | null
          type?: string | null
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
      conversations: {
        Row: {
          created_at: string
          id: string
          participant_a: string
          participant_b: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_a: string
          participant_b: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_a?: string
          participant_b?: string
          updated_at?: string
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
      finalize_logs: {
        Row: {
          id: number
          message: string | null
          meta: Json | null
          ok: boolean | null
          payment_id: string | null
          reservation_id: string | null
          step: string | null
          ts: string
        }
        Insert: {
          id?: number
          message?: string | null
          meta?: Json | null
          ok?: boolean | null
          payment_id?: string | null
          reservation_id?: string | null
          step?: string | null
          ts?: string
        }
        Update: {
          id?: number
          message?: string | null
          meta?: Json | null
          ok?: boolean | null
          payment_id?: string | null
          reservation_id?: string | null
          step?: string | null
          ts?: string
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ganhaveis_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
            foreignKeyName: "ganhaveis_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "ganhaveis_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
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
          source: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          concurso_number: string
          draw_date: string
          game_slug?: string
          numbers: string[]
          source?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          concurso_number?: string
          draw_date?: string
          game_slug?: string
          numbers?: string[]
          source?: string | null
          updated_at?: string
          updated_by?: string | null
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
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "lottery_results_ganhavel_id_fkey"
            columns: ["ganhavel_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
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
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "lottery_results_winning_ticket_id_fkey"
            columns: ["winning_ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "lottery_results_winning_ticket_id_fkey"
            columns: ["winning_ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
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
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          dedupe_key: string | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          dedupe_key?: string | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          dedupe_key?: string | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      payments_applied: {
        Row: {
          applied_at: string
          payment_id: string
          reservation_id: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          payment_id: string
          reservation_id: string
          user_id: string
        }
        Update: {
          applied_at?: string
          payment_id?: string
          reservation_id?: string
          user_id?: string
        }
        Relationships: []
      }
      payments_pending: {
        Row: {
          amount: number
          asaas_payment_id: string | null
          buyer: Json | null
          created_at: string
          expires_at: string
          id: string
          numbers: Json | null
          pix_qr_code_id: string | null
          raffle_id: string | null
          reservation_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          asaas_payment_id?: string | null
          buyer?: Json | null
          created_at?: string
          expires_at: string
          id?: string
          numbers?: Json | null
          pix_qr_code_id?: string | null
          raffle_id?: string | null
          reservation_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          asaas_payment_id?: string | null
          buyer?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          numbers?: Json | null
          pix_qr_code_id?: string | null
          raffle_id?: string | null
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
      payments_webhook_logs: {
        Row: {
          event_status: string | null
          id: number
          payment_id: string | null
          provider: string
          raw_payload: Json | null
          received_at: string | null
        }
        Insert: {
          event_status?: string | null
          id?: number
          payment_id?: string | null
          provider: string
          raw_payload?: Json | null
          received_at?: string | null
        }
        Update: {
          event_status?: string | null
          id?: number
          payment_id?: string | null
          provider?: string
          raw_payload?: Json | null
          received_at?: string | null
        }
        Relationships: []
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payouts_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
      purchase_payments: {
        Row: {
          asaas_payment_id: string | null
          created_at: string | null
          id: string
          pix_payload: string | null
          pix_qr_base64: string | null
          purchase_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          asaas_payment_id?: string | null
          created_at?: string | null
          id?: string
          pix_payload?: string | null
          pix_qr_base64?: string | null
          purchase_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          asaas_payment_id?: string | null
          created_at?: string | null
          id?: string
          pix_payload?: string | null
          pix_qr_base64?: string | null
          purchase_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_payments_purchase"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_payments_purchase"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "v_purchase_trace"
            referencedColumns: ["purchase_id"]
          },
          {
            foreignKeyName: "purchase_payments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_payments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "v_purchase_trace"
            referencedColumns: ["purchase_id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number
          buyer_cpf_cnpj: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          created_at: string | null
          id: string
          quantity: number
          raffle_id: string
          status: string
          unit_price: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          buyer_cpf_cnpj?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string | null
          id?: string
          quantity: number
          raffle_id: string
          status?: string
          unit_price: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          buyer_cpf_cnpj?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string | null
          id?: string
          quantity?: number
          raffle_id?: string
          status?: string
          unit_price?: number
          updated_at?: string | null
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
          draw_pairs: string[] | null
          drawn_number: string
          id: number
          prize_position: number
          provider: string | null
          provider_source: string | null
          raffle_id: string
          source: string
          ticket_id: string
          ticket_number: string
          user_id: string
        }
        Insert: {
          concurso_number: string
          created_at?: string | null
          delta?: number
          draw_date: string
          draw_pairs?: string[] | null
          drawn_number: string
          id?: number
          prize_position?: number
          provider?: string | null
          provider_source?: string | null
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
          draw_pairs?: string[] | null
          drawn_number?: string
          id?: number
          prize_position?: number
          provider?: string | null
          provider_source?: string | null
          raffle_id?: string
          source?: string
          ticket_id?: string
          ticket_number?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "mv_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_numbers_resolved"
            referencedColumns: ["ticket_id"]
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
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
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
          launch_email_sent_at: string | null
          location_city: string | null
          location_state: string | null
          organizer_id: string
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
          launch_email_sent_at?: string | null
          location_city?: string | null
          location_state?: string | null
          organizer_id: string
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
          launch_email_sent_at?: string | null
          location_city?: string | null
          location_state?: string | null
          organizer_id?: string
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
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
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffles_winner_ticket_id_fkey"
            columns: ["winner_ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffles_winner_ticket_id_fkey"
            columns: ["winner_ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
        ]
      }
      raffles_archive: {
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
          id: string | null
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
          updated_at: string | null
          user_id: string | null
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
          id?: string | null
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
          updated_at?: string | null
          user_id?: string | null
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
          id?: string | null
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
          updated_at?: string | null
          user_id?: string | null
          vendor_link?: string | null
          winner_ticket_id?: string | null
          winner_user_id?: string | null
          winners?: Json | null
          winning_numbers?: Json | null
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
      reservation_links: {
        Row: {
          created_at: string | null
          raffle_id: string
          reservation_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          raffle_id: string
          reservation_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          raffle_id?: string
          reservation_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "reservation_links_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
        ]
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
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "ticket_picks_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "ticket_picks_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
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
          line_no: number | null
          number: number | null
          numbers: Json | null
          numbers_key: number | null
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
          line_no?: number | null
          number?: number | null
          numbers?: Json | null
          numbers_key?: number | null
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
          line_no?: number | null
          number?: number | null
          numbers?: Json | null
          numbers_key?: number | null
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
            foreignKeyName: "fk_tickets_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "my_transactions_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tickets_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tickets_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions_paid_flat"
            referencedColumns: ["src_id"]
          },
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedRelation: "my_transactions_public"
            referencedColumns: ["id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
        ]
      }
      tickets_archive: {
        Row: {
          buyer_user_id: string | null
          created_at: string | null
          ganhavel_id: string | null
          id: string | null
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
          status: Database["public"]["Enums"]["ticket_status"] | null
          ticket_number: number | null
          total_amount: number | null
          transaction_id: string | null
          unit_price: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          buyer_user_id?: string | null
          created_at?: string | null
          ganhavel_id?: string | null
          id?: string | null
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
          status?: Database["public"]["Enums"]["ticket_status"] | null
          ticket_number?: number | null
          total_amount?: number | null
          transaction_id?: string | null
          unit_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          buyer_user_id?: string | null
          created_at?: string | null
          ganhavel_id?: string | null
          id?: string | null
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
          status?: Database["public"]["Enums"]["ticket_status"] | null
          ticket_number?: number | null
          total_amount?: number | null
          transaction_id?: string | null
          unit_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      transaction_buyer_details: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          customer_cpf_enc: string | null
          customer_cpf_hash: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          extra: Json | null
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          customer_cpf_enc?: string | null
          customer_cpf_hash?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          extra?: Json | null
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          customer_cpf_enc?: string | null
          customer_cpf_hash?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          extra?: Json | null
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_buyer_details_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "my_transactions_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_buyer_details_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_buyer_details_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions_paid_flat"
            referencedColumns: ["src_id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          billing_address: Json | null
          buyer_user_id: string | null
          created_at: string | null
          customer_cpf: string | null
          customer_cpf_enc: string | null
          customer_cpf_hash: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          due_date: string | null
          extra: Json | null
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
          receipt_email_sent_at: string | null
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
          billing_address?: Json | null
          buyer_user_id?: string | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_cpf_enc?: string | null
          customer_cpf_hash?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          extra?: Json | null
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
          receipt_email_sent_at?: string | null
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
          billing_address?: Json | null
          buyer_user_id?: string | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_cpf_enc?: string | null
          customer_cpf_hash?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          due_date?: string | null
          extra?: Json | null
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
          receipt_email_sent_at?: string | null
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
        ]
      }
      transactions_archive: {
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
          id: string | null
          numbers: Json | null
          payment_id: string | null
          payment_provider: string | null
          payment_reference: string | null
          provider: string | null
          provider_payment_id: string | null
          provider_ref: string | null
          raffle_id: string | null
          received_at: string | null
          reservation_id: string | null
          selected_numbers: string[] | null
          source: string | null
          status: string | null
          ticket_numbers: Json | null
          total_amount_computed: number | null
          type: string | null
          user_id: string | null
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
          id?: string | null
          numbers?: Json | null
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          provider_ref?: string | null
          raffle_id?: string | null
          received_at?: string | null
          reservation_id?: string | null
          selected_numbers?: string[] | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          total_amount_computed?: number | null
          type?: string | null
          user_id?: string | null
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
          id?: string | null
          numbers?: Json | null
          payment_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          provider_ref?: string | null
          raffle_id?: string | null
          received_at?: string | null
          reservation_id?: string | null
          selected_numbers?: string[] | null
          source?: string | null
          status?: string | null
          ticket_numbers?: Json | null
          total_amount_computed?: number | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_raffle_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "transactions_raffle_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "transactions_raffle_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
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
          username: string
          website_url: string | null
          welcome_sent_at: string | null
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
          username: string
          website_url?: string | null
          welcome_sent_at?: string | null
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
          username?: string
          website_url?: string | null
          welcome_sent_at?: string | null
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
        ]
      }
      winners: {
        Row: {
          created_at: string
          prize: string | null
          raffle_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          prize?: string | null
          raffle_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          prize?: string | null
          raffle_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
        ]
      }
    }
    Views: {
      _paid_status: {
        Row: {
          s: string | null
        }
        Relationships: []
      }
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
          user_id: string | null
        }
        Insert: {
          user_id?: string | null
        }
        Update: {
          user_id?: string | null
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
      mv_public_tx_rollup: {
        Row: {
          amount_raised: number | null
          last_paid_at: string | null
          participants_count: number | null
          raffle_id: string | null
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
        ]
      }
      my_transactions_public: {
        Row: {
          amount: number | null
          amount_raised: number | null
          buyer_user_id: string | null
          created_at: string | null
          draw_date: string | null
          goal_amount: number | null
          id: string | null
          image_url: string | null
          numbers: Json | null
          progress_pct_money: number | null
          raffle_id: string | null
          status: string | null
          title: string | null
          user_id: string | null
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "payments_verified_buyer_user_id_fkey"
            columns: ["buyer_user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "payments_verified_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
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
          location_city: string | null
          location_label: string | null
          paid_tickets: number | null
          progress_pct: number | null
          state_uf: string | null
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
          slug: string | null
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "raffles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "raffles_winner_user_id_fkey"
            columns: ["winner_user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "transactions_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
      user_follower_stats: {
        Row: {
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          id: string | null
          username: string | null
        }
        Relationships: []
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
      v_admin_last_caixa: {
        Row: {
          concurso_number: string | null
          draw_date: string | null
          numbers: string[] | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_admin_last_picker_run: {
        Row: {
          last_draw_date: string | null
          last_pick_at: string | null
          picks_today: number | null
          provider: string | null
        }
        Relationships: []
      }
      v_admin_winners: {
        Row: {
          buyer_cpf: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          concurso_number: string | null
          federal_draw_date: string | null
          federal_pairs: string | null
          federal_target: string | null
          link_raffle_id: string | null
          link_ticket_id: string | null
          link_winner_user_id: string | null
          organizer_user_id: string | null
          raffle_closed_at: string | null
          raffle_draw_date: string | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_status: string | null
          raffle_title: string | null
          winner_created_at: string | null
          winner_handle_fallback: string | null
          winner_id: number | null
          winner_user_id: string | null
          winning_ticket: string | null
        }
        Relationships: []
      }
      v_admin_winners_core: {
        Row: {
          buyer_cpf: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          concurso_number: string | null
          federal_draw_date: string | null
          federal_pairs: string | null
          federal_target: string | null
          link_raffle_id: string | null
          link_ticket_id: string | null
          link_winner_user_id: string | null
          organizer_user_id: string | null
          raffle_closed_at: string | null
          raffle_draw_date: string | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_status: string | null
          raffle_title: string | null
          winner_created_at: string | null
          winner_handle_fallback: string | null
          winner_id: number | null
          winner_user_id: string | null
          winning_ticket: string | null
        }
        Relationships: []
      }
      v_admin_winners_min: {
        Row: {
          buyer_cpf: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          concurso_number: string | null
          federal_draw_date: string | null
          federal_pairs: string | null
          federal_target: string | null
          link_raffle_id: string | null
          link_ticket_id: string | null
          link_winner_user_id: string | null
          organizer_user_id: string | null
          raffle_draw_date: string | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_status: string | null
          raffle_title: string | null
          winner_created_at: string | null
          winner_handle_fallback: string | null
          winner_id: number | null
          winner_user_id: string | null
          winning_ticket: string | null
        }
        Relationships: []
      }
      v_admin_winners_min_v2: {
        Row: {
          buyer_cpf: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          concurso_number: string | null
          federal_draw_date: string | null
          federal_pairs: string | null
          federal_target: string | null
          link_raffle_id: string | null
          link_ticket_id: string | null
          link_winner_user_id: string | null
          organizer_user_id: string | null
          raffle_draw_date: string | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_status: string | null
          raffle_title: string | null
          winner_created_at: string | null
          winner_handle_fallback: string | null
          winner_id: number | null
          winner_user_id: string | null
          winning_ticket: string | null
        }
        Relationships: []
      }
      v_admin_winners_v2: {
        Row: {
          buyer_cpf: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          concurso_number: string | null
          federal_draw_date: string | null
          federal_pairs: string | null
          federal_target: string | null
          link_raffle_id: string | null
          link_ticket_id: string | null
          link_winner_user_id: string | null
          organizer_user_id: string | null
          raffle_closed_at: string | null
          raffle_draw_date: string | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_status: string | null
          raffle_title: string | null
          winner_created_at: string | null
          winner_handle_fallback: string | null
          winner_id: number | null
          winner_user_id: string | null
          winning_ticket: string | null
        }
        Relationships: []
      }
      v_canonical_winners: {
        Row: {
          concurso_number: string | null
          draw_date: string | null
          logged_at: string | null
          raffle_id: string | null
          source: string | null
          winning_ticket: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
      v_draw_pool: {
        Row: {
          number: number | null
          paid_at: string | null
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
        ]
      }
      v_draw_pool_keys: {
        Row: {
          numbers_key: string | null
          paid_at: string | null
          raffle_id: string | null
          ticket_id: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tickets_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "my_transactions_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tickets_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tickets_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions_paid_flat"
            referencedColumns: ["src_id"]
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedRelation: "my_transactions_public"
            referencedColumns: ["id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
        ]
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
      v_latest_federal_pairs: {
        Row: {
          concurso_number: string | null
          draw_date: string | null
          pair1: string | null
          pair2: string | null
          pair3: string | null
          pair4: string | null
          pair5: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_organizer_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          facebook: string | null
          full_name: string | null
          instagram: string | null
          location: string | null
          organizer_user_id: string | null
          raffle_id: string | null
          telegram: string | null
          tiktok: string | null
          twitter: string | null
          username: string | null
          website_url: string | null
          whatsapp: string | null
          youtube: string | null
        }
        Relationships: []
      }
      v_organizer_public_old: {
        Row: {
          avatar_url: string | null
          bio: string | null
          facebook: string | null
          full_name: string | null
          instagram: string | null
          location: string | null
          raffle_id: string | null
          telegram: string | null
          tiktok: string | null
          twitter: string | null
          username: string | null
          website_url: string | null
          whatsapp: string | null
          youtube: string | null
        }
        Relationships: []
      }
      v_paid_tickets_with_null_numbers: {
        Row: {
          paid_at: string | null
          raffle_id: string | null
          ticket_id: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tickets_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "my_transactions_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tickets_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tickets_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions_paid_flat"
            referencedColumns: ["src_id"]
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedRelation: "my_transactions_public"
            referencedColumns: ["id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
        ]
      }
      v_public_raffle_winner_detail: {
        Row: {
          concurso_number: string | null
          draw_date: string | null
          federal_pairs: string | null
          federal_target: string | null
          raffle_id: string | null
          ticket_id: string | null
          winner_avatar_url: string | null
          winner_handle: string | null
          winner_published_at: string | null
          winner_user_id: string | null
          winning_ticket: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "mv_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_numbers_resolved"
            referencedColumns: ["ticket_id"]
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
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
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
      v_public_winners: {
        Row: {
          avatar_url: string | null
          concurso_number: string | null
          draw_date: string | null
          federal_target: string | null
          logged_at: string | null
          raffle_id: string | null
          raffle_title: string | null
          ticket_id: string | null
          user_id: string | null
          winner_handle: string | null
          winner_id: number | null
          winning_ticket: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "mv_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_numbers_resolved"
            referencedColumns: ["ticket_id"]
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
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
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
      v_public_winners_base: {
        Row: {
          avatar_url: string | null
          concurso_number: string | null
          draw_date: string | null
          federal_target: string | null
          logged_at: string | null
          raffle_id: string | null
          raffle_title: string | null
          ticket_id: string | null
          user_id: string | null
          winner_handle: string | null
          winner_id: number | null
          winning_ticket: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "mv_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_numbers_resolved"
            referencedColumns: ["ticket_id"]
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
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
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
      v_public_winners_pubnames: {
        Row: {
          concurso_number: string | null
          delta: number | null
          draw_date: string | null
          draw_pairs: string[] | null
          drawn_number: string | null
          logged_at: string | null
          prize_position: number | null
          provider: string | null
          provider_source: string | null
          raffle_id: string | null
          raffle_title: string | null
          source: string | null
          ticket_id: string | null
          ticket_number: string | null
          winner_avatar_url: string | null
          winner_handle: string | null
          winner_id: number | null
          winner_name: string | null
          winner_user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "mv_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_fk"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_ticket_numbers_resolved"
            referencedColumns: ["ticket_id"]
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
            referencedRelation: "v_draw_pool"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_draw_pool_keys"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "raffle_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_paid_tickets_with_null_numbers"
            referencedColumns: ["ticket_id"]
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
      v_purchase_payment_status: {
        Row: {
          amount: number | null
          asaas_payment_id: string | null
          last_update: string | null
          purchase_id: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_purchase_payments_purchase"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_purchase_payments_purchase"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "v_purchase_trace"
            referencedColumns: ["purchase_id"]
          },
          {
            foreignKeyName: "purchase_payments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_payments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "v_purchase_trace"
            referencedColumns: ["purchase_id"]
          },
        ]
      }
      v_purchase_trace: {
        Row: {
          any_ticket_paid: boolean | null
          asaas_amount: number | null
          asaas_status: string | null
          asaas_updated_at: string | null
          link_asaas_payment_id: string | null
          link_status: string | null
          link_updated_at: string | null
          pending_asaas_payment_id: string | null
          pending_expires_at: string | null
          pending_status: string | null
          pending_updated_at: string | null
          purchase_amount: number | null
          purchase_id: string | null
          purchase_status: string | null
          purchase_updated_at: string | null
          quantity: number | null
          raffle_id: string | null
          ticket_count: number | null
          tickets: number[] | null
          unit_price: number | null
          user_id: string | null
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
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_money_view"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_ext"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_raffle_ticket_stats"
            referencedColumns: ["raffle_id"]
          },
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "raffle_winners_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
      v_raffles_awaiting_draw: {
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
          slug: string | null
          status: string | null
          subcategory_name: string | null
          subcategory_slug: string | null
          ticket_price: number | null
          title: string | null
        }
        Relationships: []
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
            referencedRelation: "raffles_public_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_core"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_min_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_admin_winners_v2"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["raffle_id"]
          },
          {
            foreignKeyName: "tickets_raffle_fk"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public_old"
            referencedColumns: ["raffle_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
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
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_follower_stats"
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
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_organizer_public"
            referencedColumns: ["organizer_user_id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_public_winners_pubnames"
            referencedColumns: ["winner_user_id"]
          },
        ]
      }
    }
    Functions: {
      _next_free_number: { Args: { p_raffle: string }; Returns: number }
      _notify_insert: {
        Args: {
          p_data: Json
          p_dedupe_key?: string
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      admin_delete_category: { Args: { p_id: number }; Returns: undefined }
      admin_delete_subcategory: { Args: { p_id: string }; Returns: undefined }
      admin_federal_manual_upsert: {
        Args: { p_concurso: string; p_draw_date: string; p_pairs: string[] }
        Returns: Json
      }
      admin_federal_pick_all: {
        Args: never
        Returns: {
          concurso_number: string
          draw_date: string
          note: string
          raffle_id: string
          ticket_id: string
          user_id: string
        }[]
      }
      admin_federal_pick_now:
        | {
            Args: never
            Returns: {
              picked_concurso_number: string
              picked_draw_date: string
              result_raffle_id: string
              result_ticket_id: string
              result_user_id: string
            }[]
          }
        | {
            Args: { p_raffle_id: string }
            Returns: {
              picked_concurso_number: string
              picked_draw_date: string
              result_raffle_id: string
              result_ticket_id: string
              result_user_id: string
            }[]
          }
      admin_federal_set_latest: {
        Args: { p_concurso: string; p_draw_date: string; p_numbers: string[] }
        Returns: Json
      }
      admin_federal_sync_enqueue: { Args: never; Returns: Json }
      admin_federal_sync_now: { Args: never; Returns: Json }
      admin_health_snapshot: { Args: never; Returns: Json }
      admin_pick_all_completed_federal: { Args: never; Returns: Json }
      admin_pick_all_with_log: {
        Args: { p_limit?: number; p_trigger?: string }
        Returns: {
          federal_concurso_number: string
          federal_draw_date: string
          outcome: string
          raffle_id: string
          ticket_id: string
          winner_user_id: string
        }[]
      }
      admin_ping: { Args: never; Returns: string }
      admin_tickets_backfill_raffle: {
        Args: { p_raffle_id: string }
        Returns: {
          arrays_bought: number
          tickets_inserted: number
        }[]
      }
      admin_unpick_raffle_for_test: {
        Args: { p_raffle_id: string }
        Returns: undefined
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
      allocate_tickets: { Args: { p_purchase_id: string }; Returns: undefined }
      anonymize_ip: { Args: { ip_address: string }; Returns: string }
      approve_raffle: { Args: { p_raffle_id: string }; Returns: Json }
      archive_latest_federal: { Args: never; Returns: undefined }
      auth_is_admin: { Args: never; Returns: boolean }
      backfill_all_paid_null_numbers: {
        Args: never
        Returns: {
          fixed: number
          raffle_id: string
        }[]
      }
      backfill_paid_null_numbers_for_raffle: {
        Args: { p_raffle: string }
        Returns: number
      }
      bytea_to_text: { Args: { data: string }; Returns: string }
      check_login_abuse: { Args: never; Returns: undefined }
      check_raffle_spam: { Args: never; Returns: undefined }
      check_rate_limit: {
        Args: {
          max_count: number
          p_action: string
          p_ip: string
          window_seconds: number
        }
        Returns: boolean
      }
      check_suspicious_actions: { Args: never; Returns: undefined }
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
      console_federal_set_latest: {
        Args: { p_concurso: string; p_draw_date: string; p_numbers: string[] }
        Returns: Json
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
      create_security_alert_admin:
        | {
            Args: {
              p_context?: Json
              p_description: string
              p_ip_address?: string
              p_severity?: string
              p_type: string
              p_user_id?: string
            }
            Returns: string
          }
        | {
            Args: { p_message: string; p_meta: Json; p_type: string }
            Returns: undefined
          }
      create_security_alert_admin_v2: {
        Args: { p_message: string; p_meta: Json; p_type: string }
        Returns: undefined
      }
      current_user_id: { Args: never; Returns: string }
      ensure_profile: { Args: never; Returns: undefined }
      ensure_purchase_payment: {
        Args: {
          p_asaas_payment_id: string
          p_payload?: string
          p_purchase_id: string
          p_qr_base64?: string
          p_status: string
        }
        Returns: undefined
      }
      example_function: { Args: never; Returns: undefined }
      expire_stale_reservations: { Args: never; Returns: undefined }
      f_numbers_key_from_json: { Args: { p: Json }; Returns: number }
      finalize_paid_purchase:
        | {
            Args: {
              p_asaas_payment_id?: string
              p_customer_cpf?: string
              p_customer_name?: string
              p_customer_phone?: string
              p_reservation_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_asaas_payment_id: string
              p_paid_amount: number
              p_paid_at: string
              p_reservation_id: string
            }
            Returns: Json
          }
      finalize_payout: { Args: { p_raffle_id: string }; Returns: string }
      finalize_purchase: {
        Args: {
          p_amount: number
          p_asaas_payment_id: string
          p_purchase_id: string
        }
        Returns: undefined
      }
      find_ticket_by_number: {
        Args: { p_raffle_id: string; p_ticket_number: number }
        Returns: {
          purchased_at: string
          reservation_id: string
          status: string
          ticket_id: string
          transaction_id: string
          user_id: string
        }[]
      }
      fn_raffles_public_money_ext: {
        Args: never
        Returns: {
          amount_raised: number
          category_name: string
          category_slug: string
          created_at: string
          description: string
          description_excerpt: string
          direct_purchase_link: string
          draw_date: string
          goal_amount: number
          id: string
          image_url: string
          last_paid_at: string
          location_city: string
          location_state: string
          participants_count: number
          progress_pct_money: number
          slug: string
          status: string
          subcategory_name: string
          subcategory_slug: string
          ticket_price: number
          title: string
        }[]
      }
      ganhavel_slugify: { Args: { _t: string }; Returns: string }
      generate_deterministic_pair: {
        Args: { p_position: number; p_ticket_id: string }
        Returns: string
      }
      get_admin_latest_federal_status: {
        Args: never
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
      get_admin_logs:
        | {
            Args: never
            Returns: {
              action: string
              context: Json
              created_at: string
              id: string
              user_id: string
            }[]
          }
        | {
            Args: { p_limit?: number }
            Returns: {
              action: string
              created_at: string | null
              details: string | null
              id: string
              user_id: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "action_logs"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      get_admin_winner_detail: {
        Args: { p_raffle_id: string }
        Returns: {
          buyer_cpf: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          concurso_number: string | null
          federal_draw_date: string | null
          federal_pairs: string | null
          federal_target: string | null
          link_raffle_id: string | null
          link_ticket_id: string | null
          link_winner_user_id: string | null
          organizer_user_id: string | null
          raffle_closed_at: string | null
          raffle_draw_date: string | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_status: string | null
          raffle_title: string | null
          winner_created_at: string | null
          winner_handle_fallback: string | null
          winner_id: number | null
          winner_user_id: string | null
          winning_ticket: string | null
        }
        SetofOptions: {
          from: "*"
          to: "v_admin_winners_v2"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_admin_winners_by_raffle: {
        Args: { p_limit?: number; p_offset?: number; p_raffle_id: string }
        Returns: {
          buyer_cpf: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          concurso_number: string | null
          federal_draw_date: string | null
          federal_pairs: string | null
          federal_target: string | null
          link_raffle_id: string | null
          link_ticket_id: string | null
          link_winner_user_id: string | null
          organizer_user_id: string | null
          raffle_closed_at: string | null
          raffle_draw_date: string | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_status: string | null
          raffle_title: string | null
          winner_created_at: string | null
          winner_handle_fallback: string | null
          winner_id: number | null
          winner_user_id: string | null
          winning_ticket: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "v_admin_winners_core"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_admin_winners_min: {
        Args: {
          p_from?: string
          p_limit?: number
          p_offset?: number
          p_organizer_user_id?: string
          p_raffle_id?: string
          p_search?: string
          p_to?: string
          p_winner_user_id?: string
        }
        Returns: {
          buyer_cpf: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          concurso_number: string | null
          federal_draw_date: string | null
          federal_pairs: string | null
          federal_target: string | null
          link_raffle_id: string | null
          link_ticket_id: string | null
          link_winner_user_id: string | null
          organizer_user_id: string | null
          raffle_draw_date: string | null
          raffle_id: string | null
          raffle_image_url: string | null
          raffle_status: string | null
          raffle_title: string | null
          winner_created_at: string | null
          winner_handle_fallback: string | null
          winner_id: number | null
          winner_user_id: string | null
          winning_ticket: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "v_admin_winners_min_v2"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_admin_winners_min_count: {
        Args: {
          p_from?: string
          p_organizer_user_id?: string
          p_raffle_id?: string
          p_search?: string
          p_to?: string
          p_winner_user_id?: string
        }
        Returns: number
      }
      get_audit_logs_recent:
        | {
            Args: { p_limit?: number }
            Returns: {
              action: string | null
              context: Json | null
              created_at: string | null
              id: string
              payload: Json | null
              user_id: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "audit_logs"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { p_action?: string; p_limit?: number; p_minutes?: number }
            Returns: {
              action: string
              context: Json
              created_at: string
              id: string
              user_id: string
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
      get_current_user_role: { Args: { user_id: string }; Returns: string }
      get_my_audit_logs: {
        Args: { p_action?: string; p_limit?: number; p_minutes?: number }
        Returns: {
          action: string
          context: Json
          created_at: string
          id: string
        }[]
      }
      get_or_create_conversation: {
        Args: { user1: string; user2: string }
        Returns: string
      }
      get_profile_stats: { Args: { target_user_id?: string }; Returns: Json }
      get_public_profile: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          facebook: string
          full_name: string
          id: string
          instagram: string
          location: string
          telegram: string
          tiktok: string
          twitter: string
          username: string
          website_url: string
          whatsapp: string
          youtube: string
        }[]
      }
      get_public_winners_pubnames: {
        Args: { p_limit?: number }
        Returns: {
          avatar_url: string
          concurso_number: string
          draw_date: string
          federal_target: string
          logged_at: string
          raffle_id: string
          raffle_title: string
          ticket_id: string
          user_id: string
          winner_handle: string
          winner_id: number
          winning_ticket: string
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
        SetofOptions: {
          from: "*"
          to: "reservation_audit_v1"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      hello_secure: { Args: never; Returns: string }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "http_request"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_get:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
        SetofOptions: {
          from: "*"
          to: "http_header"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_list_curlopt: {
        Args: never
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_reset_curlopt: { Args: never; Returns: boolean }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { p_uid: string }; Returns: boolean }
      is_admin_alias: { Args: { uid: string }; Returns: boolean }
      is_admin_rpc: { Args: never; Returns: boolean }
      is_numbers_5singles: { Args: { n: Json }; Returns: boolean }
      is_ticket_numbers_5pairs: { Args: { n: Json }; Returns: boolean }
      is_ticket_numbers_5singles: { Args: { n: Json }; Returns: boolean }
      is_ticket_numbers_valid: { Args: { in_numbers: Json }; Returns: boolean }
      is_tx_numbers_valid: { Args: { n: Json }; Returns: boolean }
      is_valid_cnpj: { Args: { raw: string }; Returns: boolean }
      is_valid_cpf: { Args: { raw: string }; Returns: boolean }
      is_valid_cpf_or_cnpj: { Args: { raw: string }; Returns: boolean }
      job_assign_next_draw: { Args: never; Returns: undefined }
      job_close_draws: { Args: never; Returns: undefined }
      job_mark_funded: { Args: never; Returns: undefined }
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
        SetofOptions: {
          from: "*"
          to: "reservation_audit_v1"
          isOneToOne: false
          isSetofReturn: true
        }
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
        SetofOptions: {
          from: "*"
          to: "reservation_audit_v1"
          isOneToOne: false
          isSetofReturn: true
        }
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
        SetofOptions: {
          from: "*"
          to: "reservation_audit_v1"
          isOneToOne: false
          isSetofReturn: true
        }
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
        SetofOptions: {
          from: "*"
          to: "reservation_audit_v1"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      log_audit_event:
        | { Args: { action: string; context?: Json }; Returns: undefined }
        | {
            Args: { action: string; actor_id: string; context: Json }
            Returns: undefined
          }
      log_audit_event_json: { Args: { payload: Json }; Returns: undefined }
      log_bulk_admin_action: {
        Args: { action_type: string; affected_ids: string[]; reason?: string }
        Returns: undefined
      }
      log_event:
        | {
            Args: { p_payload: Json; p_type: string; p_user: string }
            Returns: undefined
          }
        | {
            Args: { p_payload: Json; p_type: string; p_user: string }
            Returns: undefined
          }
      log_public_visit:
        | {
            Args: {
              visit_city?: string
              visit_country?: string
              visit_ip: string
              visit_referer?: string
              visit_url?: string
              visit_user_agent?: string
            }
            Returns: string
          }
        | {
            Args: {
              dedup_minutes?: number
              visit_ip: string
              visit_url: string
              visit_user_agent?: string
              visit_user_id?: string
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
      mask_audit_pii_row: { Args: { ctx: Json }; Returns: Json }
      maybe_close_raffle: { Args: { p_raffle_id: string }; Returns: undefined }
      normalize_tx_status: { Args: { s: string }; Returns: string }
      only_digits: { Args: { v: string }; Returns: string }
      pick_winners_from_latest_federal: { Args: never; Returns: Json }
      purchase_preview_by_reservation: {
        Args: { p_reservation_id: string }
        Returns: {
          buyer_user_id: string
          numbers: Json
          qty: number
          raffle_id: string
          reservation_id: string
          status: string
          total_amount: number
        }[]
      }
      purchase_summary_by_reservation: {
        Args: { p_reservation_id: string }
        Returns: {
          amount: number
          buyer_user_id: string
          created_at: string
          numbers: Json
          provider: string
          provider_payment_id: string
          qty: number
          raffle_id: string
          reservation_id: string
          status: string
          transaction_id: string
        }[]
      }
      purge_old_audit_logs: { Args: never; Returns: number }
      purge_old_public_visits: { Args: never; Returns: number }
      purge_old_visit_data: { Args: never; Returns: number }
      push_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      raffle_ticket_aggregate: {
        Args: { p_raffle_id: string }
        Returns: {
          last_paid_at: string
          paid_tickets: number
          participants_count: number
        }[]
      }
      raffle_ticket_counts: {
        Args: { p_raffle_id: string }
        Returns: {
          qty: number
          status: string
        }[]
      }
      raffle_tickets_paid: {
        Args: { p_raffle_id: string }
        Returns: {
          purchased_at: string
          reservation_id: string
          ticket_id: string
          ticket_number: number
          transaction_id: string
          user_id: string
        }[]
      }
      rebuild_reservation_audit_cache: { Args: never; Returns: undefined }
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
      refresh_homepage_stats: { Args: never; Returns: undefined }
      refresh_user_follower_stats: { Args: never; Returns: undefined }
      request_password_reset: { Args: { user_email: string }; Returns: string }
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
      run_close_draws_if_ready: { Args: never; Returns: undefined }
      run_security_checks: { Args: never; Returns: undefined }
      sanitize_audit_context: { Args: { input_context: Json }; Returns: Json }
      sanitize_ticket_numbers: {
        Args: {
          enforce_validation?: boolean
          input_numbers: Json
          p_ticket_id: string
        }
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
      select_winner: { Args: { p_raffle_id: string }; Returns: string }
      set_payment_context: { Args: never; Returns: undefined }
      should_log_visit: {
        Args: { visit_ip: string; visit_url: string }
        Returns: boolean
      }
      slug_dedup: { Args: { _base: string }; Returns: string }
      slugify: { Args: { txt: string }; Returns: string }
      some_function: { Args: never; Returns: undefined }
      text_to_bytea: { Args: { data: string }; Returns: string }
      ticket_tail5_key: { Args: { pairs: string[] }; Returns: string }
      tickets_by_reservation: {
        Args: { p_reservation: string }
        Returns: {
          buyer_user_id: string | null
          created_at: string | null
          ganhavel_id: string | null
          id: string
          is_paid: boolean | null
          line_no: number | null
          number: number | null
          numbers: Json | null
          numbers_key: number | null
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
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      tickets_numbers_conflict: {
        Args: { p_numbers: Json; p_raffle_id: string }
        Returns: boolean
      }
      unaccent: { Args: { "": string }; Returns: string }
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
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
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
      notification_type:
        | "ticket_purchased"
        | "raffle_completed"
        | "winner_selected"
        | "raffle_hot"
        | "generic"
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
        method: unknown
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
      notification_type: [
        "ticket_purchased",
        "raffle_completed",
        "winner_selected",
        "raffle_hot",
        "generic",
      ],
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
