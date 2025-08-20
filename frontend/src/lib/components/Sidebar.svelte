<script lang="ts">
  import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
  import { 
    HomeSolid, 
    PlaySolid, 
    WalletSolid, 
    UserSolid, 
    CreditCardSolid,
    ChevronLeftOutline,
    ChevronRightOutline
  } from 'flowbite-svelte-icons';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { sidebarOpen } from '$lib/stores/sidebar';

  const navItems = [
    { 
      name: 'Home', 
      href: '/', 
      icon: HomeSolid 
    },
    { 
      name: 'Games', 
      href: '/games', 
      icon: PlaySolid 
    },
    { 
      name: 'Vault', 
      href: '/vault', 
      icon: WalletSolid 
    },
    { 
      name: 'Profile', 
      href: '/profile', 
      icon: UserSolid 
    },
    { 
      name: 'Buy', 
      href: '/buy', 
      icon: CreditCardSolid 
    }
  ];

  function toggleSidebar() {
    sidebarOpen.update(open => !open);
  }

  // Close sidebar on mobile by default
  onMount(() => {
    if (window.innerWidth < 1024) {
      sidebarOpen.set(false);
    }
  });
</script>

<!-- Mobile Overlay -->
{#if $sidebarOpen}
  <div 
    class="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 lg:hidden"
    on:click={toggleSidebar}
    on:keydown={(e) => e.key === 'Escape' && toggleSidebar()}
    role="button"
    tabindex="0"
    aria-label="Close sidebar"
  ></div>
{/if}

<!-- Toggle Button -->
<button
  on:click={toggleSidebar}
  class="fixed top-4 z-50 p-2 text-gray-300 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
  class:left-4={!$sidebarOpen}
  class:left-64={$sidebarOpen}
  aria-label="Toggle sidebar"
>
  {#if $sidebarOpen}
    <ChevronLeftOutline class="w-5 h-5" />
  {:else}
    <ChevronRightOutline class="w-5 h-5" />
  {/if}
</button>

<!-- Sidebar -->
<Sidebar 
  class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out {$sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
>
  <SidebarWrapper class="h-full px-3 py-4 overflow-y-auto bg-gray-800 dark:bg-gray-800 border-r border-gray-700 dark:border-gray-700">
    <!-- Brand/Logo -->
    <div class="flex items-center mb-6 px-3">
      <span class="text-xl font-semibold text-primary-500">StakeEngine</span>
    </div>

    <SidebarGroup>
      {#each navItems as item}
        <SidebarItem 
          label={item.name}
          href={item.href}
          active={$page.url.pathname === item.href}
        >
          <svelte:component this={item.icon} slot="icon" class="w-5 h-5" />
        </SidebarItem>
      {/each}
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>