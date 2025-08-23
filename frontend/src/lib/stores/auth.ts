import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
  id: string;
  email: string;
  username?: string;
  balance: number;
  gold_coins: number;
  buffalo_coins: number;
}

export const user = writable<User | null>(null);
export const loading = writable(true);
export const token = writable<string | null>(null);

// Simple activity tracking for session extension
let lastActivity = Date.now();

// Update activity on user interaction
if (browser) {
  const updateActivity = () => {
    lastActivity = Date.now();
  };
  
  ['mousedown', 'keypress', 'touchstart', 'scroll'].forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true });
  });
}

// Auth functions
export const authApi = {
  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store token and user data
    if (browser) {
      localStorage.setItem('auth_token', data.token);
    }
    token.set(data.token);
    user.set(data.user);
    lastActivity = Date.now();
    
    return data;
  },

  async signup(email: string, password: string, username?: string) {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    
    // Store token and user data
    if (browser) {
      localStorage.setItem('auth_token', data.token);
    }
    token.set(data.token);
    user.set(data.user);
    lastActivity = Date.now();
    
    return data;
  },

  async logout() {
    if (browser) {
      localStorage.removeItem('auth_token');
    }
    token.set(null);
    user.set(null);
  },

  async refreshUser() {
    const currentToken = browser ? localStorage.getItem('auth_token') : null;
    if (!currentToken) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });

      if (!response.ok) {
        throw new Error('Token invalid');
      }

      const userData = await response.json();
      user.set(userData);
      token.set(currentToken);
      return userData;
    } catch (error) {
      // Token is invalid, clear it
      if (browser) {
        localStorage.removeItem('auth_token');
      }
      token.set(null);
      user.set(null);
      return null;
    }
  }
};

// Initialize auth state on page load
if (browser) {
  const storedToken = localStorage.getItem('auth_token');
  if (storedToken) {
    token.set(storedToken);
    authApi.refreshUser().finally(() => {
      loading.set(false);
    });
  } else {
    loading.set(false);
  }

  // Simple session check every 5 minutes
  setInterval(async () => {
    const currentToken = localStorage.getItem('auth_token');
    if (currentToken) {
      // Refresh user data if active in the last hour
      const hourAgo = Date.now() - (60 * 60 * 1000);
      if (lastActivity > hourAgo) {
        await authApi.refreshUser();
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
} else {
  loading.set(false);
}
