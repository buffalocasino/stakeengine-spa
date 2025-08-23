import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
  id: string;
  email: string;
  username?: string;
  balance: number;
  gold_coins: number;
  buffalo_coins: number;
  created_at: string;
}

export const user = writable<User | null>(null);
export const loading = writable(false);

// Initialize from localStorage if in browser
if (browser) {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  
  if (token && userData) {
    try {
      user.set(JSON.parse(userData));
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }
}

export async function signup(email: string, password: string, username?: string) {
  loading.set(true);
  
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    
    if (browser) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
    
    user.set(data.user);
    return data;
  } finally {
    loading.set(false);
  }
}

export async function login(email: string, password: string) {
  loading.set(true);
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    if (browser) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
    
    user.set(data.user);
    return data;
  } finally {
    loading.set(false);
  }
}

export function logout() {
  if (browser) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
  user.set(null);
}

export function getAuthToken(): string | null {
  if (!browser) return null;
  return localStorage.getItem('auth_token');
}
