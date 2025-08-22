import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: browser,
    detectSessionInUrl: browser
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username?: string | null;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          game_id: string;
          name: string;
          provider: string;
          rtp: number;
          house_edge: number;
          max_bet: number;
          theme: string | null;
          volatility: 'low' | 'medium' | 'high' | null;
          paylines: number | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          name: string;
          provider: string;
          rtp: number;
          house_edge: number;
          max_bet: number;
          theme?: string | null;
          volatility?: 'low' | 'medium' | 'high' | null;
          paylines?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          name?: string;
          provider?: string;
          rtp?: number;
          house_edge?: number;
          max_bet?: number;
          theme?: string | null;
          volatility?: 'low' | 'medium' | 'high' | null;
          paylines?: number | null;
          active?: boolean;
          created_at?: string;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          session_start: string;
          session_end: string | null;
          total_spins: number;
          total_wagered: number;
          total_won: number;
          net_result: number;
          starting_balance: number;
          ending_balance: number | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          session_start?: string;
          session_end?: string | null;
          total_spins?: number;
          total_wagered?: number;
          total_won?: number;
          net_result?: number;
          starting_balance: number;
          ending_balance?: number | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          session_start?: string;
          session_end?: string | null;
          total_spins?: number;
          total_wagered?: number;
          total_won?: number;
          net_result?: number;
          starting_balance?: number;
          ending_balance?: number | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      game_plays: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          game_id: string;
          bet_amount: number;
          win_amount: number;
          net_result: number;
          game_board: any | null;
          winning_lines: any | null;
          multipliers: any | null;
          bonus_features: any | null;
          spin_duration_ms: number | null;
          balance_before: number;
          balance_after: number;
          played_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          game_id: string;
          bet_amount: number;
          win_amount?: number;
          net_result: number;
          game_board?: any | null;
          winning_lines?: any | null;
          multipliers?: any | null;
          bonus_features?: any | null;
          spin_duration_ms?: number | null;
          balance_before: number;
          balance_after: number;
          played_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          game_id?: string;
          bet_amount?: number;
          win_amount?: number;
          net_result?: number;
          game_board?: any | null;
          winning_lines?: any | null;
          multipliers?: any | null;
          bonus_features?: any | null;
          spin_duration_ms?: number | null;
          balance_before?: number;
          balance_after?: number;
          played_at?: string;
          created_at?: string;
        };
      };
      wagering_statistics: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          date: string;
          total_spins: number;
          total_wagered: number;
          total_won: number;
          net_result: number;
          biggest_win: number;
          longest_session_minutes: number;
          avg_bet_amount: number;
          hit_frequency: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          date: string;
          total_spins?: number;
          total_wagered?: number;
          total_won?: number;
          net_result?: number;
          biggest_win?: number;
          longest_session_minutes?: number;
          avg_bet_amount?: number;
          hit_frequency?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          date?: string;
          total_spins?: number;
          total_wagered?: number;
          total_won?: number;
          net_result?: number;
          biggest_win?: number;
          longest_session_minutes?: number;
          avg_bet_amount?: number;
          hit_frequency?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
