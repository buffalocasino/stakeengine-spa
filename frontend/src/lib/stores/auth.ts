import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';
import { supabase } from '$lib/supabaseClient';

export const user = writable<User | null>(null);
export const loading = writable(true);

// Simple activity tracking for session extension
let lastActivity = Date.now();

// Update activity on user interaction
if (typeof window !== 'undefined') {
  const updateActivity = () => {
    lastActivity = Date.now();
  };
  
  ['mousedown', 'keypress', 'touchstart', 'scroll'].forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true });
  });
}

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  user.set(session?.user ?? null);
  loading.set(false);
  
  if (event === 'SIGNED_IN') {
    lastActivity = Date.now();
  }
});

// Get initial session
supabase.auth.getSession().then(({ data: { session } }) => {
  user.set(session?.user ?? null);
  loading.set(false);
});

// Simple session check every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Refresh token if user has been active in the last hour
      const hourAgo = Date.now() - (60 * 60 * 1000);
      if (lastActivity > hourAgo) {
        await supabase.auth.refreshSession();
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}
