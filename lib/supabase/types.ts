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
      active_power_moves: {
        Row: {
          circle_id: string
          created_at: string
          expires_at: string | null
          id: string
          move_key: Database["public"]["Enums"]["power_move_key"]
          used_at: string | null
          user_id: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          move_key: Database["public"]["Enums"]["power_move_key"]
          used_at?: string | null
          user_id: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          move_key?: Database["public"]["Enums"]["power_move_key"]
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_power_moves_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "active_power_moves_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_power_moves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          color: string
          description: string
          icon: string
          id: string
          key: string
          name: string
        }
        Insert: {
          color?: string
          description: string
          icon: string
          id?: string
          key: string
          name: string
        }
        Update: {
          color?: string
          description?: string
          icon?: string
          id?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      bindery_books: {
        Row: {
          author: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bindery_chapters: {
        Row: {
          book_id: string
          content: string
          created_at: string
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          book_id: string
          content?: string
          created_at?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          content?: string
          created_at?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bindery_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "bindery_books"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_members: {
        Row: {
          circle_id: string
          eliminated_at: string | null
          has_shield: boolean
          id: string
          joined_at: string
          paid_at: string | null
          rank: number | null
          score: number
          status: Database["public"]["Enums"]["member_status"]
          strike_count: number
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          circle_id: string
          eliminated_at?: string | null
          has_shield?: boolean
          id?: string
          joined_at?: string
          paid_at?: string | null
          rank?: number | null
          score?: number
          status?: Database["public"]["Enums"]["member_status"]
          strike_count?: number
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          circle_id?: string
          eliminated_at?: string | null
          has_shield?: boolean
          id?: string
          joined_at?: string
          paid_at?: string | null
          rank?: number | null
          score?: number
          status?: Database["public"]["Enums"]["member_status"]
          strike_count?: number
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          admin_fee: number
          buy_in_amount: number
          challenge: string
          created_at: string
          creator_id: string
          currency: string
          end_date: string
          id: string
          invite_code: string
          is_public: boolean
          max_members: number | null
          name: string
          platform_fee_pct: number
          pot_total: number
          start_date: string
          status: Database["public"]["Enums"]["circle_status"]
          stripe_payment_intent_ids: string[] | null
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          admin_fee?: number
          buy_in_amount: number
          challenge: string
          created_at?: string
          creator_id: string
          currency?: string
          end_date: string
          id?: string
          invite_code?: string
          is_public?: boolean
          max_members?: number | null
          name: string
          platform_fee_pct?: number
          pot_total?: number
          start_date: string
          status?: Database["public"]["Enums"]["circle_status"]
          stripe_payment_intent_ids?: string[] | null
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          admin_fee?: number
          buy_in_amount?: number
          challenge?: string
          created_at?: string
          creator_id?: string
          currency?: string
          end_date?: string
          id?: string
          invite_code?: string
          is_public?: boolean
          max_members?: number | null
          name?: string
          platform_fee_pct?: number
          pot_total?: number
          start_date?: string
          status?: Database["public"]["Enums"]["circle_status"]
          stripe_payment_intent_ids?: string[] | null
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circles_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_packs: {
        Row: {
          bonus_coins: number
          coins: number
          id: string
          is_featured: boolean
          name: string
          price_cents: number
        }
        Insert: {
          bonus_coins?: number
          coins: number
          id?: string
          is_featured?: boolean
          name: string
          price_cents: number
        }
        Update: {
          bonus_coins?: number
          coins?: number
          id?: string
          is_featured?: boolean
          name?: string
          price_cents?: number
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          circle_id: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          circle_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          circle_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_transactions_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "coin_transactions_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coin_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gps_tracker_locations: {
        Row: {
          accuracy: number | null
          device_id: string
          id: number
          lat: number
          lng: number
          recorded_at: string
        }
        Insert: {
          accuracy?: number | null
          device_id: string
          id?: never
          lat: number
          lng: number
          recorded_at?: string
        }
        Update: {
          accuracy?: number | null
          device_id?: string
          id?: never
          lat?: number
          lng?: number
          recorded_at?: string
        }
        Relationships: []
      }
      kyc_events: {
        Row: {
          created_at: string
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
          provider: string | null
          reference_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          provider?: string | null
          reference_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          provider?: string | null
          reference_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leadfinder_leads: {
        Row: {
          business_name: string
          category: string | null
          city: string | null
          contact_email: string | null
          draft_body: string | null
          draft_subject: string | null
          drafted_at: string | null
          formatted_address: string | null
          found_at: string | null
          google_maps_url: string | null
          id: string
          phone: string | null
          place_id: string
          rating: number | null
          sent_at: string | null
          state: string | null
          status: string
          user_ratings_total: number | null
        }
        Insert: {
          business_name: string
          category?: string | null
          city?: string | null
          contact_email?: string | null
          draft_body?: string | null
          draft_subject?: string | null
          drafted_at?: string | null
          formatted_address?: string | null
          found_at?: string | null
          google_maps_url?: string | null
          id?: string
          phone?: string | null
          place_id: string
          rating?: number | null
          sent_at?: string | null
          state?: string | null
          status?: string
          user_ratings_total?: number | null
        }
        Update: {
          business_name?: string
          category?: string | null
          city?: string | null
          contact_email?: string | null
          draft_body?: string | null
          draft_subject?: string | null
          drafted_at?: string | null
          formatted_address?: string | null
          found_at?: string | null
          google_maps_url?: string | null
          id?: string
          phone?: string | null
          place_id?: string
          rating?: number | null
          sent_at?: string | null
          state?: string | null
          status?: string
          user_ratings_total?: number | null
        }
        Relationships: []
      }
      leadfinder_search_queue: {
        Row: {
          bbox_east: number | null
          bbox_north: number | null
          bbox_south: number | null
          bbox_west: number | null
          category: string
          city: string
          created_at: string | null
          id: string
          last_searched_at: string | null
          state: string
        }
        Insert: {
          bbox_east?: number | null
          bbox_north?: number | null
          bbox_south?: number | null
          bbox_west?: number | null
          category: string
          city: string
          created_at?: string | null
          id?: string
          last_searched_at?: string | null
          state: string
        }
        Update: {
          bbox_east?: number | null
          bbox_north?: number | null
          bbox_south?: number | null
          bbox_west?: number | null
          category?: string
          city?: string
          created_at?: string | null
          id?: string
          last_searched_at?: string | null
          state?: string
        }
        Relationships: []
      }
      learndat_challenges: {
        Row: {
          challenger_id: string
          circle_id: string | null
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          opponent_id: string
          platform_fee: number | null
          question: string | null
          stake_amount: number
          status: string
          total_pot: number | null
          winner_id: string | null
          winner_payout: number | null
        }
        Insert: {
          challenger_id: string
          circle_id?: string | null
          completed_at?: string | null
          created_at?: string
          currency: string
          id?: string
          opponent_id: string
          platform_fee?: number | null
          question?: string | null
          stake_amount: number
          status?: string
          total_pot?: number | null
          winner_id?: string | null
          winner_payout?: number | null
        }
        Update: {
          challenger_id?: string
          circle_id?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          opponent_id?: string
          platform_fee?: number | null
          question?: string | null
          stake_amount?: number
          status?: string
          total_pot?: number | null
          winner_id?: string | null
          winner_payout?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learndat_challenges_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learndat_challenges_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "learndat_challenges_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learndat_challenges_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learndat_challenges_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      med_logs: {
        Row: {
          confirmed_at: string | null
          entered_day: string
          entered_time: string
          id: number
          initials: string
          medication_id: number
          notes: string | null
          patient_id: number
          reminder_id: number | null
        }
        Insert: {
          confirmed_at?: string | null
          entered_day: string
          entered_time: string
          id?: number
          initials: string
          medication_id: number
          notes?: string | null
          patient_id: number
          reminder_id?: number | null
        }
        Update: {
          confirmed_at?: string | null
          entered_day?: string
          entered_time?: string
          id?: number
          initials?: string
          medication_id?: number
          notes?: string | null
          patient_id?: number
          reminder_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "med_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "med_medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "med_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "med_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "med_logs_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "med_reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      med_medications: {
        Row: {
          created_at: string | null
          dosage: string | null
          id: number
          instructions: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          id?: number
          instructions?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          id?: number
          instructions?: string | null
          name?: string
        }
        Relationships: []
      }
      med_patients: {
        Row: {
          created_at: string | null
          id: number
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      med_push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: number
          p256dh: string
          patient_id: number
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: number
          p256dh: string
          patient_id: number
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: number
          p256dh?: string
          patient_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "med_push_subscriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "med_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      med_reminders: {
        Row: {
          created_at: string | null
          id: number
          medication_id: number
          patient_id: number
          schedule_id: number | null
          scheduled_for: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          medication_id: number
          patient_id: number
          schedule_id?: number | null
          scheduled_for: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          medication_id?: number
          patient_id?: number
          schedule_id?: number | null
          scheduled_for?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "med_reminders_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "med_medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "med_reminders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "med_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "med_reminders_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "med_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      med_schedules: {
        Row: {
          active: boolean | null
          created_at: string | null
          days_of_week: Json | null
          id: number
          medication_id: number
          patient_id: number
          reminder_time: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          days_of_week?: Json | null
          id?: number
          medication_id: number
          patient_id: number
          reminder_time: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          days_of_week?: Json | null
          id?: number
          medication_id?: number
          patient_id?: number
          reminder_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "med_schedules_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "med_medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "med_schedules_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "med_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          circle_id: string | null
          created_at: string
          id: string
          is_read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body: string
          circle_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string
          circle_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "notifications_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_challenges: {
        Row: {
          challenge_text: string
          challenger_id: string
          circle_id: string
          created_at: string
          deadline_at: string
          id: string
          status: string
          target_id: string
        }
        Insert: {
          challenge_text: string
          challenger_id: string
          circle_id: string
          created_at?: string
          deadline_at?: string
          id?: string
          status?: string
          target_id: string
        }
        Update: {
          challenge_text?: string
          challenger_id?: string
          circle_id?: string
          created_at?: string
          deadline_at?: string
          id?: string
          status?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_challenges_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_challenges_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "personal_challenges_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_challenges_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_revenue: {
        Row: {
          amount_cents: number
          circle_id: string | null
          created_at: string
          description: string | null
          id: string
          learndat_id: string | null
          source: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          circle_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          learndat_id?: string | null
          source: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          circle_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          learndat_id?: string | null
          source?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_revenue_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "platform_revenue_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_revenue_learndat_id_fkey"
            columns: ["learndat_id"]
            isOneToOne: false
            referencedRelation: "learndat_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_revenue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playthrough_ledger: {
        Row: {
          bonus_amount: number
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          is_completed: boolean
          played_amount: number
          required_playthrough: number
          source: string | null
          user_id: string
        }
        Insert: {
          bonus_amount: number
          completed_at?: string | null
          created_at?: string
          currency: string
          id?: string
          is_completed?: boolean
          played_amount?: number
          required_playthrough: number
          source?: string | null
          user_id: string
        }
        Update: {
          bonus_amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_completed?: boolean
          played_amount?: number
          required_playthrough?: number
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playthrough_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      power_move_usage: {
        Row: {
          circle_id: string | null
          cost_paid: number
          created_at: string
          id: string
          power_move_id: string
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          circle_id?: string | null
          cost_paid: number
          created_at?: string
          id?: string
          power_move_id: string
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          circle_id?: string | null
          cost_paid?: number
          created_at?: string
          id?: string
          power_move_id?: string
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "power_move_usage_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "power_move_usage_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "power_move_usage_power_move_id_fkey"
            columns: ["power_move_id"]
            isOneToOne: false
            referencedRelation: "power_moves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "power_move_usage_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "power_move_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      power_moves: {
        Row: {
          coin_cost: number
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          key: string
          name: string
        }
        Insert: {
          coin_cost: number
          created_at?: string
          description: string
          icon: string
          id?: string
          is_active?: boolean
          key: string
          name: string
        }
        Update: {
          coin_cost?: number
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          key?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_status: string
          age_verification_method: string | null
          age_verified_at: string | null
          betdat_balance: number
          betdat_bonus: number
          betdat_earned: number
          betit_balance: number
          betit_bonus: number
          betit_earned: number
          can_redeem: boolean
          created_at: string
          date_of_birth: string | null
          id: string
          kyc_approved_at: string | null
          kyc_attempts: number
          kyc_level: string
          kyc_provider: string | null
          kyc_reference_id: string | null
          kyc_rejected_at: string | null
          kyc_rejection_reason: string | null
          kyc_status: string
          kyc_submitted_at: string | null
          mode: string
          provcoins_balance: number
          updated_at: string
        }
        Insert: {
          age_status?: string
          age_verification_method?: string | null
          age_verified_at?: string | null
          betdat_balance?: number
          betdat_bonus?: number
          betdat_earned?: number
          betit_balance?: number
          betit_bonus?: number
          betit_earned?: number
          can_redeem?: boolean
          created_at?: string
          date_of_birth?: string | null
          id: string
          kyc_approved_at?: string | null
          kyc_attempts?: number
          kyc_level?: string
          kyc_provider?: string | null
          kyc_reference_id?: string | null
          kyc_rejected_at?: string | null
          kyc_rejection_reason?: string | null
          kyc_status?: string
          kyc_submitted_at?: string | null
          mode?: string
          provcoins_balance?: number
          updated_at?: string
        }
        Update: {
          age_status?: string
          age_verification_method?: string | null
          age_verified_at?: string | null
          betdat_balance?: number
          betdat_bonus?: number
          betdat_earned?: number
          betit_balance?: number
          betit_bonus?: number
          betit_earned?: number
          can_redeem?: boolean
          created_at?: string
          date_of_birth?: string | null
          id?: string
          kyc_approved_at?: string | null
          kyc_attempts?: number
          kyc_level?: string
          kyc_provider?: string | null
          kyc_reference_id?: string | null
          kyc_rejected_at?: string | null
          kyc_rejection_reason?: string | null
          kyc_status?: string
          kyc_submitted_at?: string | null
          mode?: string
          provcoins_balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      proof_votes: {
        Row: {
          id: string
          proof_id: string
          user_id: string
          voted_at: string
        }
        Insert: {
          id?: string
          proof_id: string
          user_id: string
          voted_at?: string
        }
        Update: {
          id?: string
          proof_id?: string
          user_id?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_votes_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proofs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      proofs: {
        Row: {
          bullshit_votes_count: number
          circle_id: string
          has_crown_flex: boolean
          has_double_points: boolean
          id: string
          image_url: string
          points_awarded: number
          status: Database["public"]["Enums"]["proof_status"]
          submitted_at: string
          user_id: string
          watermark_text: string
        }
        Insert: {
          bullshit_votes_count?: number
          circle_id: string
          has_crown_flex?: boolean
          has_double_points?: boolean
          id?: string
          image_url: string
          points_awarded?: number
          status?: Database["public"]["Enums"]["proof_status"]
          submitted_at?: string
          user_id: string
          watermark_text: string
        }
        Update: {
          bullshit_votes_count?: number
          circle_id?: string
          has_crown_flex?: boolean
          has_double_points?: boolean
          id?: string
          image_url?: string
          points_awarded?: number
          status?: Database["public"]["Enums"]["proof_status"]
          submitted_at?: string
          user_id?: string
          watermark_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "proofs_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "proofs_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      redemption_requests: {
        Row: {
          admin_notes: string | null
          amount_betit: number
          amount_usd_cents: number
          average_pot_at_request: number | null
          created_at: string
          id: string
          processed_at: string | null
          required_minimum: number | null
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount_betit: number
          amount_usd_cents: number
          average_pot_at_request?: number | null
          created_at?: string
          id?: string
          processed_at?: string | null
          required_minimum?: number | null
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount_betit?: number
          amount_usd_cents?: number
          average_pot_at_request?: number | null
          created_at?: string
          id?: string
          processed_at?: string | null
          required_minimum?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemption_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsored_circles: {
        Row: {
          circle_id: string
          created_at: string
          id: string
          sponsor_id: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          id?: string
          sponsor_id: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          id?: string
          sponsor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_circles_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "sponsored_circles_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_circles_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          contract_fee: number
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          contract_fee: number
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          contract_fee?: number
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      strike_bombs: {
        Row: {
          attacker_id: string
          circle_id: string
          created_at: string
          detonates_at: string
          id: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["bomb_status"]
          target_id: string
        }
        Insert: {
          attacker_id: string
          circle_id: string
          created_at?: string
          detonates_at?: string
          id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["bomb_status"]
          target_id: string
        }
        Update: {
          attacker_id?: string
          circle_id?: string
          created_at?: string
          detonates_at?: string
          id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["bomb_status"]
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strike_bombs_attacker_id_fkey"
            columns: ["attacker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strike_bombs_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "strike_bombs_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strike_bombs_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      strikes: {
        Row: {
          circle_id: string
          id: string
          issued_at: string
          issued_by: string
          reason: string
          user_id: string
        }
        Insert: {
          circle_id: string
          id?: string
          issued_at?: string
          issued_by?: string
          reason?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          id?: string
          issued_at?: string
          issued_by?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strikes_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "strikes_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strikes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          circle_id: string | null
          created_at: string
          description: string | null
          id: string
          stripe_payment_id: string | null
          stripe_transfer_id: string | null
          type: Database["public"]["Enums"]["tx_type"]
          user_id: string | null
        }
        Insert: {
          amount: number
          circle_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          stripe_payment_id?: string | null
          stripe_transfer_id?: string | null
          type: Database["public"]["Enums"]["tx_type"]
          user_id?: string | null
        }
        Update: {
          amount?: number
          circle_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          stripe_payment_id?: string | null
          stripe_transfer_id?: string | null
          type?: Database["public"]["Enums"]["tx_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "transactions_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_power_moves: {
        Row: {
          created_at: string
          id: string
          power_move_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          power_move_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          power_move_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_power_moves_power_move_id_fkey"
            columns: ["power_move_id"]
            isOneToOne: false
            referencedRelation: "power_moves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_power_moves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          coin_balance: number
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          id: string
          is_18_verified: boolean
          is_admin: boolean
          stripe_account_id: string | null
          stripe_customer_id: string | null
          total_earned: number
          total_wins: number
          updated_at: string
          username: string
          win_streak: number
        }
        Insert: {
          avatar_url?: string | null
          coin_balance?: number
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id: string
          is_18_verified?: boolean
          is_admin?: boolean
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          total_earned?: number
          total_wins?: number
          updated_at?: string
          username: string
          win_streak?: number
        }
        Update: {
          avatar_url?: string | null
          coin_balance?: number
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id?: string
          is_18_verified?: boolean
          is_admin?: boolean
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          total_earned?: number
          total_wins?: number
          updated_at?: string
          username?: string
          win_streak?: number
        }
        Relationships: []
      }
      winner_finder_competitors: {
        Row: {
          checked_at: string
          id: string
          price: number
          product_id: string
          seller_name: string | null
          url: string | null
        }
        Insert: {
          checked_at?: string
          id?: string
          price: number
          product_id: string
          seller_name?: string | null
          url?: string | null
        }
        Update: {
          checked_at?: string
          id?: string
          price?: number
          product_id?: string
          seller_name?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "winner_finder_competitors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "winner_finder_products"
            referencedColumns: ["id"]
          },
        ]
      }
      winner_finder_products: {
        Row: {
          category: string | null
          cost_price: number
          created_at: string
          id: string
          name: string
          notes: string | null
          saturation_score: number
          shipping_cost: number
          status: string
          target_margin_pct: number
          trend_score: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_price?: number
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          saturation_score?: number
          shipping_cost?: number
          status?: string
          target_margin_pct?: number
          trend_score?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_price?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          saturation_score?: number
          shipping_cost?: number
          status?: string
          target_margin_pct?: number
          trend_score?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_threats: {
        Row: {
          attacker_id: string | null
          attacker_username: string | null
          circle_id: string | null
          created_at: string | null
          detonates_at: string | null
          id: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["bomb_status"] | null
          target_id: string | null
          target_username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strike_bombs_attacker_id_fkey"
            columns: ["attacker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strike_bombs_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "strike_bombs_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strike_bombs_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_leaderboard: {
        Row: {
          avatar_url: string | null
          circle_id: string | null
          has_shield: boolean | null
          rank: number | null
          score: number | null
          status: Database["public"]["Enums"]["member_status"] | null
          strike_count: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circle_pot_summary"
            referencedColumns: ["circle_id"]
          },
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_pot_summary: {
        Row: {
          buy_in_amount: number | null
          circle_id: string | null
          estimated_winner_payout: number | null
          gross_pot: number | null
          member_count: number | null
          name: string | null
          platform_fee: number | null
          pot_total: number | null
          stripe_fee: number | null
        }
        Relationships: []
      }
      current_redemption_minimum: {
        Row: {
          average_pot_cents: number | null
          minimum_redemption_betit: number | null
          minimum_redemption_cents: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_coins: {
        Args: {
          p_amount: number
          p_circle_id?: string
          p_description?: string
          p_type: string
          p_user_id: string
        }
        Returns: Json
      }
      add_soft_currency: {
        Args: {
          p_amount: number
          p_currency: string
          p_is_bonus: boolean
          p_reference_id?: string
          p_source?: string
          p_user_id: string
        }
        Returns: undefined
      }
      apply_playthrough: {
        Args: { p_amount: number; p_currency: string; p_user_id: string }
        Returns: undefined
      }
      calculate_payout: { Args: { p_circle_id: string }; Returns: Json }
      get_average_circle_pot: { Args: never; Returns: number }
      is_circle_member: { Args: { p_circle_id: string }; Returns: boolean }
      issue_strike: {
        Args: {
          p_circle_id: string
          p_issued_by?: string
          p_reason?: string
          p_user_id: string
        }
        Returns: Json
      }
      process_bullshit_vote: {
        Args: { p_proof_id: string; p_voter_id: string }
        Returns: Json
      }
      request_redemption: {
        Args: { p_amount_betit: number; p_user_id: string }
        Returns: string
      }
      resolve_expired_bombs: { Args: never; Returns: number }
      resolve_learndat: {
        Args: { p_learndat_id: string; p_winner_id: string }
        Returns: undefined
      }
      spend_coins: {
        Args: {
          p_amount: number
          p_circle_id?: string
          p_description?: string
          p_type: string
          p_user_id: string
        }
        Returns: Json
      }
      update_coin_balance: {
        Args: {
          p_amount: number
          p_currency: string
          p_description?: string
          p_reference_id?: string
          p_type: string
          p_user_id: string
        }
        Returns: number
      }
      use_personal_challenge: {
        Args: {
          p_challenge_text: string
          p_circle_id: string
          p_target_id: string
          p_user_id: string
        }
        Returns: Json
      }
      use_power_move: {
        Args: {
          p_circle_id?: string
          p_power_move_key: string
          p_target_user_id?: string
          p_user_id: string
        }
        Returns: undefined
      }
      use_strike_back: {
        Args: { p_circle_id: string; p_user_id: string }
        Returns: Json
      }
      use_strike_bomb: {
        Args: { p_circle_id: string; p_target_id: string; p_user_id: string }
        Returns: Json
      }
      use_strike_shield: {
        Args: { p_circle_id: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      bomb_status: "active" | "defused" | "detonated" | "blocked"
      circle_status: "pending" | "active" | "completed" | "canceled"
      member_status: "active" | "eliminated_spectator"
      notification_type:
        | "strike_received"
        | "bomb_incoming"
        | "bomb_detonated"
        | "bomb_defused"
        | "shield_activated"
        | "personal_challenge"
        | "proof_invalidated"
        | "circle_started"
        | "circle_ended"
        | "winner_announced"
        | "new_member"
      power_move_key:
        | "strike_back"
        | "personal_challenge"
        | "strike_shield"
        | "spy_mode"
        | "double_points"
        | "strike_bomb"
        | "crown_flex"
      proof_status: "pending" | "verified" | "invalidated"
      tx_type:
        | "buy_in"
        | "admin_fee"
        | "payout"
        | "refund"
        | "coin_purchase"
        | "power_move_spend"
        | "platform_fee"
        | "stripe_fee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Database

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
      bomb_status: ["active", "defused", "detonated", "blocked"],
      circle_status: ["pending", "active", "completed", "canceled"],
      member_status: ["active", "eliminated_spectator"],
      notification_type: [
        "strike_received",
        "bomb_incoming",
        "bomb_detonated",
        "bomb_defused",
        "shield_activated",
        "personal_challenge",
        "proof_invalidated",
        "circle_started",
        "circle_ended",
        "winner_announced",
        "new_member",
      ],
      power_move_key: [
        "strike_back",
        "personal_challenge",
        "strike_shield",
        "spy_mode",
        "double_points",
        "strike_bomb",
        "crown_flex",
      ],
      proof_status: ["pending", "verified", "invalidated"],
      tx_type: [
        "buy_in",
        "admin_fee",
        "payout",
        "refund",
        "coin_purchase",
        "power_move_spend",
        "platform_fee",
        "stripe_fee",
      ],
    },
  },
} as const
