<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { sidebarOpen } from '$lib/stores/sidebar';
  import '../app.css';
</script>

<!-- Force dark mode on body -->
<svelte:head>
  <script>
    document.documentElement.classList.add('dark');
  </script>
</svelte:head>

<!-- Sidebar Component (Fixed Position) -->
<Sidebar />

<!-- Main Content Area -->
<main 
  class="min-h-screen bg-gray-900 dark:bg-gray-900 transition-all duration-300 ease-in-out"
  class:ml-0={!$sidebarOpen}
  class:ml-64={$sidebarOpen}
>
  <div class="p-6 pt-16">
    <slot />
  </div>
</main>
