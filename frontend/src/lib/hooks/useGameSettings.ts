import { onMount } from 'svelte';
import { gameSettingsStore } from '$lib/stores/gameSettingsStore';
import { user } from '$lib/stores/auth';
import { get } from 'svelte/store';

export function useGameSettings() {
  // Load settings when component mounts if user is logged in
  onMount(() => {
    const currentUser = get(user);
    if (currentUser) {
      gameSettingsStore.refresh(currentUser.id);
    }
  });

  // Helper function to update a setting
  const updateSetting = async <T extends keyof import('$lib/constants/gameSettings').GameSettings>(
    section: T,
    key: keyof import('$lib/constants/gameSettings').GameSettings[T],
    value: any
  ) => {
    return gameSettingsStore.updateSetting(section, key, value);
  };

  // Helper to update game progress
  const updateProgress = async <T extends keyof import('$lib/constants/gameSettings').GameProgress>(
    key: T,
    value: import('$lib/constants/gameSettings').GameProgress[T]
  ) => {
    return gameSettingsStore.updateProgress(key, value);
  };

  // Helper to increment a statistic
  const incrementStatistic = async (
    statKey: keyof import('$lib/constants/gameSettings').GameProgress['statistics'],
    amount: number = 1
  ) => {
    return gameSettingsStore.incrementStatistic(statKey, amount);
  };

  // Helper to unlock an achievement
  const unlockAchievement = async (achievementId: string) => {
    return gameSettingsStore.unlockAchievement(achievementId);
  };

  return {
    // Store subscription
    subscribe: gameSettingsStore.subscribe,
    
    // Actions
    updateSetting,
    updateProgress,
    incrementStatistic,
    unlockAchievement,
    clearError: gameSettingsStore.clearError
  };
}
