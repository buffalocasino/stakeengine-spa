import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface GamePlay {
  session_id: string;
  user_id: string;
  game_id: string;
  bet_amount: number;
  win_amount: number;
  net_result: number;
  game_board: any;
  winning_lines: any;
  spin_duration_ms?: number;
  balance_before: number;
  balance_after: number;
}

interface GameSession {
  id: string;
  user_id: string;
  game_id: string;
  starting_balance: number;
  ending_balance?: number;
  total_spins: number;
  total_wagered: number;
  total_won: number;
  net_result: number;
  session_start: string;
  session_end?: string;
  ip_address?: string;
  user_agent?: string;
}

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
      if (!browser) return null;
      
      const response = await fetch('/api/game-tracking/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          gameId,
          startingBalance
        })
      });

      if (!response.ok) {
        console.error('Failed to start game session');
        return null;
      }

      const { sessionId } = await response.json();
      const session = { id: sessionId };

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

      if (!browser) return false;

      const response = await fetch('/api/game-tracking/record-play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          sessionId: this.currentSessionId,
          gameId,
          betAmount,
          winAmount,
          gameBoard,
          winningLines,
          balanceBefore,
          balanceAfter,
          spinDuration
        })
      });

      if (!response.ok) {
        console.error('Failed to record game play');
        return false;
      }

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

      if (!browser) return false;

      const response = await fetch('/api/game-tracking/end-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          sessionId: this.currentSessionId,
          endingBalance
        })
      });

      if (!response.ok) {
        console.error('Failed to end game session');
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
    // Session totals are now updated in the record-play endpoint
    return;
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
    // This would need a separate API endpoint if needed
    console.log('getUserStatistics not implemented in client-side version');
    return null;
  }

  async getRecentPlays(userId: string, limit: number = 50) {
    // This would need a separate API endpoint if needed
    console.log('getRecentPlays not implemented in client-side version');
    return null;
  }
}

export const gameTrackingService = new GameTrackingService();
