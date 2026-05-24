export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          stripe_customer_id: string | null
          stripe_account_id: string | null
          coin_balance: number
          win_streak: number
          total_wins: number
          total_earned: number
          is_18_verified: boolean
          date_of_birth: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      circles: {
        Row: {
          id: string
          creator_id: string
          name: string
          challenge: string
          buy_in_amount: number
          admin_fee: number
          platform_fee_pct: number
          invite_code: string
          is_public: boolean
          status: 'pending' | 'active' | 'completed' | 'canceled'
          max_members: number | null
          start_date: string
          end_date: string
          pot_total: number
          winner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['circles']['Row'], 'id' | 'invite_code' | 'pot_total' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['circles']['Insert']>
      }
      circle_members: {
        Row: {
          id: string
          circle_id: string
          user_id: string
          status: 'active' | 'eliminated_spectator'
          strike_count: number
          score: number
          rank: number | null
          has_shield: boolean
          stripe_payment_intent_id: string | null
          paid_at: string | null
          eliminated_at: string | null
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['circle_members']['Row'], 'id' | 'joined_at'>
        Update: Partial<Database['public']['Tables']['circle_members']['Insert']>
      }
      proofs: {
        Row: {
          id: string
          circle_id: string
          user_id: string
          image_url: string
          watermark_text: string
          status: 'pending' | 'verified' | 'invalidated'
          points_awarded: number
          bullshit_votes_count: number
          has_crown_flex: boolean
          has_double_points: boolean
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['proofs']['Row'], 'id' | 'submitted_at'>
        Update: Partial<Database['public']['Tables']['proofs']['Insert']>
      }
      strike_bombs: {
        Row: {
          id: string
          circle_id: string
          attacker_id: string
          target_id: string
          status: 'active' | 'defused' | 'detonated' | 'blocked'
          detonates_at: string
          resolved_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['strike_bombs']['Row'], 'id' | 'detonates_at' | 'created_at'>
        Update: Partial<Database['public']['Tables']['strike_bombs']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          circle_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      coin_packs: {
        Row: {
          id: string
          name: string
          coins: number
          bonus_coins: number
          price_cents: number
          is_featured: boolean
        }
        Insert: Omit<Database['public']['Tables']['coin_packs']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['coin_packs']['Insert']>
      }
      power_moves: {
        Row: {
          id: string
          key: string
          name: string
          description: string
          icon: string
          coin_cost: number
        }
        Insert: Omit<Database['public']['Tables']['power_moves']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['power_moves']['Insert']>
      }
    }
    Views: {
      circle_leaderboard: {
        Row: {
          circle_id: string
          user_id: string
          username: string
          avatar_url: string | null
          score: number
          strike_count: number
          status: string
          has_shield: boolean
          rank: number
        }
      }
      circle_pot_summary: {
        Row: {
          circle_id: string
          name: string
          buy_in_amount: number
          pot_total: number
          member_count: number
          gross_pot: number
          platform_fee: number
          stripe_fee: number
          estimated_winner_payout: number
        }
      }
    }
    Functions: {
      issue_strike: { Args: { p_circle_id: string; p_user_id: string; p_reason?: string; p_issued_by?: string }; Returns: Json }
      calculate_payout: { Args: { p_circle_id: string }; Returns: Json }
      add_coins: { Args: { p_user_id: string; p_amount: number; p_type: string; p_description?: string; p_circle_id?: string }; Returns: Json }
      spend_coins: { Args: { p_user_id: string; p_amount: number; p_type: string; p_description?: string; p_circle_id?: string }; Returns: Json }
      use_strike_shield: { Args: { p_user_id: string; p_circle_id: string }; Returns: Json }
      use_strike_bomb: { Args: { p_user_id: string; p_circle_id: string; p_target_id: string }; Returns: Json }
      use_strike_back: { Args: { p_user_id: string; p_circle_id: string }; Returns: Json }
      use_personal_challenge: { Args: { p_user_id: string; p_circle_id: string; p_target_id: string; p_challenge_text: string }; Returns: Json }
      process_bullshit_vote: { Args: { p_proof_id: string; p_voter_id: string }; Returns: Json }
      resolve_expired_bombs: { Args: Record<string, never>; Returns: number }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']
