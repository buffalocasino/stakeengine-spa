-- Create users table with simplified structure
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 1000.00,
  gold_coins DECIMAL(15,2) DEFAULT 1000.00,
  buffalo_coins DECIMAL(15,2) DEFAULT 50.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  rtp DECIMAL(5,4) NOT NULL,
  house_edge DECIMAL(5,4) NOT NULL,
  max_bet DECIMAL(15,2) NOT NULL,
  theme VARCHAR(100),
  volatility VARCHAR(20) CHECK (volatility IN ('low', 'medium', 'high')),
  paylines INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  session_end TIMESTAMP WITH TIME ZONE,
  total_spins INTEGER DEFAULT 0,
  total_wagered DECIMAL(15,2) DEFAULT 0.00,
  total_won DECIMAL(15,2) DEFAULT 0.00,
  net_result DECIMAL(15,2) DEFAULT 0.00,
  starting_balance DECIMAL(15,2) NOT NULL,
  ending_balance DECIMAL(15,2),
  currency_type VARCHAR(10) DEFAULT 'gold',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create game_plays table
CREATE TABLE IF NOT EXISTS game_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  bet_amount DECIMAL(15,2) NOT NULL,
  win_amount DECIMAL(15,2) DEFAULT 0.00,
  net_result DECIMAL(15,2) NOT NULL,
  currency_type VARCHAR(10) DEFAULT 'gold',
  currency_bet_amount DECIMAL(15,2),
  currency_win_amount DECIMAL(15,2),
  game_board JSONB,
  winning_lines JSONB,
  multipliers JSONB,
  bonus_features JSONB,
  spin_duration_ms INTEGER,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_user_id ON game_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_session_id ON game_plays(session_id);

-- Insert some sample games
INSERT INTO games (game_id, name, provider, rtp, house_edge, max_bet, theme, volatility, paylines) VALUES
('mythical-dragons', 'Mythical Dragons', 'BuffaloCasino', 0.9600, 0.0400, 1000.00, 'Fantasy', 'medium', 25),
('buffalo-gold', 'Buffalo Gold Rush', 'BuffaloCasino', 0.9650, 0.0350, 2000.00, 'Western', 'high', 30),
('lucky-sevens', 'Lucky Sevens', 'BuffaloCasino', 0.9550, 0.0450, 500.00, 'Classic', 'low', 5)
ON CONFLICT (game_id) DO NOTHING;
