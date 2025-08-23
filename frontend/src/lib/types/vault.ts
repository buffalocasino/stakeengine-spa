// Types for user vault data
export interface UserVaultData {
  [key: string]: any;
}

// Type for user settings
export interface UserSettings {
  sound: {
    enabled: boolean;
    volume: number;
    musicEnabled?: boolean;
    musicVolume?: number;
    soundEffectsEnabled?: boolean;
    soundEffectsVolume?: number;
    voiceEnabled?: boolean;
    voiceVolume?: number;
  };
  graphics: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    animations: boolean;
    particleEffects?: boolean;
    backgroundEffects?: boolean;
  };
  gameplay: {
    autoSpin: boolean;
    autoSpinCount?: number;
    quickSpin: boolean;
    turboMode?: boolean;
    spaceToSpin?: boolean;
    showWinCelebration?: boolean;
    showGameHistory?: boolean;
  };
  notifications: {
    enabled: boolean;
    bonusOffers?: boolean;
    jackpotWins?: boolean;
    freeSpins?: boolean;
    sound?: boolean;
    push?: boolean;
    email?: boolean;
  };
  accessibility: {
    colorBlindMode?: boolean;
    highContrast?: boolean;
    reducedMotion?: boolean;
    largerText?: boolean;
  };
  privacy: {
    showInLeaderboards: boolean;
    allowFriendRequests?: boolean;
    showOnlineStatus?: boolean;
  };
}

// Type for user game progress
export interface UserGameProgress {
  lastPlayedGame: string | null;
  favoriteGames: string[];
  achievementsUnlocked: string[];
  totalWins: number;
  totalSpins: number;
  totalWagered: number;
  lastPlayedAt: string | null;
  unlockedThemes: string[];
  unlockedAvatars: string[];
  statistics: {
    dailyWins: number;
    weeklyWins: number;
    monthlyWins: number;
    highestWin: number;
    winStreak: number;
    bestWinStreak: number;
  };
}

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
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
    quality: 'high',
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
    enabled: true,
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
};

// Default game progress
export const DEFAULT_GAME_PROGRESS: UserGameProgress = {
  lastPlayedGame: null,
  favoriteGames: [],
  achievementsUnlocked: [],
  totalWins: 0,
  totalSpins: 0,
  totalWagered: 0,
  lastPlayedAt: null,
  unlockedThemes: ['default'],
  unlockedAvatars: ['default'],
  statistics: {
    dailyWins: 0,
    weeklyWins: 0,
    monthlyWins: 0,
    highestWin: 0,
    winStreak: 0,
    bestWinStreak: 0
  }
};

// Vault keys
export const VAULT_KEYS = {
  SETTINGS: 'user_settings',
  PROGRESS: 'game_progress',
  PREFERENCES: 'user_preferences'
} as const;
