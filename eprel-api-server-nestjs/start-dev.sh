#!/bin/bash

# EPREL API Server (NestJS) - Development Startup Script

set -e

echo "🚀 Starting EPREL API Server (NestJS) in development mode..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "📝 Please edit .env file with your EPREL API key before continuing"
        echo ""
        echo "Required configuration:"
        echo "  EPREL_API_KEY=your_eprel_api_key_here"
        echo ""
        read -p "Press Enter when you have configured your .env file..."
    else
        echo "❌ .env.example file not found. Please create .env manually."
        exit 1
    fi
fi

# Check if EPREL_API_KEY is set
if ! grep -q "EPREL_API_KEY=.*[^[:space:]]" .env || grep -q "EPREL_API_KEY=your_eprel_api_key_here" .env; then
    echo "❌ EPREL_API_KEY is not properly configured in .env file"
    echo "📝 Please edit .env file and replace 'your_eprel_api_key_here' with your actual EPREL API key"
    echo ""
    echo "💡 If you don't have an API key, you can request one from:"
    echo "   https://eprel.ec.europa.eu/api"
    echo ""
    read -p "Press Enter when you have configured your API key..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        echo "Using pnpm..."
        pnpm install
    elif command -v npm &> /dev/null; then
        echo "Using npm..."
        npm install
    else
        echo "❌ Neither npm nor pnpm found. Please install Node.js and npm"
        exit 1
    fi
    echo "✅ Dependencies installed"
fi

# Load environment variables for display
source .env

echo ""
echo "🔧 Configuration:"
echo "  Port: ${PORT:-3002}"
echo "  Environment: ${NODE_ENV:-development}"
echo "  EPREL API Key: ${EPREL_API_KEY:0:10}..."
echo "  Allowed Origins: ${ALLOWED_ORIGINS:-http://localhost:5173}"
echo ""

echo "📚 Available endpoints:"
echo "  Health Check: http://localhost:${PORT:-3002}/health"
echo "  API Documentation (Swagger): http://localhost:${PORT:-3002}/api/docs"
echo "  Brands: http://localhost:${PORT:-3002}/api/brands"
echo "  Smartphones: http://localhost:${PORT:-3002}/api/smartphones"
echo ""

echo "🔧 Development mode features:"
echo "  • Hot reload enabled"
echo "  • Detailed error messages"
echo "  • Request/response logging"
echo ""

echo "🏁 Starting development server..."
echo "   (Press Ctrl+C to stop)"
echo ""

# Start the development server
if command -v pnpm &> /dev/null; then
    exec pnpm run start:dev
else
    exec npm run start:dev
fi
