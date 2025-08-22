<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import SessionTimeout from '$lib/components/SessionTimeout.svelte';
  import { sidebarOpen } from '$lib/stores/sidebar';
  import { user, loading } from '$lib/stores/auth';
  import { startConnectionMonitoring, stopConnectionMonitoring } from '$lib/stores/api';
  import { page } from '$app/stores';
  import { Spinner } from 'flowbite-svelte';
  import { onMount, onDestroy } from 'svelte';
  import '../app.css';

  // Pages that don't need the sidebar
  $: hideNavigation = ['/login', '/register', '/auth/callback'].includes($page.url.pathname);

  // Initialize API connection monitoring
  onMount(() => {
    startConnectionMonitoring();
  });

  onDestroy(() => {
    stopConnectionMonitoring();
  });
</script>

<!-- Force dark mode on body -->
<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <script>
    document.documentElement.classList.add('dark');
  </script>
</svelte:head>

{#if $loading}
  <!-- Loading screen -->
  <div class="min-h-screen flex items-center justify-center bg-gray-900">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <p class="mt-4 text-gray-400">Loading...</p>
  </div>
{:else}
  <!-- Sidebar Component (Fixed Position) -->
  {#if !hideNavigation}
    <Sidebar />
  {/if}

  <!-- Main Content Area -->
  <main 
    class="min-h-screen bg-gray-900 dark:bg-gray-900 transition-all duration-300 ease-in-out"
    class:ml-0={hideNavigation}
    class:lg:ml-64={$sidebarOpen && !hideNavigation}
  >
    <div class="p-6" class:pt-16={!hideNavigation}>
      <slot />
    </div>
  </main>

  <!-- Session Timeout Component -->
  <SessionTimeout />
{/if}
