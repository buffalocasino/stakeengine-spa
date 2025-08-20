<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { sidebarOpen } from '$lib/stores/sidebar';
  import { user, loading } from '$lib/stores/auth';
  import { page } from '$app/stores';
  import { Spinner } from 'flowbite-svelte';
  import '../app.css';

  // Pages that don't need the sidebar
  $: hideNavigation = ['/login', '/register', '/auth/callback'].includes($page.url.pathname);
</script>

<!-- Force dark mode on body -->
<svelte:head>
  <script>
    document.documentElement.classList.add('dark');
  </script>
</svelte:head>

{#if $loading}
  <!-- Loading screen -->
  <div class="min-h-screen flex items-center justify-center bg-gray-900">
    <div class="text-center">
      <Spinner size="8" />
      <p class="mt-4 text-gray-400">Loading...</p>
    </div>
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
{/if}
