# 🎨 LitReview Dashboard

## Interactive Real-time Monitoring Dashboard

A beautiful, colorful CLI dashboard for monitoring your LitReview application with real-time updates.

---

## Features

### 📊 System Status
- **Backend API status** (🟢 Online / 🟡 Degraded / 🔴 Offline)
- **Frontend UI status** with health checks
- **Process IDs** (PIDs) tracking
- **Response time** monitoring
- **Endpoint URLs** with clickable links

### 📈 Metrics Panel
- **Total requests** processed
- **Error count** tracking
- **Average response time** (milliseconds)
- **Active WebSocket sessions**
- **System uptime** display

### ❌ Error Monitoring
- **Real-time error detection** from logs
- **Last 10 errors** displayed
- **Source identification** (Backend/Frontend)
- **Error highlighting** in red

### 📝 Live Logs
- **Backend logs** (FastAPI, WebSockets, AI pipeline)
- **Frontend logs** (Vite, React, build info)
- **Color-coded** log levels:
  - 🔴 Errors (red)
  - 🟡 Warnings (yellow)
  - 🟢 Info (green)
  - ⚪ Debug (dim)
- **Auto-scrolling** latest 15 lines
- **Real-time updates** (2Hz refresh)

### 🎨 Beautiful UI
- **Glassmorphism-inspired** terminal design
- **Color-coded panels** for easy reading
- **Responsive layout** adapts to terminal size
- **Rich text formatting** with icons
- **Box drawing** with rounded corners
- **Status indicators** with emojis

---

## Usage

### Option 1: Launch with run.sh (Recommended)

```bash
./run.sh
# Choose option 1 when prompted for dashboard
```

### Option 2: Launch Separately

```bash
# Start the application first
./run.sh  # Choose option 2 (no dashboard)

# In another terminal, launch dashboard
./monitor.sh
```

### Option 3: Direct Python

```bash
python3 dashboard.py
```

---

## Dashboard Layout

```
╔═══════════════════════════════════════════════════════════════╗
║                   🚀 LitReview Dashboard                      ║
║                      2024-11-02 18:15:30                      ║
╠═══════════════════════╦═══════════════════════════════════════╣
║                       ║                                       ║
║   System Status       ║        Backend Logs                   ║
║   ─────────────       ║        ─────────────                  ║
║   🔧 Backend: 🟢      ║   INFO: Started server...             ║
║   🎨 Frontend: 🟢     ║   INFO: WebSocket connected...        ║
║                       ║   INFO: Pipeline stage 1 complete...  ║
║   Metrics             ║                                       ║
║   ────────           ║                                       ║
║   📊 Requests: 42     ║        Frontend Logs                  ║
║   ⚠️  Errors: 0       ║        ──────────────                 ║
║   ⚡ Response: 45ms   ║   VITE ready in 201ms                 ║
║   🔌 Sessions: 2      ║   Local: http://localhost:3000/       ║
║   ⏱️  Uptime: 5:23    ║                                       ║
║                       ║                                       ║
║   Recent Errors       ║                                       ║
║   ─────────────       ║                                       ║
║   ✨ No errors!       ║                                       ║
║                       ║                                       ║
╠═══════════════════════╩═══════════════════════════════════════╣
║  Press Ctrl+C to exit | Logs: logs/*.log | Stop: ./stop.sh  ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Requirements

**Python Packages:**
- `rich` - Terminal UI framework
- `requests` - HTTP client for health checks

These are automatically installed when you run the dashboard.

---

## Keyboard Controls

| Key | Action |
|-----|--------|
| `Ctrl+C` | Exit dashboard (servers keep running) |
| `Ctrl+Z` | Suspend dashboard |
| `fg` | Resume dashboard (after Ctrl+Z) |

**Note:** Exiting the dashboard does NOT stop the servers. Use `./stop.sh` to stop them.

---

## Features in Detail

### Health Checks

The dashboard performs health checks every 2 seconds:
- **Backend:** `GET /health` endpoint
- **Frontend:** `GET /` endpoint
- **Response time:** Measured in milliseconds

### Log Monitoring

Watches log files in real-time:
- `logs/backend.log` - Backend server logs
- `logs/frontend.log` - Frontend build/dev logs

### Error Detection

Automatically detects errors by scanning for keywords:
- `error`, `exception`, `failed`, `traceback` (Backend)
- `error`, `failed`, `warning` (Frontend)

### Process Tracking

Reads `.pids` file to track:
- Backend PID
- Frontend PID
- Process uptime

---

## Color Scheme

| Component | Color | Meaning |
|-----------|-------|---------|
| 🟢 Green | Online | Service is healthy |
| 🟡 Yellow | Degraded | Service responding slowly |
| 🔴 Red | Offline | Service is down |
| 🔵 Blue | Info | Informational logs |
| 🟠 Orange | Warning | Warning messages |
| ⚪ Gray | Debug | Debug/trace logs |

---

## Troubleshooting

**Dashboard won't start:**
```bash
# Install dependencies manually
pip install rich requests

# Then try again
./monitor.sh
```

**No data showing:**
- Make sure servers are running: `./run.sh`
- Check logs exist: `ls -la logs/`
- Verify .pids file: `cat .pids`

**Dashboard is laggy:**
- The refresh rate is 2Hz (twice per second)
- On slow terminals, it may lag slightly
- Try using a modern terminal emulator

**Can't exit:**
- Press `Ctrl+C` once
- If stuck, press `Ctrl+Z` then `kill %1`

---

## Advanced Usage

### Custom Monitoring

Edit `dashboard.py` to customize:
- Refresh rate (line ~343: `refresh_per_second=2`)
- Log buffer size (lines 28-30: `maxlen=50`)
- Health check interval (line ~128: `time.sleep(2)`)
- Panel heights (throughout the file)

### Integration

The dashboard can be integrated into other scripts:

```python
from dashboard import DashboardMonitor

monitor = DashboardMonitor()
monitor.run()
```

---

## Example Output

**Normal operation:**
```
✨ No errors! System running smoothly.
📊 Total Requests: 156
⚡ Avg Response: 42ms
🟢 Backend: Online
🟢 Frontend: Online
```

**With errors:**
```
❌ [Backend] ERROR: Failed to connect to database
❌ [Frontend] Error: Module not found
⚠️  Error Count: 2
```

---

## Benefits

✅ **Real-time monitoring** - See what's happening instantly  
✅ **Error detection** - Catch problems as they occur  
✅ **Performance metrics** - Track response times  
✅ **Beautiful UI** - Easy to read and navigate  
✅ **Non-intrusive** - Runs in separate terminal  
✅ **Background friendly** - Servers keep running  

---

## Tips

💡 **Multi-monitor setup:** Run dashboard on second screen  
💡 **SSH sessions:** Works great over SSH with terminal multiplexers  
💡 **Development:** Keep dashboard open while developing  
💡 **Production:** Use for quick health checks  
💡 **Debugging:** Watch logs in real-time during issues  

---

**Built with the Rich library for beautiful terminal output!**

https://github.com/Textualize/rich
