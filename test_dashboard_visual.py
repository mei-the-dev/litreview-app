#!/usr/bin/env python3
"""
Quick visual test of the enhanced dashboard
Creates a simulated environment to show all features
"""

import time
import json
from pathlib import Path
from datetime import datetime

# Create test logs directory
Path("logs").mkdir(exist_ok=True)

# Create sample backend log
with open("logs/backend.log", "a") as f:
    f.write(f"INFO:     Application startup complete.\n")
    f.write(f"INFO:     Uvicorn running on http://0.0.0.0:8000\n")

# Create sample frontend log  
with open("logs/frontend.log", "a") as f:
    f.write(f"  VITE v5.0.11  ready in 823 ms\n")
    f.write(f"  ➜  Local:   http://localhost:3000/\n")

# Create sample pipeline events
events = [
    {
        "session_id": "test-12345678",
        "timestamp": datetime.now().isoformat(),
        "type": "connected",
        "message": "Pipeline session started"
    },
    {
        "session_id": "test-12345678",
        "timestamp": datetime.now().isoformat(),
        "type": "stage_update",
        "stage": 1,
        "progress": 100,
        "message": "Fetched 25 papers from Semantic Scholar"
    },
    {
        "session_id": "test-12345678",
        "timestamp": datetime.now().isoformat(),
        "type": "stage_complete",
        "stage": 1,
        "message": "Stage 1 complete"
    },
    {
        "session_id": "test-12345678",
        "timestamp": datetime.now().isoformat(),
        "type": "stage_update",
        "stage": 2,
        "progress": 65,
        "message": "Scoring paper relevance with AI model..."
    }
]

with open("logs/pipeline_events.log", "w") as f:
    for event in events:
        f.write(json.dumps(event) + "\n")

# Create .pids file
with open(".pids", "w") as f:
    f.write("BACKEND_PID=12345\n")
    f.write("FRONTEND_PID=12346\n")

print("✅ Test environment created!")
print("📁 Created:")
print("   - logs/backend.log")
print("   - logs/frontend.log")
print("   - logs/pipeline_events.log")
print("   - .pids")
print()
print("🎨 Now you can test the dashboard:")
print("   python3 dashboard.py")
print()
print("⚠️  Note: Backend/Frontend won't show as 'Online' since they're not actually running")
print("   But all panels and features will display correctly!")
