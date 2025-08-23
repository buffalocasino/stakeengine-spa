import { userVault } from './userVault';
import { GAME_SETTINGS_KEY, GAME_PROGRESS_KEY, DEFAULT_GAME_SETTINGS, DEFAULT_GAME_PROGRESS } from '$lib/constants/gameSettings';
import type { GameSettings, GameProgress } from '$lib/constants/gameSettings';

export class GameSettingsService {
  private static instance: GameSettingsService;
  private settingsCache: GameSettings | null = null;
  private progressCache: GameProgress | null = null;

  private constructor() {}

  public static getInstance(): GameSettingsService {
    if (!GameSettingsService.instance) {
      GameSettingsService.instance = new GameSettingsService();
    }
    return GameSettingsService.instance;
  }

  // Settings methods
  public async getSettings(userId: string): Promise<GameSettings> {
    if (this.settingsCache) {
      return this.settingsCache;
    }

    const settings = await userVault.getData<GameSettings>(GAME_SETTINGS_KEY, userId);
    
    if (!settings) {
      // No remote settings: fall back to defaults locally and attempt best-effort persist
      this.settingsCache = { ...DEFAULT_GAME_SETTINGS, lastUpdated: Date.now() };
      // Fire-and-forget persist; do not recurse into getSettings
      userVault.setData(GAME_SETTINGS_KEY, this.settingsCache, userId).catch(() => {});
      return this.settingsCache;
    }

    // Merge with defaults in case new settings were added
    this.settingsCache = this.mergeWithDefaults(settings);
    return this.settingsCache;
  }

  public async saveSettings(settings: Partial<GameSettings>, userId: string): Promise<GameSettings> {
    // Merge with what's in cache or defaults without calling getSettings to avoid recursion
    const base = this.settingsCache ? this.settingsCache : { ...DEFAULT_GAME_SETTINGS };
    const updatedSettings: GameSettings = {
      ...base,
      ...settings,
      sound: { ...base.sound, ...(settings.sound || {}) },
      graphics: { ...base.graphics, ...(settings.graphics || {}) },
      gameplay: { ...base.gameplay, ...(settings.gameplay || {}) },
      notifications: { ...base.notifications, ...(settings.notifications || {}) },
      accessibility: { ...base.accessibility, ...(settings.accessibility || {}) },
      privacy: { ...base.privacy, ...(settings.privacy || {}) },
      lastUpdated: Date.now()
    };

    await userVault.setData(GAME_SETTINGS_KEY, updatedSettings, userId);
    this.settingsCache = updatedSettings;
    return updatedSettings;
  }

  public async updateSetting<T extends keyof GameSettings>(
    section: T,
    key: keyof GameSettings[T],
    value: GameSettings[T][keyof GameSettings[T]],
    userId: string
  ): Promise<GameSettings> {
    const currentSettings = await this.getSettings(userId);
    const updatedSettings = {
      ...currentSettings,
      [section]: {
        ...currentSettings[section],
        [key]: value
      },
      lastUpdated: Date.now()
    };

    return this.saveSettings(updatedSettings, userId);
  }

  // Game progress methods
  public async getGameProgress(userId: string): Promise<GameProgress> {
    if (this.progressCache) {
      return this.progressCache;
    }

    const progress = await userVault.getData<GameProgress>(GAME_PROGRESS_KEY, userId);
    
    if (!progress) {
      // Fall back to defaults locally and attempt best-effort persist
      this.progressCache = { ...DEFAULT_GAME_PROGRESS };
      userVault.setData(GAME_PROGRESS_KEY, this.progressCache, userId).catch(() => {});
      return this.progressCache;
    }

    // Merge with defaults in case new fields were added
    this.progressCache = this.mergeProgressWithDefaults(progress);
    return this.progressCache;
  }

  public async saveGameProgress(progress: Partial<GameProgress>, userId: string): Promise<GameProgress> {
    const base = this.progressCache ? this.progressCache : { ...DEFAULT_GAME_PROGRESS };
    const updatedProgress: GameProgress = {
      ...base,
      ...progress,
      statistics: {
        ...base.statistics,
        ...(progress.statistics || {})
      },
      unlockedThemes: progress.unlockedThemes || base.unlockedThemes,
      unlockedAvatars: progress.unlockedAvatars || base.unlockedAvatars,
      favoriteGames: progress.favoriteGames || base.favoriteGames,
      achievementsUnlocked: progress.achievementsUnlocked || base.achievementsUnlocked
    };

    await userVault.setData(GAME_PROGRESS_KEY, updatedProgress, userId);
    this.progressCache = updatedProgress;
    return updatedProgress;
  }

  public async updateGameProgress<T extends keyof GameProgress>(
    key: T,
    value: GameProgress[T],
    userId: string
  ): Promise<GameProgress> {
    const currentProgress = await this.getGameProgress(userId);
    
    // Handle nested statistics updates
    if (key === 'statistics' && typeof value === 'object') {
      const updatedProgress = {
        ...currentProgress,
        statistics: {
          ...currentProgress.statistics,
          ...(value as Partial<GameProgress['statistics']>)
        }
      };
      return this.saveGameProgress(updatedProgress, userId);
    }
    
    // Handle top-level updates
    return this.saveGameProgress({ [key]: value } as Partial<GameProgress>, userId);
  }

  // Helper methods
  private mergeWithDefaults(settings: Partial<GameSettings>): GameSettings {
    return {
      ...DEFAULT_GAME_SETTINGS,
      ...settings,
      sound: { ...DEFAULT_GAME_SETTINGS.sound, ...(settings.sound || {}) },
      graphics: { ...DEFAULT_GAME_SETTINGS.graphics, ...(settings.graphics || {}) },
      gameplay: { ...DEFAULT_GAME_SETTINGS.gameplay, ...(settings.gameplay || {}) },
      notifications: { ...DEFAULT_GAME_SETTINGS.notifications, ...(settings.notifications || {}) },
      accessibility: { ...DEFAULT_GAME_SETTINGS.accessibility, ...(settings.accessibility || {}) },
      privacy: { ...DEFAULT_GAME_SETTINGS.privacy, ...(settings.privacy || {}) },
      lastUpdated: settings.lastUpdated || Date.now()
    };
  }

  private mergeProgressWithDefaults(progress: Partial<GameProgress>): GameProgress {
    return {
      ...DEFAULT_GAME_PROGRESS,
      ...progress,
      statistics: {
        ...DEFAULT_GAME_PROGRESS.statistics,
        ...(progress.statistics || {})
      },
      unlockedThemes: progress.unlockedThemes || [...DEFAULT_GAME_PROGRESS.unlockedThemes],
      unlockedAvatars: progress.unlockedAvatars || [...DEFAULT_GAME_PROGRESS.unlockedAvatars],
      favoriteGames: progress.favoriteGames || [],
      achievementsUnlocked: progress.achievementsUnlocked || []
    };
  }

  // Clear caches (useful for testing or logging out)
  public clearCaches(): void {
    this.settingsCache = null;
    this.progressCache = null;
  }
}

export const gameSettingsService = GameSettingsService.getInstance();
