import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { Database } from '$lib/supabase';

type GamePlay = Database['public']['Tables']['game_plays']['Insert'];
type GameSession = Database['public']['Tables']['game_sessions']['Row'];

export interface GameTrackingState {
  currentSession: GameSession | null;
  totalSpins: number;
  totalWagered: number;
  totalWon: number;
  sessionStartTime: Date | null;
  isTracking: boolean;
}

const initialState: GameTrackingState = {
  currentSession: null,
  totalSpins: 0,
  totalWagered: 0,
  totalWon: 0,
  sessionStartTime: null,
  isTracking: false
};

export const gameTracking = writable<GameTrackingState>(initialState);

class GameTrackingService {
  private currentSessionId: string | null = null;

  async startGameSession(gameId: string, userId: string, startingBalance: number): Promise<string | null> {
    try {
      // Get the game UUID from game_id
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('game_id', gameId)
        .single();

      if (gameError || !game) {
        console.error('Game not found:', gameError);
        return null;
      }

      // Create new session
      const { data: session, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: userId,
          game_id: game.id,
          starting_balance: startingBalance,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating game session:', error);
        return null;
      }

      this.currentSessionId = session.id;
      
      gameTracking.update(state => ({
        ...state,
        currentSession: session,
        sessionStartTime: new Date(),
        isTracking: true,
        totalSpins: 0,
        totalWagered: 0,
        totalWon: 0
      }));

      return session.id;
    } catch (error) {
      console.error('Error starting game session:', error);
      return null;
    }
  }

  async recordGamePlay(
    gameId: string,
    userId: string,
    betAmount: number,
    winAmount: number,
    gameBoard: any,
    winningLines: any,
    balanceBefore: number,
    balanceAfter: number,
    spinDuration?: number
  ): Promise<boolean> {
    try {
      if (!this.currentSessionId) {
        console.error('No active session to record play');
        return false;
      }

      // Get the game UUID from game_id
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('game_id', gameId)
        .single();

      if (gameError || !game) {
        console.error('Game not found:', gameError);
        return false;
      }

      const netResult = winAmount - betAmount;

      const gamePlay: GamePlay = {
        session_id: this.currentSessionId,
        user_id: userId,
        game_id: game.id,
        bet_amount: betAmount,
        win_amount: winAmount,
        net_result: netResult,
        game_board: gameBoard,
        winning_lines: winningLines,
        spin_duration_ms: spinDuration,
        balance_before: balanceBefore,
        balance_after: balanceAfter
      };

      const { error } = await supabase
        .from('game_plays')
        .insert(gamePlay);

      if (error) {
        console.error('Error recording game play:', error);
        return false;
      }

      // Update session totals
      await this.updateSessionTotals(betAmount, winAmount);

      // Update local state
      gameTracking.update(state => ({
        ...state,
        totalSpins: state.totalSpins + 1,
        totalWagered: state.totalWagered + betAmount,
        totalWon: state.totalWon + winAmount
      }));

      return true;
    } catch (error) {
      console.error('Error recording game play:', error);
      return false;
    }
  }

  async endGameSession(endingBalance: number): Promise<boolean> {
    try {
      if (!this.currentSessionId) {
        return false;
      }

      const { error } = await supabase
        .from('game_sessions')
        .update({
          session_end: new Date().toISOString(),
          ending_balance: endingBalance
        })
        .eq('id', this.currentSessionId);

      if (error) {
        console.error('Error ending game session:', error);
        return false;
      }

      // Reset tracking state
      this.currentSessionId = null;
      gameTracking.update(state => ({
        ...initialState
      }));

      return true;
    } catch (error) {
      console.error('Error ending game session:', error);
      return false;
    }
  }

  private async updateSessionTotals(betAmount: number, winAmount: number): Promise<void> {
    if (!this.currentSessionId) return;

    const netResult = winAmount - betAmount;

    await supabase
      .from('game_sessions')
      .update({
        total_spins: supabase.sql`total_spins + 1`,
        total_wagered: supabase.sql`total_wagered + ${betAmount}`,
        total_won: supabase.sql`total_won + ${winAmount}`,
        net_result: supabase.sql`net_result + ${netResult}`
      })
      .eq('id', this.currentSessionId);
  }

  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }

  async getUserStatistics(userId: string, gameId?: string, days: number = 30) {
    try {
      let query = supabase
        .from('wagering_statistics')
        .select(`
          *,
          games:game_id (
            name,
            game_id,
            theme
          )
        `)
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (gameId) {
        const { data: game } = await supabase
          .from('games')
          .select('id')
          .eq('game_id', gameId)
          .single();
        
        if (game) {
          query = query.eq('game_id', game.id);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user statistics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      return null;
    }
  }

  async getRecentPlays(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('game_plays')
        .select(`
          *,
          games:game_id (
            name,
            game_id,
            theme
          )
        `)
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent plays:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching recent plays:', error);
      return null;
    }
  }
}

export const gameTrackingService = new GameTrackingService();
