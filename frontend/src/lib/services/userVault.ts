import { browser } from '$app/environment';

export interface VaultData {
  [key: string]: any;
}

export class UserVaultService {
  private static instance: UserVaultService;
  private cache: Map<string, any> = new Map();
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  // If the backend table is missing, avoid spamming by short-circuiting for a period
  private vaultUnavailableUntil = 0;

  private constructor() {}

  public static getInstance(): UserVaultService {
    if (!UserVaultService.instance) {
      UserVaultService.instance = new UserVaultService();
    }
    return UserVaultService.instance;
  }

  private isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_TTL;
  }

  private clearCache(): void {
    this.cache.clear();
    this.cacheTimestamp = 0;
  }

  private isVaultTemporarilyUnavailable(): boolean {
    return Date.now() < this.vaultUnavailableUntil;
  }

  private markVaultUnavailable(ms = 60_000): void {
    // Back off further requests for a bit when table is missing (PGRST205)
    this.vaultUnavailableUntil = Date.now() + ms;
  }

  private async ensureUser(userId: string): Promise<boolean> {
    // User creation is now handled by the auth system
    return true;
  }

  public async setData(key: string, value: any, userId: string): Promise<boolean> {
    try {
      if (this.isVaultTemporarilyUnavailable()) {
        // Gracefully skip writes while unavailable
        return false;
      }
      if (!(await this.ensureUser(userId))) {
        throw new Error('User not found and could not be created');
      }

      if (!browser) return false;

      const response = await fetch('/api/user-vault/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({ key, value })
      });

      if (!response.ok) {
        throw new Error('Failed to set vault data');
      }
      
      // Update cache
      this.cache.set(`${userId}_${key}`, value);
      return true;
    } catch (error: any) {
      if (error?.code === 'PGRST205') {
        // Table not found in schema cache; back off to prevent log spam
        this.markVaultUnavailable();
        console.warn('user_vault table missing; backing off user vault writes for 60s');
        return false;
      }
      console.error('Error saving to user vault:', error);
      return false;
    }
  }

  public async getData<T = any>(key: string, userId: string): Promise<T | null> {
    const cacheKey = `${userId}_${key}`;
    
    // Return from cache if valid
    if (this.cache.has(cacheKey) && this.isCacheValid()) {
      return this.cache.get(cacheKey);
    }

    try {
      if (this.isVaultTemporarilyUnavailable()) {
        // Short-circuit while unavailable
        return null;
      }
      if (!(await this.ensureUser(userId))) {
        throw new Error('User not found and could not be created');
      }

      if (!browser) return null;

      const response = await fetch('/api/user-vault/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({ key })
      });

      if (!response.ok) {
        throw new Error('Failed to get vault data');
      }

      const { value } = await response.json();
      
      // Update cache
      this.cache.set(cacheKey, value);
      this.cacheTimestamp = Date.now();
      
      return value as T;
    } catch (error: any) {
      if (error?.code === 'PGRST205') {
        this.markVaultUnavailable();
        console.warn('user_vault table missing; backing off user vault reads for 60s');
        return null;
      }
      console.error('Error reading from user vault:', error);
      return null;
    }
  }

  public async deleteData(key: string, userId: string): Promise<boolean> {
    try {
      if (this.isVaultTemporarilyUnavailable()) {
        return false;
      }
      if (!browser) return false;

      const response = await fetch('/api/user-vault/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({ key })
      });

      if (!response.ok) {
        throw new Error('Failed to delete vault data');
      }
      
      // Clear cache for this key
      this.cache.delete(`${userId}_${key}`);
      return true;
    } catch (error) {
      console.error('Error deleting from user vault:', error);
      return false;
    }
  }

  public async getAllUserData(userId: string): Promise<Record<string, any> | null> {
    try {
      if (!(await this.ensureUser(userId))) {
        throw new Error('User not found and could not be created');
      }

      if (!browser) return null;

      const response = await fetch('/api/user-vault/get-all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get all vault data');
      }

      const { data } = await response.json();
      
      // Update cache for each item
      Object.entries(data).forEach(([key, value]) => {
        this.cache.set(`${userId}_${key}`, value);
      });
      
      this.cacheTimestamp = Date.now();
      return data;
    } catch (error) {
      console.error('Error getting all user vault data:', error);
      return null;
    }
  }

  public clearAllUserData(userId: string): void {
    // This only clears the local cache
    // To delete all data from the server, call deleteData for each key
    this.cache.clear();
    this.cacheTimestamp = 0;
  }
}

export const userVault = UserVaultService.getInstance();
