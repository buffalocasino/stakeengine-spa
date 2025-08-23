import { writable } from 'svelte/store';
import { gameSettingsService } from '$lib/services/gameSettingsService';
import { user } from './auth';
import type { GameSettings, GameProgress } from '$lib/constants/gameSettings';

interface GameSettingsState {
  settings: GameSettings | null;
  progress: GameProgress | null;
  loading: boolean;
  error: Error | null;
}

function createGameSettingsStore() {
  const initialState: GameSettingsState = {
    settings: null,
    progress: null,
    loading: false,
    error: null
  };

  const { subscribe, set, update } = writable<GameSettingsState>(initialState);

  let currentUserId: string | undefined;

  // Subscribe to auth changes to load/save settings
  user.subscribe(($user) => {
    if (!$user) {
      // Clear data when user signs out
      set(initialState);
      currentUserId = undefined;
    } else if ($user.id !== currentUserId) {
      // Load settings for new user
      currentUserId = $user.id;
      loadAllData($user.id);
    }
  });

  async function loadAllData(userId: string) {
    try {
      update(state => ({ ...state, loading: true, error: null }));
      
      const [settings, progress] = await Promise.all([
        gameSettingsService.getSettings(userId),
        gameSettingsService.getGameProgress(userId)
      ]);
      
      update(state => ({
        ...state,
        settings,
        progress,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to load game settings:', error);
      update(state => ({
        ...state,
        error: error instanceof Error ? error : new Error('Failed to load game settings'),
        loading: false
      }));
    }
  }

  async function updateSetting<T extends keyof GameSettings>(
    section: T,
    key: keyof GameSettings[T],
    value: GameSettings[T][keyof GameSettings[T]]
  ): Promise<boolean> {
    if (!currentUserId) return false;
    
    try {
      update(state => ({ ...state, loading: true, error: null }));
      
      const settings = await gameSettingsService.updateSetting(
        section,
        key,
        value,
        currentUserId
      );
      
      update(state => ({
        ...state,
        settings,
        loading: false
      }));
      
      return true;
    } catch (error) {
      console.error(`Failed to update setting ${String(section)}.${String(key)}:`, error);
      update(state => ({
        ...state,
        error: error instanceof Error ? error : new Error('Failed to update setting'),
        loading: false
      }));
      return false;
    }
  }

  async function updateProgress<T extends keyof GameProgress>(
    key: T,
    value: GameProgress[T]
  ): Promise<boolean> {
    if (!currentUserId) return false;
    
    try {
      update(state => ({ ...state, loading: true, error: null }));
      
      const progress = await gameSettingsService.updateGameProgress(
        key,
        value,
        currentUserId
      );
      
      update(state => ({
        ...state,
        progress,
        loading: false
      }));
      
      return true;
    } catch (error) {
      console.error(`Failed to update progress ${String(key)}:`, error);
      update(state => ({
        ...state,
        error: error instanceof Error ? error : new Error('Failed to update progress'),
        loading: false
      }));
      return false;
    }
  }

  async function incrementStatistic(
    statKey: keyof GameProgress['statistics'],
    amount: number = 1
  ): Promise<boolean> {
    if (!currentUserId) return false;
    
    try {
      update(state => ({ ...state, loading: true, error: null }));
      
      const currentState = await gameSettingsService.getGameProgress(currentUserId);
      const currentValue = currentState.statistics[statKey] as number;
      
      const progress = await gameSettingsService.updateGameProgress(
        'statistics',
        {
          ...currentState.statistics,
          [statKey]: currentValue + amount
        } as GameProgress['statistics'],
        currentUserId
      );
      
      update(state => ({
        ...state,
        progress,
        loading: false
      }));
      
      return true;
    } catch (error) {
      console.error(`Failed to increment statistic ${statKey}:`, error);
      update(state => ({
        ...state,
        error: error instanceof Error ? error : new Error('Failed to update statistic'),
        loading: false
      }));
      return false;
    }
  }

  async function unlockAchievement(achievementId: string): Promise<boolean> {
    if (!currentUserId) return false;
    
    try {
      update(state => ({ ...state, loading: true, error: null }));
      
      const currentState = await gameSettingsService.getGameProgress(currentUserId);
      
      // Check if achievement is already unlocked
      if (currentState.achievementsUnlocked.includes(achievementId)) {
        update(state => ({ ...state, loading: false }));
        return true;
      }
      
      const progress = await gameSettingsService.updateGameProgress(
        'achievementsUnlocked',
        [...currentState.achievementsUnlocked, achievementId],
        currentUserId
      );
      
      update(state => ({
        ...state,
        progress,
        loading: false
      }));
      
      // You might want to trigger a notification here
      
      return true;
    } catch (error) {
      console.error(`Failed to unlock achievement ${achievementId}:`, error);
      update(state => ({
        ...state,
        error: error instanceof Error ? error : new Error('Failed to unlock achievement'),
        loading: false
      }));
      return false;
    }
  }

  function clearError() {
    update(state => ({ ...state, error: null }));
  }

  return {
    subscribe,
    updateSetting,
    updateProgress,
    incrementStatistic,
    unlockAchievement,
    clearError,
    refresh: (userId: string) => loadAllData(userId)
  };
}

export const gameSettingsStore = createGameSettingsStore();
