#!/bin/bash

# StakeEngine Math API Server Startup Script
echo "🎰 Starting StakeEngine Math API Server..."

# Navigate to math directory
cd /home/trevo/apps/stakeengine-spa/math

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Check if requirements are installed
if [ ! -f "venv/lib/python3.12/site-packages/fastapi/__init__.py" ]; then
    echo "📦 Installing Python dependencies..."
    ./venv/bin/pip install -r requirements.txt
    echo "✅ Dependencies installed"
fi

# Kill any existing server
echo "🔄 Stopping any existing math server..."
pkill -f "uvicorn api_server" 2>/dev/null || true

# Start the server
echo "🚀 Starting math server on http://localhost:8000..."
./venv/bin/uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload &

# Wait a moment for server to start
sleep 3

# Test the server
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Math API Server is running successfully!"
    echo "🌐 Health check: http://localhost:8000/health"
    echo "📚 API docs: http://localhost:8000/docs"
else
    echo "❌ Failed to start math server"
    exit 1
fi
