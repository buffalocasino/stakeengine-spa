<script lang="ts">
  import Sidebar from '$lib/components/Sidebar.svelte';
</script>

<div class="flex h-screen bg-gray-100">
  <!-- Sidebar -->
  <Sidebar />

  <!-- Main content area -->
  <main class="flex-1 overflow-y-auto p-6">
    <slot />
  </main>
</div>
