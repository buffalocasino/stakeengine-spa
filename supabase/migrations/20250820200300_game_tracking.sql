-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  balance DECIMAL(10,2) DEFAULT 1000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  rtp DECIMAL(5,4) NOT NULL, -- e.g., 0.9600 for 96%
  house_edge DECIMAL(5,4) NOT NULL,
  max_bet DECIMAL(10,2) NOT NULL,
  theme TEXT,
  volatility TEXT CHECK (volatility IN ('low', 'medium', 'high')),
  paylines INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_sessions table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  total_spins INTEGER DEFAULT 0,
  total_wagered DECIMAL(12,2) DEFAULT 0.00,
  total_won DECIMAL(12,2) DEFAULT 0.00,
  net_result DECIMAL(12,2) DEFAULT 0.00, -- total_won - total_wagered
  starting_balance DECIMAL(10,2) NOT NULL,
  ending_balance DECIMAL(10,2),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_plays table (individual spins/plays)
CREATE TABLE game_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  bet_amount DECIMAL(10,2) NOT NULL,
  win_amount DECIMAL(10,2) DEFAULT 0.00,
  net_result DECIMAL(10,2) NOT NULL, -- win_amount - bet_amount
  game_board JSONB, -- Store the game board state
  winning_lines JSONB, -- Store winning paylines/combinations
  multipliers JSONB, -- Store any multipliers applied
  bonus_features JSONB, -- Store bonus feature data
  spin_duration_ms INTEGER, -- How long the spin took
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wagering_statistics table for aggregated data
CREATE TABLE wagering_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_spins INTEGER DEFAULT 0,
  total_wagered DECIMAL(12,2) DEFAULT 0.00,
  total_won DECIMAL(12,2) DEFAULT 0.00,
  net_result DECIMAL(12,2) DEFAULT 0.00,
  biggest_win DECIMAL(10,2) DEFAULT 0.00,
  longest_session_minutes INTEGER DEFAULT 0,
  avg_bet_amount DECIMAL(10,2) DEFAULT 0.00,
  hit_frequency DECIMAL(5,4) DEFAULT 0.0000, -- Percentage of winning spins
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_game_plays_user_id ON game_plays(user_id);
CREATE INDEX idx_game_plays_game_id ON game_plays(game_id);
CREATE INDEX idx_game_plays_session_id ON game_plays(session_id);
CREATE INDEX idx_game_plays_played_at ON game_plays(played_at);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_game_sessions_session_start ON game_sessions(session_start);
CREATE INDEX idx_wagering_statistics_user_game_date ON wagering_statistics(user_id, game_id, date);

-- Insert default games
INSERT INTO games (game_id, name, provider, rtp, house_edge, max_bet, theme, volatility, paylines) VALUES
('mythical_dragons', 'Mythical Dragons', 'BuffaloCasino', 0.9600, 0.0400, 500.00, 'dragons', 'high', 9),
('phoenix_rising', 'Phoenix Rising', 'BuffaloCasino', 0.9700, 0.0300, 250.00, 'phoenix', 'medium', 5),
('treasure_quest', 'Treasure Quest', 'BuffaloCasino', 0.9550, 0.0450, 1000.00, 'adventure', 'high', 25);

-- Create function to update wagering statistics
CREATE OR REPLACE FUNCTION update_wagering_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wagering_statistics (
    user_id, game_id, date, total_spins, total_wagered, total_won, net_result, biggest_win
  )
  VALUES (
    NEW.user_id, 
    NEW.game_id, 
    DATE(NEW.played_at),
    1,
    NEW.bet_amount,
    NEW.win_amount,
    NEW.net_result,
    NEW.win_amount
  )
  ON CONFLICT (user_id, game_id, date) 
  DO UPDATE SET
    total_spins = wagering_statistics.total_spins + 1,
    total_wagered = wagering_statistics.total_wagered + NEW.bet_amount,
    total_won = wagering_statistics.total_won + NEW.win_amount,
    net_result = wagering_statistics.net_result + NEW.net_result,
    biggest_win = GREATEST(wagering_statistics.biggest_win, NEW.win_amount),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update statistics
CREATE TRIGGER trigger_update_wagering_statistics
  AFTER INSERT ON game_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_wagering_statistics();

-- Create function to calculate hit frequency
CREATE OR REPLACE FUNCTION calculate_hit_frequency(p_user_id UUID, p_game_id UUID, p_date DATE)
RETURNS DECIMAL AS $$
DECLARE
  total_spins INTEGER;
  winning_spins INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_spins
  FROM game_plays 
  WHERE user_id = p_user_id AND game_id = p_game_id AND DATE(played_at) = p_date;
  
  SELECT COUNT(*) INTO winning_spins
  FROM game_plays 
  WHERE user_id = p_user_id AND game_id = p_game_id AND DATE(played_at) = p_date AND win_amount > 0;
  
  IF total_spins = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((winning_spins::DECIMAL / total_spins::DECIMAL), 4);
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE wagering_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only see their own data)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON game_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own plays" ON game_plays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plays" ON game_plays FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own statistics" ON wagering_statistics FOR SELECT USING (auth.uid() = user_id);

-- Games table is public (read-only for authenticated users)
CREATE POLICY "Authenticated users can view games" ON games FOR SELECT USING (auth.role() = 'authenticated');
