# StakeEngine SPA - Casino Game Platform

A modern casino game platform built with SvelteKit and FastAPI, featuring real-time math engine integration and beautiful UI components.

## 🎰 Features

- **Modern SPA Architecture**: Built with SvelteKit and TypeScript
- **Real-time Math Engine**: FastAPI backend with slot game calculations
- **Beautiful UI**: Flowbite Svelte components with dark theme
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **API Integration**: Centralized connection monitoring and error handling
- **Game Templates**: Easy-to-extend game architecture

## 🚀 Quick Start

### 1. Start the Math Server
```bash
# Make the script executable (first time only)
chmod +x start-math-server.sh

# Start the math server
./start-math-server.sh
```

### 2. Start the Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Math API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🎮 Available Games

### Mythical Dragons 🐉
- **RTP**: 96%
- **Volatility**: High
- **Max Bet**: $500
- **Paylines**: 9
- **Theme**: Dragon-themed symbols with fire effects

### Phoenix Rising 🔥
- **RTP**: 97%
- **Volatility**: Medium
- **Max Bet**: $250
- **Paylines**: 5
- **Theme**: Phoenix-themed symbols with flame effects

## 🏗️ Architecture

### Frontend (`/frontend`)
```
src/
├── lib/
│   ├── api/
│   │   └── mathApi.ts          # API client for math server
│   ├── components/
│   │   ├── ApiStatus.svelte    # Connection status indicator
│   │   └── Sidebar.svelte      # Navigation sidebar
│   └── stores/
│       ├── api.ts              # Centralized API connection state
│       ├── auth.ts             # Authentication state
│       └── sidebar.ts          # Sidebar state
├── routes/
│   ├── games/
│   │   ├── +page.svelte        # Games hub with testing interface
│   │   ├── mythical-dragons/   # Dragon-themed slot game
│   │   └── phoenix-rising/     # Phoenix-themed slot game
│   └── +layout.svelte          # Main layout with API monitoring
└── app.css                     # Global styles
```

### Backend (`/math`)
```
├── api_server.py               # FastAPI server with game logic
├── requirements.txt            # Python dependencies
├── venv/                       # Virtual environment
└── start-math-server.sh        # Server startup script
```

## 🔧 API Integration

### Centralized Connection Management

All games use the centralized API connection system:

```typescript
import { apiConnection } from '$lib/stores/api';
import ApiStatus from '$lib/components/ApiStatus.svelte';

// Reactive connection state
$: apiConnected = $apiConnection.connected;

// Disable actions when disconnected
disabled={loading || !apiConnected}
```

### API Endpoints

- `GET /health` - Health check
- `GET /api/config/default` - Default game configuration
- `POST /api/game/spin` - Execute game spin
- `POST /api/game/simulate` - Run game simulation
- `POST /api/config/upload` - Upload game configuration

## 🎨 Creating New Games

### 1. Create Game Directory
```bash
mkdir frontend/src/routes/games/your-game-name
```

### 2. Copy Template
Use `phoenix-rising/+page.svelte` as a template and customize:

- **Game Config**: Update `gameConfig` object
- **Symbols**: Define game-specific symbols
- **Theme**: Update colors and styling
- **Paytable**: Configure symbol multipliers

### 3. Add to Games Hub
Update `frontend/src/routes/games/+page.svelte` to include your game.

### 4. API Integration
All games automatically use the centralized API system:
- Connection monitoring
- Error handling
- Status indicators
- Auto-retry logic

## 🛠️ Development

### Math Server Development
```bash
cd math
./venv/bin/uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Development
```bash
cd frontend
pnpm dev
```

### Adding Dependencies

**Frontend**:
```bash
cd frontend
pnpm add package-name
```

**Backend**:
```bash
cd math
./venv/bin/pip install package-name
./venv/bin/pip freeze > requirements.txt
```

## 🔍 Monitoring & Debugging

### API Status
- Green indicator: API connected and healthy
- Red indicator: API disconnected or error
- Manual refresh button available
- Auto-checks every 30 seconds

### Logs
- **Frontend**: Browser console
- **Backend**: Terminal output with uvicorn
- **API Requests**: Network tab in browser dev tools

## 🚀 Deployment

### Production Build
```bash
cd frontend
pnpm build
```

### Environment Variables
Create `.env` files for different environments:
- `VITE_API_URL`: Math server URL
- `VITE_APP_NAME`: Application name

## 📝 Game Configuration

Games use standardized configuration objects:

```typescript
interface GameConfig {
  game_id: string;
  provider_name: string;
  game_name: string;
  rtp: number;           // Return to Player (0.96 = 96%)
  house_edge: number;    // House edge (0.04 = 4%)
  max_bet: number;       // Maximum bet amount
  paylines?: Record<string, number[]>;
  symbols?: Record<string, any>;
}
```

## 🎯 Features in Development

- [ ] User authentication system
- [ ] Game history and statistics
- [ ] Progressive jackpots
- [ ] Tournament system
- [ ] Social features
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
