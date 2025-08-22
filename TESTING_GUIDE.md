# StakeEngine SPA - Complete Testing Guide

This guide covers testing all components of the StakeEngine SPA system.

## 🧪 System Testing Checklist

### 1. Backend Math Server Testing

#### Start the Math Server
```bash
cd /home/trevo/apps/stakeengine-spa
./start-math-server.sh
```

#### Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Get default config
curl http://localhost:8000/api/config/default

# Test spin endpoint
curl -X POST http://localhost:8000/api/game/spin \
  -H "Content-Type: application/json" \
  -d '{
    "bet_amount": 1.0,
    "game_config": {
      "game_id": "test_game",
      "provider_name": "BuffaloCasino",
      "game_name": "Test Game",
      "rtp": 0.96,
      "house_edge": 0.04,
      "max_bet": 100
    }
  }'
```

### 2. Frontend Development Server Testing

#### Start Frontend Server
```bash
cd frontend
pnpm dev
```

#### Verify Routes
- ✅ http://localhost:5173 - Main page
- ✅ http://localhost:5173/games - Games hub
- ✅ http://localhost:5173/games/mythical-dragons - Dragon game
- ✅ http://localhost:5173/games/phoenix-rising - Phoenix game

### 3. API Integration Testing

#### Connection Status
- [ ] Green indicator when math server is running
- [ ] Red indicator when math server is stopped
- [ ] Manual refresh button works
- [ ] Auto-reconnection after server restart

#### Game Functionality
- [ ] Spin button disabled when API disconnected
- [ ] Error messages display properly
- [ ] Successful spins update balance
- [ ] Game board renders correctly

### 4. Supabase Integration Testing

#### Database Setup
```sql
-- Run in Supabase SQL editor
SELECT * FROM games;
SELECT * FROM game_sessions LIMIT 5;
SELECT * FROM game_plays LIMIT 5;
SELECT * FROM wagering_statistics LIMIT 5;
```

#### Game Tracking
- [ ] Session starts when game loads
- [ ] Each spin recorded in database
- [ ] Statistics update in real-time
- [ ] Session ends when leaving game

### 5. Game-Specific Testing

#### Mythical Dragons
- [ ] Game loads with dragon theme
- [ ] Symbols display correctly (🐉🔥💎👑⚔️🏰🌟)
- [ ] Winning combinations calculate properly
- [ ] Auto-play functions work
- [ ] Statistics component shows data

#### Phoenix Rising
- [ ] Game loads with phoenix theme
- [ ] Symbols display correctly (🔥🦅💎👑⚡🌟🎯)
- [ ] Different RTP (97%) configured
- [ ] Lower max bet (250) enforced

## 🔧 Troubleshooting Tests

### Math Server Issues
```bash
# Check if server is running
ps aux | grep uvicorn

# Check port availability
netstat -tlnp | grep :8000

# View server logs
tail -f /path/to/server/logs

# Restart server
pkill -f uvicorn
./start-math-server.sh
```

### Frontend Issues
```bash
# Check Vite dev server
ps aux | grep vite

# Clear cache and restart
rm -rf node_modules/.vite
pnpm dev

# Check for TypeScript errors
pnpm run check
```

### Database Issues
```sql
-- Check table structure
\d+ game_plays

-- Verify triggers
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_wagering_statistics';

-- Test RLS policies
SET ROLE authenticated;
SELECT * FROM game_plays WHERE user_id = 'test-user-id';
```

## 📊 Performance Testing

### Load Testing Math API
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test 100 requests, 10 concurrent
ab -n 100 -c 10 -H "Content-Type: application/json" \
   -p spin_request.json \
   http://localhost:8000/api/game/spin
```

### Frontend Performance
- [ ] Page load time < 2 seconds
- [ ] Game interactions < 100ms response
- [ ] Memory usage stable during long sessions
- [ ] No memory leaks in auto-play mode

## 🔒 Security Testing

### API Security
- [ ] CORS properly configured
- [ ] No sensitive data in responses
- [ ] Rate limiting (if implemented)
- [ ] Input validation working

### Database Security
- [ ] RLS policies prevent data access
- [ ] SQL injection protection
- [ ] User data isolation
- [ ] Audit logging enabled

## 🎮 User Experience Testing

### Game Flow
1. [ ] User can navigate to games easily
2. [ ] Game rules are clear
3. [ ] Betting controls are intuitive
4. [ ] Win celebrations are satisfying
5. [ ] Statistics are informative

### Mobile Responsiveness
- [ ] Games work on mobile devices
- [ ] Touch controls responsive
- [ ] Layout adapts to screen size
- [ ] Performance acceptable on mobile

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Focus indicators visible

## 📈 Analytics Testing

### Game Statistics
- [ ] Session stats update in real-time
- [ ] Historical data displays correctly
- [ ] RTP calculations accurate
- [ ] Hit frequency tracking works

### Data Accuracy
```sql
-- Verify calculation accuracy
SELECT 
  user_id,
  SUM(bet_amount) as total_bet,
  SUM(win_amount) as total_win,
  (SUM(win_amount) / SUM(bet_amount)) * 100 as calculated_rtp
FROM game_plays 
WHERE user_id = 'test-user-id'
GROUP BY user_id;
```

## 🚀 Deployment Testing

### Production Build
```bash
cd frontend
pnpm build
pnpm preview
```

### Environment Variables
- [ ] All required env vars set
- [ ] Supabase URLs correct
- [ ] API endpoints configured
- [ ] Build process completes

### Docker Testing (Optional)
```dockerfile
# Test containerization
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📝 Test Reports

### Automated Testing
```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

### Manual Test Results
Create a checklist for each release:

```markdown
## Release Testing Checklist v1.0.0

### Core Functionality
- [x] Math server starts successfully
- [x] Frontend builds without errors
- [x] Games load and play correctly
- [x] Database tracking works
- [x] Statistics display properly

### Browser Compatibility
- [x] Chrome 120+
- [x] Firefox 115+
- [x] Safari 16+
- [x] Edge 120+

### Performance Benchmarks
- [x] API response time < 100ms
- [x] Page load time < 2s
- [x] Memory usage < 100MB
- [x] No console errors

### Security Checks
- [x] RLS policies active
- [x] CORS configured
- [x] No data leaks
- [x] Input validation working
```

## 🔄 Continuous Testing

### Automated Monitoring
```javascript
// Health check script
const checkHealth = async () => {
  const response = await fetch('http://localhost:8000/health');
  const data = await response.json();
  console.log('API Health:', data.status);
};

setInterval(checkHealth, 30000); // Check every 30 seconds
```

### Error Tracking
```javascript
// Error logging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to monitoring service
});
```

This comprehensive testing guide ensures all components work correctly together and provides a solid foundation for ongoing development and deployment.
