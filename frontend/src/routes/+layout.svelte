<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { sidebarOpen } from '$lib/stores/sidebar';
  import '../app.css';
</script>

<!-- Sidebar Component (Fixed Position) -->
<Sidebar />

<!-- Main Content Area -->
<main 
  class="min-h-screen bg-gray-100 transition-all duration-300 ease-in-out ml-0 lg:ml-64"
  class:lg:ml-0={!$sidebarOpen}
>
  <div class="p-6 pt-16">
    <slot />
  </div>
</main>
