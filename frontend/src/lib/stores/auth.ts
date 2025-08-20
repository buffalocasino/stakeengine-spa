import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';
import { supabase } from '$lib/supabaseClient';

export const user = writable<User | null>(null);
export const loading = writable(true);

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  user.set(session?.user ?? null);
  loading.set(false);
});

// Get initial session
supabase.auth.getSession().then(({ data: { session } }) => {
  user.set(session?.user ?? null);
  loading.set(false);
});
