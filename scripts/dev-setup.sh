#!/bin/bash

# Agricultural AI Development Setup Script
# This script helps you run both the FastAPI backend and Next.js frontend

echo "🌾 Agricultural AI Development Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the Next.js project root directory"
    exit 1
fi

# Function to start FastAPI backend
start_backend() {
    echo "🚀 Starting FastAPI backend..."
    echo "Make sure you have your FastAPI project ready with the following structure:"
    echo "  - app.py (your FastAPI application)"
    echo "  - Agents/Multi_Lingual/routers.py (your router module)"
    echo ""
    echo "To start the backend manually, run:"
    echo "  cd /path/to/your/fastapi/project"
    echo "  python app.py"
    echo ""
}

# Function to start Next.js frontend
start_frontend() {
    echo "🌐 Starting Next.js frontend..."
    pnpm dev
}

# Function to show usage
show_help() {
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  backend    - Show instructions to start FastAPI backend"
    echo "  frontend   - Start Next.js frontend"
    echo "  help       - Show this help message"
    echo ""
    echo "For full setup:"
    echo "1. Start the FastAPI backend in one terminal"
    echo "2. Run '$0 frontend' in another terminal"
}

# Main script logic
case "${1:-help}" in
    "backend")
        start_backend
        ;;
    "frontend")
        start_frontend
        ;;
    "help"|*)
        show_help
        ;;
esac
