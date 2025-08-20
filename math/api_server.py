from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from typing import List, Dict, Any, Optional
import json

app = FastAPI(title="StakeEngine Math API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class GameConfig(BaseModel):
    game_id: str
    provider_name: str
    game_name: str
    rtp: float
    house_edge: float
    max_bet: int
    paylines: Optional[Dict[str, List[int]]] = None
    symbols: Optional[Dict[str, Any]] = None

class SpinRequest(BaseModel):
    bet_amount: float
    game_config: GameConfig
    board: Optional[List[List[str]]] = None

class SpinResult(BaseModel):
    board: List[List[str]]
    total_win: float
    wins: List[Dict[str, Any]]
    rtp: float
    house_edge: float

class SimulationRequest(BaseModel):
    game_config: GameConfig
    num_spins: int = 1000
    bet_amount: float = 1.0

class SimulationResult(BaseModel):
    total_spins: int
    total_bet: float
    total_win: float
    actual_rtp: float
    hit_frequency: float
    max_win: float
    min_win: float

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "StakeEngine Math API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "stakeengine-math-api"}

@app.post("/api/game/spin", response_model=SpinResult)
async def spin_game(request: SpinRequest):
    """Execute a single game spin"""
    try:
        # Generate random slot machine board
        symbols = ["A", "K", "Q", "J", "10", "9", "W"]  # W = Wild
        symbol_weights = [10, 15, 20, 25, 30, 35, 5]  # Lower weight = rarer
        
        board = []
        for reel in range(5):  # 5 reels
            reel_symbols = []
            for row in range(3):  # 3 rows
                symbol = random.choices(symbols, weights=symbol_weights)[0]
                reel_symbols.append(symbol)
            board.append(reel_symbols)
        
        # Simple win calculation - check for matching symbols on paylines
        wins = []
        total_win = 0.0
        
        # Define simple paylines (horizontal lines)
        paylines = [
            [0, 0, 0, 0, 0],  # Top row
            [1, 1, 1, 1, 1],  # Middle row  
            [2, 2, 2, 2, 2],  # Bottom row
        ]
        
        for line_idx, payline in enumerate(paylines):
            line_symbols = [board[reel][row] for reel, row in enumerate(payline)]
            
            # Check for consecutive matching symbols from left
            first_symbol = line_symbols[0]
            if first_symbol == "W":  # Skip wild as first symbol for now
                continue
                
            consecutive_count = 1
            for i in range(1, len(line_symbols)):
                if line_symbols[i] == first_symbol or line_symbols[i] == "W":
                    consecutive_count += 1
                else:
                    break
            
            # Calculate win based on symbol and count
            if consecutive_count >= 3:
                symbol_values = {"A": 50, "K": 25, "Q": 15, "J": 10, "10": 5, "9": 3}
                base_value = symbol_values.get(first_symbol, 1)
                multiplier = consecutive_count - 2  # 3=1x, 4=2x, 5=3x
                win_amount = request.bet_amount * base_value * multiplier
                total_win += win_amount
                
                wins.append({
                    "symbol": first_symbol,
                    "kind": consecutive_count,
                    "win": win_amount,
                    "positions": [[reel, payline[reel]] for reel in range(consecutive_count)],
                    "meta": {"payline": line_idx}
                })
        
        return SpinResult(
            board=board,
            total_win=total_win,
            wins=wins,
            rtp=request.game_config.rtp,
            house_edge=request.game_config.house_edge
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Spin calculation failed: {str(e)}")

@app.post("/api/game/simulate", response_model=SimulationResult)
async def simulate_game(request: SimulationRequest):
    """Run game simulation"""
    try:
        total_bet = 0.0
        total_win = 0.0
        max_win = 0.0
        min_win = float('inf')
        hit_count = 0
        
        # Run multiple spins to simulate
        for _ in range(request.num_spins):
            spin_request = SpinRequest(
                bet_amount=request.bet_amount,
                game_config=request.game_config
            )
            
            # Reuse the spin logic
            spin_result = await spin_game(spin_request)
            
            total_bet += request.bet_amount
            total_win += spin_result.total_win
            
            if spin_result.total_win > 0:
                hit_count += 1
            
            max_win = max(max_win, spin_result.total_win)
            min_win = min(min_win, spin_result.total_win)
        
        actual_rtp = total_win / total_bet if total_bet > 0 else 0
        hit_frequency = hit_count / request.num_spins if request.num_spins > 0 else 0
        
        return SimulationResult(
            total_spins=request.num_spins,
            total_bet=total_bet,
            total_win=total_win,
            actual_rtp=actual_rtp,
            hit_frequency=hit_frequency,
            max_win=max_win,
            min_win=min_win if min_win != float('inf') else 0.0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@app.get("/api/config/default")
async def get_default_config():
    """Get default game configuration"""
    return {
        "game_id": "slot_basic",
        "provider_name": "StakeEngine",
        "game_name": "Basic Slot",
        "rtp": 0.96,
        "house_edge": 0.04,
        "max_bet": 1000,
        "paylines": {
            "0": [0, 0, 0, 0, 0],
            "1": [1, 1, 1, 1, 1],
            "2": [2, 2, 2, 2, 2],
            "3": [0, 1, 2, 1, 0],
            "4": [2, 1, 0, 1, 2]
        },
        "symbols": {
            "A": {"value": 100, "frequency": 0.1},
            "K": {"value": 50, "frequency": 0.15},
            "Q": {"value": 25, "frequency": 0.2},
            "J": {"value": 15, "frequency": 0.25},
            "10": {"value": 10, "frequency": 0.3}
        }
    }

@app.post("/api/config/upload")
async def upload_config(config: GameConfig):
    """Upload and validate game configuration"""
    try:
        # Here you would integrate with your Supabase storage
        # For now, just validate and return the config
        return {
            "status": "success",
            "message": "Configuration uploaded successfully",
            "config": config.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Config upload failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
