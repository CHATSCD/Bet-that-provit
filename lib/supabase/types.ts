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
          circle_id: string | null
          created_at: string
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          circle_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          circle_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
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
      power_moves: {
        Row: {
          coin_cost: number
          description: string
          icon: string
          id: string
          key: Database["public"]["Enums"]["power_move_key"]
          name: string
        }
        Insert: {
          coin_cost: number
          description: string
          icon: string
          id?: string
          key: Database["public"]["Enums"]["power_move_key"]
          name: string
        }
        Update: {
          coin_cost?: number
          description?: string
          icon?: string
          id?: string
          key?: Database["public"]["Enums"]["power_move_key"]
          name?: string
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
      users: {
        Row: {
          avatar_url: string | null
          coin_balance: number
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          id: string
          is_18_verified: boolean
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
      calculate_payout: { Args: { p_circle_id: string }; Returns: Json }
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
      resolve_expired_bombs: { Args: never; Returns: number }
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
      use_personal_challenge: {
        Args: {
          p_challenge_text: string
          p_circle_id: string
          p_target_id: string
          p_user_id: string
        }
        Returns: Json
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof Database
}
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
