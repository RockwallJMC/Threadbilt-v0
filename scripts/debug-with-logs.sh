#!/bin/bash
# Debug helper script that captures Next.js dev server logs
# Usage: ./scripts/debug-with-logs.sh

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/nextjs-debug-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "Starting Next.js dev server with logging..."
echo "Logs will be saved to: $LOG_FILE"
echo "Press Ctrl+C to stop"
echo ""
echo "----------------------------------------"
echo ""

# Run dev server and tee output to both console and log file
npm run dev 2>&1 | tee "$LOG_FILE"
