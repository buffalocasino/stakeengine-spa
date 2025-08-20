<script lang="ts">
    import { writable } from 'svelte/store';
    import { page } from '$app/stores';
  
    const minimized = writable(false);
  
    const links = [
      { name: 'Home', href: '/', icon: '🏠' },
      { name: 'Games', href: '/games', icon: '🎮' },
      { name: 'Vault', href: '/vault', icon: '💼' },
      { name: 'Profile', href: '/profile', icon: '👤' },
      { name: 'Buy', href: '/buy', icon: '💳' }
    ];
  
    function toggle() {
      minimized.update(v => !v);
    }
  </script>
  
  <div class="h-full flex flex-col bg-white border-r shadow-md transition-all duration-300"
       class:min-w-[64px]={$minimized}
       class:w-64={!$minimized}>
    
    <!-- Header / Toggle -->
    <div class="flex items-center justify-between p-4 border-b">
      {#if !$minimized}
        <h1 class="text-lg font-bold">App</h1>
      {/if}
      <button
        class="p-2 rounded hover:bg-gray-200"
        on:click={toggle}
        aria-label="Toggle sidebar"
      >
        {#if $minimized}
          ➡️
        {:else}
          ⬅️
        {/if}
      </button>
    </div>
  
    <!-- Nav Links -->
    <nav class="flex-1 p-2 space-y-2">
      {#each links as link}
        <a
          href={link.href}
          class="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          class:bg-gray-200={$page.url.pathname === link.href}
        >
          <span class="text-lg">{link.icon}</span>
          {#if !$minimized}
            <span class="ml-3">{link.name}</span>
          {/if}
        </a>
      {/each}
    </nav>
  </div>
  