-- Add leaderboards and achievements system

-- Create achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  achievement_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('spins', 'wins', 'wagering', 'streaks', 'special')),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('total', 'single', 'streak', 'frequency')),
  requirement_value DECIMAL(15,2) NOT NULL,
  reward_type TEXT CHECK (reward_type IN ('badge', 'bonus', 'multiplier')),
  reward_value DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_value DECIMAL(15,2) DEFAULT 0,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, achievement_id)
);

-- Create leaderboards table
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leaderboard_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('total_wagered', 'total_won', 'biggest_win', 'total_spins', 'win_streak', 'rtp')),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all_time')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard_entries table
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leaderboard_id UUID REFERENCES leaderboards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  score DECIMAL(15,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(leaderboard_id, user_id, period_start)
);

-- Create user_streaks table for tracking win/loss streaks
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('win', 'loss')),
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_play_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id, streak_type)
);

-- Insert default achievements
INSERT INTO achievements (achievement_id, name, description, icon, category, requirement_type, requirement_value) VALUES
-- Spin achievements
('first_spin', 'First Spin', 'Complete your first spin', '🎰', 'spins', 'total', 1),
('spin_master', 'Spin Master', 'Complete 1,000 spins', '🏆', 'spins', 'total', 1000),
('spin_legend', 'Spin Legend', 'Complete 10,000 spins', '👑', 'spins', 'total', 10000),

-- Win achievements
('first_win', 'First Win', 'Get your first win', '🎉', 'wins', 'total', 1),
('big_winner', 'Big Winner', 'Win over $100 in a single spin', '💰', 'wins', 'single', 100),
('jackpot_hunter', 'Jackpot Hunter', 'Win over $1,000 in a single spin', '💎', 'wins', 'single', 1000),

-- Wagering achievements
('high_roller', 'High Roller', 'Wager $10,000 total', '🎲', 'wagering', 'total', 10000),
('whale', 'Whale', 'Wager $100,000 total', '🐋', 'wagering', 'total', 100000),

-- Streak achievements
('lucky_streak', 'Lucky Streak', 'Win 5 spins in a row', '🍀', 'streaks', 'streak', 5),
('hot_hand', 'Hot Hand', 'Win 10 spins in a row', '🔥', 'streaks', 'streak', 10),
('unstoppable', 'Unstoppable', 'Win 20 spins in a row', '⚡', 'streaks', 'streak', 20),

-- Special achievements
('dragon_slayer', 'Dragon Slayer', 'Play Mythical Dragons 100 times', '🐉', 'special', 'total', 100),
('phoenix_rider', 'Phoenix Rider', 'Play Phoenix Rising 100 times', '🔥', 'special', 'total', 100);

-- Insert default leaderboards
INSERT INTO leaderboards (leaderboard_id, name, description, metric_type, period_type) VALUES
('daily_wagered', 'Daily High Rollers', 'Highest wagered amount today', 'total_wagered', 'daily'),
('weekly_winners', 'Weekly Big Winners', 'Highest total wins this week', 'total_won', 'weekly'),
('monthly_spins', 'Monthly Spin Champions', 'Most spins completed this month', 'total_spins', 'monthly'),
('all_time_biggest', 'All-Time Biggest Wins', 'Largest single win ever', 'biggest_win', 'all_time');

-- Create indexes for performance
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_leaderboard_entries_leaderboard_id ON leaderboard_entries(leaderboard_id);
CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries(rank);
CREATE INDEX idx_user_streaks_user_game ON user_streaks(user_id, game_id);

-- Function to update user streaks
CREATE OR REPLACE FUNCTION update_user_streaks()
RETURNS TRIGGER AS $$
BEGIN
  -- Update win streak
  IF NEW.win_amount > 0 THEN
    INSERT INTO user_streaks (user_id, game_id, streak_type, current_streak, best_streak)
    VALUES (NEW.user_id, NEW.game_id, 'win', 1, 1)
    ON CONFLICT (user_id, game_id, streak_type)
    DO UPDATE SET
      current_streak = user_streaks.current_streak + 1,
      best_streak = GREATEST(user_streaks.best_streak, user_streaks.current_streak + 1),
      last_play_at = NOW(),
      updated_at = NOW();
    
    -- Reset loss streak
    INSERT INTO user_streaks (user_id, game_id, streak_type, current_streak, best_streak)
    VALUES (NEW.user_id, NEW.game_id, 'loss', 0, 0)
    ON CONFLICT (user_id, game_id, streak_type)
    DO UPDATE SET
      current_streak = 0,
      last_play_at = NOW(),
      updated_at = NOW();
  ELSE
    -- Update loss streak
    INSERT INTO user_streaks (user_id, game_id, streak_type, current_streak, best_streak)
    VALUES (NEW.user_id, NEW.game_id, 'loss', 1, 1)
    ON CONFLICT (user_id, game_id, streak_type)
    DO UPDATE SET
      current_streak = user_streaks.current_streak + 1,
      best_streak = GREATEST(user_streaks.best_streak, user_streaks.current_streak + 1),
      last_play_at = NOW(),
      updated_at = NOW();
    
    -- Reset win streak
    INSERT INTO user_streaks (user_id, game_id, streak_type, current_streak, best_streak)
    VALUES (NEW.user_id, NEW.game_id, 'win', 0, 0)
    ON CONFLICT (user_id, game_id, streak_type)
    DO UPDATE SET
      current_streak = 0,
      last_play_at = NOW(),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  achievement_record RECORD;
  user_progress DECIMAL;
BEGIN
  -- Check all active achievements
  FOR achievement_record IN 
    SELECT * FROM achievements WHERE is_active = true
  LOOP
    -- Calculate user progress based on achievement type
    CASE achievement_record.requirement_type
      WHEN 'total' THEN
        CASE achievement_record.category
          WHEN 'spins' THEN
            SELECT COUNT(*) INTO user_progress
            FROM game_plays WHERE user_id = NEW.user_id;
          WHEN 'wins' THEN
            SELECT COUNT(*) INTO user_progress
            FROM game_plays WHERE user_id = NEW.user_id AND win_amount > 0;
          WHEN 'wagering' THEN
            SELECT COALESCE(SUM(bet_amount), 0) INTO user_progress
            FROM game_plays WHERE user_id = NEW.user_id;
          WHEN 'special' THEN
            -- Game-specific achievements
            IF achievement_record.achievement_id = 'dragon_slayer' THEN
              SELECT COUNT(*) INTO user_progress
              FROM game_plays gp
              JOIN games g ON gp.game_id = g.id
              WHERE gp.user_id = NEW.user_id AND g.game_id = 'mythical_dragons';
            ELSIF achievement_record.achievement_id = 'phoenix_rider' THEN
              SELECT COUNT(*) INTO user_progress
              FROM game_plays gp
              JOIN games g ON gp.game_id = g.id
              WHERE gp.user_id = NEW.user_id AND g.game_id = 'phoenix_rising';
            END IF;
        END CASE;
      WHEN 'single' THEN
        CASE achievement_record.category
          WHEN 'wins' THEN
            user_progress := NEW.win_amount;
        END CASE;
      WHEN 'streak' THEN
        SELECT COALESCE(MAX(current_streak), 0) INTO user_progress
        FROM user_streaks 
        WHERE user_id = NEW.user_id AND streak_type = 'win';
    END CASE;
    
    -- Check if achievement should be unlocked
    IF user_progress >= achievement_record.requirement_value THEN
      INSERT INTO user_achievements (user_id, achievement_id, progress_value)
      VALUES (NEW.user_id, achievement_record.id, user_progress)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_user_streaks
  AFTER INSERT ON game_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streaks();

CREATE TRIGGER trigger_check_achievements
  AFTER INSERT ON game_plays
  FOR EACH ROW
  EXECUTE FUNCTION check_achievements();

-- Enable RLS on new tables
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Achievements are public" ON achievements FOR SELECT USING (true);

CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON user_achievements FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Leaderboards are public" ON leaderboards FOR SELECT USING (true);

CREATE POLICY "Leaderboard entries are public" ON leaderboard_entries FOR SELECT USING (true);

CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
