<script lang="ts">
  import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper, Avatar, Dropdown, DropdownItem, DropdownDivider } from 'flowbite-svelte';
  import { 
    HomeSolid, 
    PlaySolid, 
    WalletSolid, 
    UserSolid, 
    CreditCardSolid,
    ChevronLeftOutline,
    ChevronRightOutline,
    ArrowRightToBracketOutline,
    UserCircleSolid
  } from 'flowbite-svelte-icons';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { sidebarOpen } from '$lib/stores/sidebar';
  import { user } from '$lib/stores/auth';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

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

  async function logout() {
    await supabase.auth.signOut();
    goto('/login');
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
  class:lg:left-64={$sidebarOpen}
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
      <span class="text-xl font-semibold text-primary-500">BuffaloCasino</span>
    </div>

    <SidebarGroup>
      {#each navItems as item}
        <SidebarItem 
          label={item.name}
          href={item.href}
          active={$page.url.pathname === item.href}
        >
          <svelte:fragment slot="icon">
            <svelte:component this={item.icon} class="w-5 h-5" />
          </svelte:fragment>
        </SidebarItem>
      {/each}
    </SidebarGroup>

    <!-- User Profile Section -->
    {#if $user}
      <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700">
        <div class="flex items-center space-x-3">
          <Avatar class="w-8 h-8">
            <UserCircleSolid class="w-8 h-8 text-gray-400" />
          </Avatar>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">
              {$user.email}
            </p>
          </div>
          <button
            on:click={logout}
            class="p-1 text-gray-400 hover:text-white transition-colors"
            title="Sign out"
          >
            <ArrowRightToBracketOutline class="w-4 h-4" />
          </button>
        </div>
      </div>
    {:else}
      <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700">
        <SidebarItem
          label="Sign In"
          href="/login"
          active={$page.url.pathname === '/login'}
        >
          <svelte:fragment slot="icon">
            <ArrowRightToBracketOutline class="w-5 h-5" />
          </svelte:fragment>
        </SidebarItem>
      </div>
    {/if}
  </SidebarWrapper>
</Sidebar>