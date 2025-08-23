<script lang="ts">
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth';
  import { gameSettingsStore } from '$lib/stores/gameSettingsStore';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { DEFAULT_GAME_SETTINGS, type GameSettings } from '$lib/constants/gameSettings';
  
  // Tab management
  let activeTab = $state('gameplay');
  let isLoading = $state(true);
  let isSaving = $state(false);
  let saveSuccess = $state(false);
  let saveError = $state<string | null>(null);
  
  // Initialize with full default settings to satisfy bindings
  let settings = $state<GameSettings>({ ...DEFAULT_GAME_SETTINGS });
  
  // Load settings when component mounts
  onMount(async () => {
    if (!$user) {
      goto('/auth/signin?redirect=/settings');
      return;
    }
    
    try {
      isLoading = true;
      await gameSettingsStore.refresh($user.id);
      
      // Initialize with stored settings or defaults
      if ($gameSettingsStore.settings) {
        settings = { ...$gameSettingsStore.settings } as GameSettings;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      saveError = 'Failed to load settings. Please try again.';
    } finally {
      isLoading = false;
    }
  });
  
  // Save a subset of settings (extend as needed)
  async function saveSettings() {
    if (!$user) return;
    
    try {
      isSaving = true;
      saveError = null;
      
      // Save common controls
      await gameSettingsStore.updateSetting('sound', 'enabled', settings.sound.enabled);
      await gameSettingsStore.updateSetting('sound', 'volume', settings.sound.volume);
      await gameSettingsStore.updateSetting('graphics', 'quality', settings.graphics.quality);
      await gameSettingsStore.updateSetting('graphics', 'animations', settings.graphics.animations);
      
      // Notifications (individual toggles)
      await gameSettingsStore.updateSetting('notifications', 'sound', settings.notifications.sound);
      await gameSettingsStore.updateSetting('notifications', 'push', settings.notifications.push);
      await gameSettingsStore.updateSetting('notifications', 'email', settings.notifications.email);
      await gameSettingsStore.updateSetting('notifications', 'bonusOffers', settings.notifications.bonusOffers);
      await gameSettingsStore.updateSetting('notifications', 'jackpotWins', settings.notifications.jackpotWins);
      await gameSettingsStore.updateSetting('notifications', 'freeSpins', settings.notifications.freeSpins);
      
      // Privacy
      await gameSettingsStore.updateSetting('privacy', 'showInLeaderboards', settings.privacy.showInLeaderboards);
      await gameSettingsStore.updateSetting('privacy', 'allowFriendRequests', settings.privacy.allowFriendRequests);
      await gameSettingsStore.updateSetting('privacy', 'showOnlineStatus', settings.privacy.showOnlineStatus);
      
      // Gameplay
      await gameSettingsStore.updateSetting('gameplay', 'autoSpin', settings.gameplay.autoSpin);
      await gameSettingsStore.updateSetting('gameplay', 'autoSpinCount', settings.gameplay.autoSpinCount);
      await gameSettingsStore.updateSetting('gameplay', 'quickSpin', settings.gameplay.quickSpin);
      await gameSettingsStore.updateSetting('gameplay', 'turboMode', settings.gameplay.turboMode);
      await gameSettingsStore.updateSetting('gameplay', 'spaceToSpin', settings.gameplay.spaceToSpin);
      await gameSettingsStore.updateSetting('gameplay', 'showWinCelebration', settings.gameplay.showWinCelebration);
      await gameSettingsStore.updateSetting('gameplay', 'showGameHistory', settings.gameplay.showGameHistory);
      
      saveSuccess = true;
      setTimeout(() => (saveSuccess = false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      saveError = 'Failed to save settings. Please try again.';
    } finally {
      isSaving = false;
    }
  }
  
  // Reset to defaults
  function resetToDefaults() {
    if (confirm('Reset all settings to default?')) {
      settings = { ...DEFAULT_GAME_SETTINGS } as GameSettings;
      saveSettings();
    }
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
  <h1 class="text-3xl font-bold text-white mb-6">Game Settings</h1>
  
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  {:else}
    <!-- Tabs -->
    <div class="border-b border-gray-700 mb-6">
      <nav class="flex space-x-4">
        {#each ['gameplay', 'sound', 'graphics', 'notifications', 'privacy'] as tab}
          <button
            class="py-3 px-1 border-b-2 font-medium text-sm {activeTab === tab 
              ? 'border-blue-500 text-blue-400' 
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}"
            onclick={() => activeTab = tab}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        {/each}
      </nav>
    </div>
    
    <!-- Save status -->
    {#if saveSuccess}
      <div 
        class="mb-6 p-4 bg-green-900/50 border border-green-800 text-green-200 rounded-lg"
        transition:fade
      >
        Settings saved successfully!
      </div>
    {/if}
    
    {#if saveError}
      <div 
        class="mb-6 p-4 bg-red-900/50 border border-red-800 text-red-200 rounded-lg"
        transition:fade
      >
        {saveError}
      </div>
    {/if}
    
    <!-- Settings Forms -->
    <form class="space-y-6" onsubmit|preventDefault={saveSettings}>
      <!-- Sound Settings -->
      {#if activeTab === 'sound'}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <label for="soundEnabled" class="block text-sm font-medium text-gray-300">
                Enable Sound
              </label>
              <p class="text-xs text-gray-500">
                Toggle all game sounds
              </p>
            </div>
            <input
              type="checkbox"
              id="soundEnabled"
              bind:checked={settings.sound.enabled}
              class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <label for="volume" class="block text-sm font-medium text-gray-300">
                Volume
              </label>
              <span class="text-xs text-gray-400">
                {Math.round(settings.sound.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="volume"
              min="0"
              max="1"
              step="0.05"
              bind:value={settings.sound.volume}
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      
      <!-- Graphics Settings -->
      {:else if activeTab === 'graphics'}
        <div class="space-y-6">
          <div class="space-y-2">
            <label for="graphicsQuality" class="block text-sm font-medium text-gray-300">
              Graphics Quality
            </label>
            <select
              id="graphicsQuality"
              bind:value={settings.graphics.quality}
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-700 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <label for="animations" class="block text-sm font-medium text-gray-300">
                Enable Animations
              </label>
              <p class="text-xs text-gray-500">
                Toggle all game animations
              </p>
            </div>
            <input
              type="checkbox"
              id="animations"
              bind:checked={settings.graphics.animations}
              class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      
      <!-- Notifications Settings -->
      {:else if activeTab === 'notifications'}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <label for="notificationSound" class="block text-sm font-medium text-gray-300">
                Notification Sound
              </label>
              <p class="text-xs text-gray-500">
                Play sound for notifications
              </p>
            </div>
            <input
              type="checkbox"
              id="notificationSound"
              bind:checked={settings.notifications.sound}
              class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label for="notificationsPush" class="block text-sm font-medium text-gray-300">
                Push Notifications
              </label>
              <p class="text-xs text-gray-500">
                Receive push notifications
              </p>
            </div>
            <input
              type="checkbox"
              id="notificationsPush"
              bind:checked={settings.notifications.push}
              class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label for="notificationsEmail" class="block text-sm font-medium text-gray-300">
                Email Notifications
              </label>
              <p class="text-xs text-gray-500">
                Receive email notifications
              </p>
            </div>
            <input
              type="checkbox"
              id="notificationsEmail"
              bind:checked={settings.notifications.email}
              class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label for="bonusOffers" class="block text-sm font-medium text-gray-300">
                Bonus Offers
              </label>
              <p class="text-xs text-gray-500">
                Notify about new bonuses
              </p>
            </div>
            <input
              type="checkbox"
              id="bonusOffers"
              bind:checked={settings.notifications.bonusOffers}
              class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label for="jackpotWins" class="block text-sm font-medium text-gray-300">
                Jackpot Wins
              </label>
              <p class="text-xs text-gray-500">
                Notify about jackpot wins
              </p>
            </div>
            <input
              type="checkbox"
              id="jackpotWins"
              bind:checked={settings.notifications.jackpotWins}
              class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label for="freeSpins" class="block text-sm font-medium text-gray-300">
                Free Spins
              </label>
              <p class="text-xs text-gray-500">
                Notify about free spin rewards
              </p>
            </div>
            <input
              type="checkbox"
              id="freeSpins"
              bind:checked={settings.notifications.freeSpins}
              class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      
      <!-- Privacy Settings -->
      {:else if activeTab === 'privacy'}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <label for="showInLeaderboards" class="block text-sm font-medium text-gray-300">
                Show in Leaderboards
              </label>
              <p class="text-xs text-gray-500">
                Display your username in public leaderboards
              </p>
            </div>
            <input
              type="checkbox"
              id="showInLeaderboards"
              bind:checked={settings.privacy.showInLeaderboards}
              class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      
      <!-- Default Gameplay Settings -->
      {:else}
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <label for="autoSpin" class="block text-sm font-medium text-gray-300">
                Auto Spin
              </label>
              <p class="text-xs text-gray-500">
                Automatically spin the reels after a win
              </p>
            </div>
            <input
              type="checkbox"
              id="autoSpin"
              bind:checked={settings.gameplay.autoSpin}
              class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <label for="quickSpin" class="block text-sm font-medium text-gray-300">
                Quick Spin
              </label>
              <p class="text-xs text-gray-500">
                Speed up the spinning animation
              </p>
            </div>
            <input
              type="checkbox"
              id="quickSpin"
              bind:checked={settings.gameplay.quickSpin}
              class="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      {/if}
      
      <!-- Action Buttons -->
      <div class="pt-6 flex justify-between">
        <button
          type="button"
          onclick={resetToDefaults}
          class="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSaving}
        >
          Reset to Defaults
        </button>
        
        <button
          type="submit"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  {/if}
</div>
