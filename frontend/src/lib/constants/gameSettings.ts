// Default game settings that will be used when a user first plays
export const DEFAULT_GAME_SETTINGS = {
  sound: {
    enabled: true,
    volume: 0.8,
    musicEnabled: true,
    musicVolume: 0.6,
    soundEffectsEnabled: true,
    soundEffectsVolume: 0.8,
    voiceEnabled: true,
    voiceVolume: 0.7
  },
  graphics: {
    quality: 'high', // 'low' | 'medium' | 'high'
    animations: true,
    particleEffects: true,
    backgroundEffects: true
  },
  gameplay: {
    autoSpin: false,
    autoSpinCount: 10,
    quickSpin: false,
    turboMode: false,
    spaceToSpin: true,
    showWinCelebration: true,
    showGameHistory: true
  },
  notifications: {
    bonusOffers: true,
    jackpotWins: true,
    freeSpins: true,
    sound: true,
    push: true,
    email: false
  },
  accessibility: {
    colorBlindMode: false,
    highContrast: false,
    reducedMotion: false,
    largerText: false
  },
  privacy: {
    showInLeaderboards: true,
    allowFriendRequests: true,
    showOnlineStatus: true
  }
} as const;

// Type definitions for game settings
export type SoundSettings = typeof DEFAULT_GAME_SETTINGS.sound;
export type GraphicsSettings = typeof DEFAULT_GAME_SETTINGS.graphics;
export type GameplaySettings = typeof DEFAULT_GAME_SETTINGS.gameplay;
export type NotificationSettings = typeof DEFAULT_GAME_SETTINGS.notifications;
export type AccessibilitySettings = typeof DEFAULT_GAME_SETTINGS.accessibility;
export type PrivacySettings = typeof DEFAULT_GAME_SETTINGS.privacy;

export interface GameSettings {
  sound: SoundSettings;
  graphics: GraphicsSettings;
  gameplay: GameplaySettings;
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
  privacy: PrivacySettings;
  lastUpdated?: number;
}

// Key used to store game settings in the vault
export const GAME_SETTINGS_KEY = 'game_settings';

// Key used to store game progress in the vault
export const GAME_PROGRESS_KEY = 'game_progress';

// Default game progress
export const DEFAULT_GAME_PROGRESS = {
  lastPlayedGame: null as string | null,
  favoriteGames: [] as string[],
  achievementsUnlocked: [] as string[],
  totalWins: 0,
  totalSpins: 0,
  totalWagered: 0,
  lastPlayedAt: null as string | null,
  unlockedThemes: ['default'] as string[],
  unlockedAvatars: ['default'] as string[],
  statistics: {
    dailyWins: 0,
    weeklyWins: 0,
    monthlyWins: 0,
    highestWin: 0,
    winStreak: 0,
    bestWinStreak: 0
  }
};

export type GameProgress = typeof DEFAULT_GAME_PROGRESS;
