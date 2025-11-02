# Dashboard Quick Reference

## 🚀 Launch Options

### Option 1: New Window (Recommended)
```bash
./run.sh
# Choose: 1
```
Dashboard opens in a separate terminal window. You can use your main terminal for other tasks.

### Option 2: Current Terminal
```bash
./run.sh
# Choose: 2
```
Dashboard runs in the current terminal. Use if new window doesn't work.

### Option 3: Direct Launch
```bash
python3 dashboard.py
```
Manual launch. Make sure backend is already running.

## 📊 Dashboard Layout

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                      🚀 LitReview Dashboard                                  ║
╠═══════════════════╦══════════════════════╦═══════════════════════════════════╣
║                   ║                      ║                                   ║
║  SYSTEM STATUS    ║  PIPELINE STAGES     ║  BACKEND LOGS                     ║
║  • Backend        ║  1️⃣ Fetch Papers     ║  INFO: Started...                 ║
║  • Frontend       ║  2️⃣ Relevance        ║  INFO: Processing...              ║
║                   ║  3️⃣ Themes           ║                                   ║
║  METRICS          ║  4️⃣ Methodology      ║                                   ║
║  • Requests       ║  5️⃣ Ranking          ║                                   ║
║  • Errors         ║  6️⃣ Synthesis        ║                                   ║
║  • Response Time  ║  7️⃣ PDF Export       ║                                   ║
║                   ║                      ║                                   ║
║  GPU & LLM        ║  PIPELINE EVENTS     ║  FRONTEND LOGS                    ║
║  • GPU Status     ║  • Stage updates     ║  VITE: ready...                   ║
║  • VRAM Usage     ║  • Progress %        ║  Compiled successfully            ║
║  • LLM Calls      ║  • Timestamps        ║                                   ║
║                   ║  • Error messages    ║                                   ║
║  ERRORS           ║                      ║                                   ║
║  • Recent issues  ║                      ║                                   ║
║                   ║                      ║                                   ║
╚═══════════════════╩══════════════════════╩═══════════════════════════════════╝
```

## 🎨 Color Guide

| Color | Meaning | Example |
|-------|---------|---------|
| 🟢 Green | Success, Completed | Stage DONE, Backend Online |
| 🟡 Yellow | In Progress, Warning | Stage 65%, Degraded |
| 🔴 Red | Error, Critical | Offline, Failed |
| 🔵 Cyan | Information | Stage In Progress |
| 🟣 Magenta | GPU/LLM, Events | GPU Stats, Pipeline Events |

## 📍 Panel Descriptions

### Left Column

#### System Status
- Backend API health (🟢/🟡/🔴)
- Frontend UI health (🟢/🔴)
- Process IDs
- Endpoint URLs

#### System Metrics
- Total requests handled
- Error count
- Average response time
- Active WebSocket sessions
- System uptime

#### GPU & LLM Monitor
- GPU availability and name
- VRAM usage (used/total)
- Visual memory bar
- GPU utilization %
- LLM API calls count
- Tokens processed

#### Recent Errors
- Last 10 error messages
- From both backend and frontend
- Auto-highlights critical issues

### Middle Column

#### Pipeline Stages (NEW!)
- Visual progress for all 7 stages
- Progress bars with percentages
- Status indicators:
  - ✓ DONE (completed)
  - ⏳ XX% (in progress)
  - ▶ IN PROGRESS (active)
  - ⏸ PENDING (not started)
- Active pipeline session ID

#### Pipeline Events
- Last 20 pipeline events
- Timestamps for each event
- Stage numbers and progress
- Detailed status messages
- Color-coded by type

### Right Column

#### Backend Logs
- Last 15 backend log lines
- Color-coded by severity:
  - Red: errors
  - Yellow: warnings
  - Green: info/started
  - Dim: other

#### Frontend Logs
- Last 15 frontend log lines
- Color-coded by type:
  - Red: errors
  - Yellow: warnings
  - Cyan: Vite/ready messages
  - Dim: other

## 🎮 Keyboard Controls

- `Ctrl+C` - Exit dashboard (servers keep running)
- Dashboard auto-refreshes every 0.5 seconds

## 🐛 Debugging Workflow

### Pipeline Stuck?

1. **Check Pipeline Stages panel** → See which stage is active
2. **Check progress percentage** → Is it moving?
3. **Check Pipeline Events** → Last activity timestamp
4. **Check GPU Monitor** → Is GPU available and active?
5. **Check Errors panel** → Any exceptions?
6. **Check Backend Logs** → Detailed error messages

### Example Diagnosis:

```
Pipeline Stages shows:
  6️⃣ Synthesis ████████████░░░ ⏳ 85%

Pipeline Events shows:
  ▶ 22:14:26 | Stage 6 (85%) | Running summarization model...
  
GPU Monitor shows:
  🎮 GPU Status: 🟢 Available
  VRAM: 688/12288MB
  
→ Stage 6 is running on GPU, just taking time to process
```

### Performance Issues?

Check these metrics:
- **Avg Response Time** - Should be <100ms for health checks
- **GPU Utilization** - Should spike during AI stages (2, 3, 6)
- **VRAM Usage** - Should be under 2GB for typical workloads
- **Error Count** - Should be 0 or very low

## 📝 Log Files

Dashboard monitors these files in real-time:

```bash
logs/backend.log          # FastAPI application logs
logs/frontend.log         # Vite/React build logs
logs/pipeline_events.log  # JSON event stream
```

View directly:
```bash
tail -f logs/backend.log
tail -f logs/frontend.log
tail -f logs/pipeline_events.log
```

## 🛑 Stop Everything

From any terminal:
```bash
./stop.sh
```

This will:
- Stop the dashboard
- Stop backend server
- Stop frontend server
- Clean up PIDs

## 💡 Tips & Tricks

### Tip 1: Keep Dashboard Open
Run dashboard in new window (option 1) so you can:
- Use browser in main screen
- Monitor pipeline in dashboard window
- See issues immediately

### Tip 2: Watch GPU During Stages
GPU should be active during:
- Stage 2: Relevance scoring
- Stage 3: Theme clustering (embeddings)
- Stage 6: Synthesis (LLM summarization)

### Tip 3: Pipeline Events are Key
The most detailed debugging info is in the Pipeline Events panel. Watch for:
- Progress percentages increasing
- Stage transition messages
- Error messages with context

### Tip 4: Check Uptime
If "Uptime" shows a recent restart, check:
- Recent errors that might have caused crash
- Backend logs for exception traces

## 🆘 Troubleshooting

### Dashboard won't start
```bash
# Check if servers are running
curl http://localhost:8000/health
curl http://localhost:3000

# If not, start them first
./run.sh
```

### Dashboard shows "No logs"
```bash
# Check if log files exist
ls -la logs/

# If not, servers haven't written logs yet
# Wait a few seconds or trigger some activity
```

### GPU shows "Not Available"
```bash
# Check if nvidia-smi works
nvidia-smi

# Check backend config
grep use_gpu backend/core/config.py
```

### Pipeline Stages not updating
```bash
# Check if pipeline_events.log exists and is growing
ls -lh logs/pipeline_events.log

# Trigger a new pipeline from the UI
# Watch for file size to increase
```

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:8000/health
- **GPU Stats API**: http://localhost:8000/api/monitoring/gpu-stats

## 🎯 Quick Commands

```bash
# Start everything with dashboard
./run.sh

# Stop everything
./stop.sh

# View specific log
tail -f logs/backend.log

# Check backend health
curl http://localhost:8000/health | jq

# Get GPU stats
curl http://localhost:8000/api/monitoring/gpu-stats | jq

# Check if ports are in use
lsof -i :8000
lsof -i :3000
```

---

**Last Updated**: 2025-11-02
**Dashboard Version**: 2.0 Enhanced
