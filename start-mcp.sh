#!/bin/bash

# Start MCP Server with lifecycle management
# Usage: ./start-mcp.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="/tmp/editor-pro-max-mcp.pid"
LOG_FILE="/tmp/editor-pro-max-mcp.log"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down MCP Server..."
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID" 2>/dev/null || true
            echo "✓ MCP Server stopped"
        fi
        rm -f "$PID_FILE"
    fi
    exit 0
}

# Trap signals
trap cleanup SIGINT SIGTERM

echo "🚀 Starting Video Editor Pro Max MCP Server..."
echo "   Project: $PROJECT_DIR"
echo "   Log: $LOG_FILE"
echo ""
echo "📍 The server is now ACTIVE and listening for Cowork connections"
echo "   Keep this terminal open while using the skill"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
cd "$PROJECT_DIR"
npm run mcp:server > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

# Monitor the process
while kill -0 "$SERVER_PID" 2>/dev/null; do
    sleep 1
done

echo ""
echo "❌ MCP Server crashed. Check log:"
echo "   cat $LOG_FILE"
exit 1
