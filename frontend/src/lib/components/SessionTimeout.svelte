<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import { Modal, Button, Alert } from 'flowbite-svelte';
  import { ClockSolid } from 'flowbite-svelte-icons';

  let showWarning = false;
  let timeRemaining = 0;
  let warningTimer: NodeJS.Timeout | null = null;
  let countdownTimer: NodeJS.Timeout | null = null;

  // 7.5 hours = 27000 seconds (30 min before 8 hour timeout)
  const WARNING_TIME = 27000 * 1000; // milliseconds
  const LOGOUT_TIME = 28800 * 1000; // 8 hours in milliseconds

  onMount(() => {
    if ($user) {
      startSessionMonitoring();
    }
  });

  onDestroy(() => {
    cleanup();
  });

  function startSessionMonitoring() {
    // Check session every minute
    const checkInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        cleanup();
        return;
      }

      const sessionAge = Date.now() - new Date(session.user.created_at).getTime();
      
      if (sessionAge > WARNING_TIME && !showWarning) {
        showSessionWarning();
      }
      
      if (sessionAge > LOGOUT_TIME) {
        await forceLogout();
      }
    }, 60000); // Check every minute

    // Cleanup on component destroy
    return () => clearInterval(checkInterval);
  }

  function showSessionWarning() {
    showWarning = true;
    timeRemaining = 30 * 60; // 30 minutes in seconds

    // Start countdown
    countdownTimer = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        forceLogout();
      }
    }, 1000);
  }

  async function extendSession() {
    try {
      await supabase.auth.refreshSession();
      showWarning = false;
      cleanup();
    } catch (error) {
      console.error('Failed to extend session:', error);
      await forceLogout();
    }
  }

  async function forceLogout() {
    cleanup();
    await supabase.auth.signOut();
  }

  function cleanup() {
    if (warningTimer) {
      clearTimeout(warningTimer);
      warningTimer = null;
    }
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    showWarning = false;
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

{#if $user}
  <Modal bind:open={showWarning} size="sm" permanent>
    <div class="text-center p-6">
      <ClockSolid class="w-16 h-16 mx-auto mb-4 text-orange-400" />
      
      <h3 class="text-xl font-bold text-white mb-4">
        Session Expiring Soon
      </h3>
      
      <Alert color="orange" class="mb-4">
        Your session will expire in <strong>{formatTime(timeRemaining)}</strong> due to inactivity.
      </Alert>
      
      <p class="text-gray-300 mb-6">
        Click "Stay Logged In" to extend your session, or you'll be automatically logged out for security.
      </p>
      
      <div class="flex gap-3 justify-center">
        <Button color="primary" on:click={extendSession}>
          Stay Logged In
        </Button>
        <Button color="alternative" on:click={forceLogout}>
          Log Out Now
        </Button>
      </div>
    </div>
  </Modal>
{/if}
