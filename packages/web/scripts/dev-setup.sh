#!/bin/bash

# TypeAmp Development Environment Setup Script
# This script ensures a clean and reliable development environment

set -e  # Exit on any error

echo "🚀 Setting up TypeAmp development environment..."

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use"
        return 0
    else
        return 1
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -f "$url" >/dev/null 2>&1; then
            echo "✅ $name is ready!"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo "❌ $name failed to start after 30 seconds"
    return 1
}

# Step 1: Check system requirements
echo "🔍 Checking system requirements..."
node --version || { echo "❌ Node.js not found"; exit 1; }
npm --version || { echo "❌ npm not found"; exit 1; }

# Step 2: Clean any corrupted builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Clean completed"

# Step 3: Check for existing processes
if check_port 3000; then
    echo "🔄 Stopping existing frontend server..."
    pkill -f "next dev" || true
    sleep 2
fi

if check_port 3003; then
    echo "🔄 Stopping existing backend server..."
    pkill -f "tsx watch" || true
    sleep 2
fi

# Step 4: Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Step 5: Start the development servers
echo "🌐 Starting development servers..."

# Start backend API first
cd ../api
echo "🔧 Starting backend API on port 3003..."
PORT=3003 npm run dev > api.log 2>&1 &
API_PID=$!

# Go back to web directory
cd ../web

# Wait for API to be ready
if wait_for_service "http://localhost:3003" "Backend API"; then
    echo "🎯 Starting frontend on port 3000..."
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    if wait_for_service "http://localhost:3000" "Frontend"; then
        echo ""
        echo "🎉 Development environment is ready!"
        echo "📱 Frontend: http://localhost:3000"
        echo "🔧 Backend API: http://localhost:3003"
        echo ""
        echo "🛑 To stop servers: pkill -f 'next dev' && pkill -f 'tsx watch'"
        echo ""
        
        # Keep the script running so servers stay active
        echo "✨ Both servers are running. Press Ctrl+C to stop."
        trap "echo '🛑 Stopping servers...'; kill $API_PID $FRONTEND_PID 2>/dev/null || true; exit 0" INT
        wait
    else
        echo "❌ Frontend failed to start"
        kill $API_PID 2>/dev/null || true
        exit 1
    fi
else
    echo "❌ Backend API failed to start"
    kill $API_PID 2>/dev/null || true
    exit 1
fi