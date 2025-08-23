import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { user } from '$lib/stores/auth';
import { get } from 'svelte/store';

export interface UserCurrencyBalances {
  id?: string;
  user_id: string;
  gold_coins: number;
  buffalo_coins: number;
  created_at?: string;
  updated_at?: string;
}

// Store for user currency balances
export const userBalances = writable<UserCurrencyBalances | null>(null);

class UserBalanceService {
  private currentBalances: UserCurrencyBalances | null = null;

  constructor() {
    // Subscribe to user changes to load balances
    user.subscribe(async (currentUser) => {
      if (currentUser?.id) {
        await this.loadUserBalances(currentUser.id);
      } else {
        this.currentBalances = null;
        userBalances.set(null);
      }
    });
  }

  async loadUserBalances(userId: string): Promise<UserCurrencyBalances | null> {
    try {
      if (!browser) return null;

      const response = await fetch('/api/user-balances/load', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (!response.ok) {
        console.error('Failed to load user balances');
        return null;
      }

      const { balances } = await response.json();
      this.currentBalances = balances;
      userBalances.set(this.currentBalances);
      return this.currentBalances;
    } catch (error) {
      console.error('Failed to load user balances:', error);
      return null;
    }
  }

  async createInitialBalance(userId: string): Promise<UserCurrencyBalances | null> {
    // Initial balance creation is now handled by the load endpoint
    return this.loadUserBalances(userId);
  }

  async updateBalance(
    currencyType: 'gold' | 'buffalo', 
    amount: number, 
    operation: 'add' | 'subtract' = 'add'
  ): Promise<boolean> {
    const currentUser = get(user);
    if (!currentUser || !this.currentBalances) {
      console.error('No user or balances available');
      return false;
    }

    try {
      const field = currencyType === 'gold' ? 'gold_coins' : 'buffalo_coins';
      const currentAmount = this.currentBalances[field];
      const newAmount = operation === 'add' ? currentAmount + amount : currentAmount - amount;

      // Prevent negative balances
      if (newAmount < 0) {
        console.error('Insufficient balance');
        return false;
      }

      if (!browser) return false;

      const response = await fetch('/api/user-balances/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          currencyType,
          amount,
          operation
        })
      });

      if (!response.ok) {
        console.error('Error updating balance');
        return false;
      }

      const { balances } = await response.json();

      // Update local state
      this.currentBalances = {
        ...balances,
        gold_coins: parseFloat(balances.gold_coins),
        buffalo_coins: parseFloat(balances.buffalo_coins)
      };
      userBalances.set(this.currentBalances);
      return true;
    } catch (error) {
      console.error('Failed to update balance:', error);
      return false;
    }
  }

  async processGameTransaction(
    currencyType: 'gold' | 'buffalo',
    betAmount: number,
    winAmount: number
  ): Promise<boolean> {
    const currentUser = get(user);
    if (!currentUser || !this.currentBalances) {
      return false;
    }

    try {
      const field = currencyType === 'gold' ? 'gold_coins' : 'buffalo_coins';
      const currentAmount = this.currentBalances[field];
      const newAmount = currentAmount - betAmount + winAmount;

      // Prevent negative balances
      if (newAmount < 0) {
        console.error('Insufficient balance for transaction');
        return false;
      }

      if (!browser) return false;

      const response = await fetch('/api/user-balances/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          currencyType,
          amount: newAmount,
          operation: 'set'
        })
      });

      if (!response.ok) {
        console.error('Error processing game transaction');
        return false;
      }

      const { balances } = await response.json();

      // Update local state
      this.currentBalances = balances;
      userBalances.set(this.currentBalances);
      return true;
    } catch (error) {
      console.error('Failed to process game transaction:', error);
      return false;
    }
  }

  getCurrentBalance(currencyType: 'gold' | 'buffalo'): number {
    if (!this.currentBalances) return 0;
    return currencyType === 'gold' ? this.currentBalances.gold_coins : this.currentBalances.buffalo_coins;
  }

  getBalances(): UserCurrencyBalances | null {
    return this.currentBalances;
  }
}

export const userBalanceService = new UserBalanceService();
