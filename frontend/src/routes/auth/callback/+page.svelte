<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { Spinner } from 'flowbite-svelte';
  
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const { data, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Auth error:', authError);
        error = authError.message;
        return;
      }

      if (data.session) {
        // User is authenticated, redirect to home
        goto('/');
      } else {
        // No session, redirect to login
        goto('/login');
      }
    } catch (err) {
      console.error('Callback error:', err);
      error = 'An unexpected error occurred';
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
  <div class="text-center">
    {#if loading}
      <Spinner size="8" />
      <p class="mt-4 text-gray-600 dark:text-gray-400">Completing authentication...</p>
    {:else if error}
      <div class="text-red-600 dark:text-red-400">
        <p class="text-lg font-semibold">Authentication Error</p>
        <p class="mt-2">{error}</p>
        <a href="/login" class="mt-4 inline-block text-primary-600 hover:text-primary-500">
          Return to Login
        </a>
      </div>
    {/if}
  </div>
</div>
