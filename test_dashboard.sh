#!/bin/bash
echo "Testing dashboard startup..."
timeout 5 python3 dashboard.py &
PID=$!
sleep 3
if ps -p $PID > /dev/null; then
    echo "✅ Dashboard started successfully (PID: $PID)"
    kill $PID
else
    echo "❌ Dashboard failed to start"
    exit 1
fi
