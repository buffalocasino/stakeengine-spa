# Supabase Game Tracking Setup

This guide will help you set up Supabase to track game plays and wagers in your StakeEngine SPA.

## 🚀 Quick Setup

### 1. Run the Database Migration
```bash
# Navigate to your project
cd /home/trevo/apps/stakeengine-spa

# Apply the migration (if using Supabase CLI)
supabase db push

# OR manually run the SQL in your Supabase dashboard
# Copy the contents of supabase/migrations/20250820200300_game_tracking.sql
# and run it in the SQL editor
```

### 2. Configure Environment Variables
```bash
# Copy the example environment file
cp frontend/.env.example frontend/.env.local

# Edit the file with your Supabase credentials
nano frontend/.env.local
```

Add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MATH_API_URL=http://localhost:8000
VITE_APP_NAME=StakeEngine SPA
```

### 3. Install Supabase Dependencies
```bash
cd frontend
pnpm add @supabase/supabase-js
```

## 📊 Database Schema Overview

### Core Tables

#### `users`
- Stores user profiles and balance information
- Links to authentication system

#### `games`
- Catalog of available games with configuration
- Pre-populated with Mythical Dragons, Phoenix Rising, etc.

#### `game_sessions`
- Tracks individual gaming sessions
- Records session start/end times and totals

#### `game_plays`
- Individual spin/play records
- Stores detailed game state, bets, wins, and timing

#### `wagering_statistics`
- Aggregated daily statistics per user/game
- Automatically updated via database triggers

## 🎮 How Game Tracking Works

### Automatic Session Management
```typescript
// Session starts when game component mounts
sessionId = await gameTrackingService.startGameSession(
  'mythical_dragons',
  userId,
  startingBalance
);

// Session ends when component unmounts
await gameTrackingService.endGameSession(finalBalance);
```

### Play Recording
```typescript
// Each spin is automatically tracked
await gameTrackingService.recordGamePlay(
  gameId,
  userId,
  betAmount,
  winAmount,
  gameBoard,
  winningLines,
  balanceBefore,
  balanceAfter,
  spinDuration
);
```

### Statistics Display
```svelte
<!-- Shows real-time and historical statistics -->
<GameStats gameId="mythical_dragons" />
```

## 📈 What Gets Tracked

### Per Spin
- ✅ Bet amount
- ✅ Win amount
- ✅ Net result (win - bet)
- ✅ Game board state
- ✅ Winning combinations
- ✅ Spin duration
- ✅ Balance before/after
- ✅ Timestamp

### Per Session
- ✅ Total spins
- ✅ Total wagered
- ✅ Total won
- ✅ Session duration
- ✅ Starting/ending balance
- ✅ IP address and user agent

### Daily Aggregates
- ✅ Daily totals by game
- ✅ Hit frequency
- ✅ Average bet size
- ✅ Biggest wins
- ✅ RTP calculations

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only see their own data
- Automatic policy enforcement
- Secure by default

### Data Privacy
- No sensitive information stored
- GDPR compliant structure
- User data isolation

## 📊 Analytics & Reporting

### Built-in Statistics
- Current session stats
- 7-day rolling statistics  
- Recent play history
- Daily progress tracking
- RTP visualization

### Custom Queries
```sql
-- Get user's biggest wins
SELECT * FROM game_plays 
WHERE user_id = $1 AND win_amount > 0 
ORDER BY win_amount DESC LIMIT 10;

-- Calculate monthly RTP
SELECT 
  DATE_TRUNC('month', played_at) as month,
  SUM(total_won) / SUM(total_wagered) * 100 as rtp
FROM wagering_statistics 
WHERE user_id = $1 
GROUP BY month;
```

## 🛠️ Extending the System

### Adding New Games
1. Insert game record in `games` table
2. Use existing tracking service in game component
3. Statistics automatically appear

### Custom Metrics
1. Add columns to `wagering_statistics`
2. Update trigger function
3. Modify GameStats component

### Advanced Features
- Tournament tracking
- Leaderboards
- Achievement system
- Bonus tracking
- Progressive jackpots

## 🔧 Troubleshooting

### Common Issues

**Migration fails**
- Check Supabase project permissions
- Verify SQL syntax in migration file
- Run migrations in correct order

**Tracking not working**
- Verify environment variables
- Check user authentication
- Confirm RLS policies

**Statistics not updating**
- Check trigger function
- Verify database permissions
- Look for JavaScript errors

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('supabase-debug', 'true');
```

## 📝 Example Usage

```typescript
// In your game component
import { gameTrackingService } from '$lib/stores/gameTracking';

// Start session
const sessionId = await gameTrackingService.startGameSession(
  'your_game_id',
  userId,
  balance
);

// Record play
await gameTrackingService.recordGamePlay(
  gameId, userId, betAmount, winAmount,
  gameBoard, winningLines, balanceBefore, balanceAfter
);

// Get statistics
const stats = await gameTrackingService.getUserStatistics(userId);
```

This system provides comprehensive tracking of all gaming activity while maintaining performance and security.
