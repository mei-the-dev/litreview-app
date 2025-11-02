# What to Do Now - Stage 6 Debugging

## ✅ What's Ready

I've added a comprehensive **Pipeline Events monitoring system** to help debug Stage 6 hangs. 

### New Features:
1. **3-column dashboard** with detailed event logging
2. **Event log file** (`logs/pipeline_events.log`)
3. **API endpoints** to query events
4. **Enhanced Stage 6 logging** with progress details

## 🚀 Run This Now

### Option 1: Full Restart (Recommended)
```bash
./stop.sh
./run.sh
```

This will:
- Stop all services
- Start backend (port 8000)
- Start frontend (port 3000)
- Start enhanced dashboard (in terminal)

### Option 2: Just Dashboard (if services already running)
```bash
python3 dashboard.py
```

## 🎯 What You'll See

The dashboard now has **3 columns**:

```
┌─────────────┬─────────────────┬─────────────┐
│   Status    │ Pipeline Events │   Logs      │
│   Metrics   │   (DETAILED)    │   Backend   │
│   Errors    │    🆕 NEW!     │   Frontend  │
└─────────────┴─────────────────┴─────────────┘
```

**Watch the MIDDLE column** - it shows:
- Real-time pipeline progress
- Exact stage and percentage
- Detailed messages
- Error context when stuck

## 🧪 Test It

1. **Start the enhanced system**:
   ```bash
   ./run.sh
   ```

2. **Open browser**: http://localhost:3000

3. **Run a pipeline**:
   - Enter keywords: "machine learning"
   - Click "Start Review"

4. **Watch the dashboard** (middle column):
   - You'll see events scroll by
   - Each stage updates in real-time
   - When it hits Stage 6, you'll see:
     - 10%: Starting
     - 30%: Analyzing themes
     - 60%: Analyzing methodologies
     - 80%: Loading AI model
     - 85%: Running model (← watch for hang here)
     - 90%: Model complete
     - 95%: Finalizing
     - 100%: Done

5. **If it hangs at Stage 6**:
   - Look at the last event in the middle column
   - It will show exactly where it stopped
   - Error messages will be in red
   - Check the message for details

## 🔍 Debug Commands

If you see a hang, use these:

```bash
# Check event log
tail -f logs/pipeline_events.log

# Query events via API (get session_id from dashboard)
curl http://localhost:8000/api/pipeline/events | jq

# Check backend logs
tail -f logs/backend.log
```

## 📊 What to Look For

### Normal Operation (Stage 6):
```
▶ Stage 6 (10%) | Generating synthesis report...
▶ Stage 6 (30%) | Analyzing thematic clusters...
▶ Stage 6 (60%) | Analyzing methodologies...
▶ Stage 6 (80%) | Generating AI insights (loading model, may take 1-2 minutes first time)...
▶ Stage 6 (85%) | Running summarization model on 1234 chars of abstracts...
▶ Stage 6 (90%) | AI summary generated successfully
▶ Stage 6 (95%) | Finalizing report structure...
✓ Stage 6 COMPLETE
```

### Common Hang Patterns:

**Hung at 85% with "Running summarization model"**:
- **Cause**: HuggingFace API timeout or rate limit
- **What to check**: Backend logs for "Bad Request" or "429" errors
- **Solution**: Wait (system will fall back to manual insights after timeout)

**Hung at 80% with "loading model"**:
- **Cause**: First-time model download
- **Normal**: Takes 1-2 minutes on first run
- **What to check**: Backend logs for download progress
- **Solution**: Wait for download to complete

## 📝 Report Back

After running with the new monitoring, please share:

1. **Screenshot or copy** of the Pipeline Events column when stuck
2. **Last 10 lines** of `logs/pipeline_events.log`
3. **Exact progress percentage** where it hangs
4. **Error message** if any (shown in red)

This will pinpoint the exact issue!

## 🎨 Visual Example

When working correctly, you'll see:
```
┌──────────────────────────────────────────────────┐
│      Pipeline Events (Detailed)                   │
├──────────────────────────────────────────────────┤
│ ✓ 2025-11-02 22:15:10 | Stage 1 COMPLETE        │
│ ▶ 2025-11-02 22:15:12 | Stage 2 (50%) | ...     │
│ ✓ 2025-11-02 22:15:15 | Stage 2 COMPLETE        │
│ ▶ 2025-11-02 22:15:16 | Stage 3 (30%) | ...     │
│ ✓ 2025-11-02 22:15:20 | Stage 3 COMPLETE        │
│ ▶ 2025-11-02 22:15:21 | Stage 4 (20%) | ...     │
│ ✓ 2025-11-02 22:15:25 | Stage 4 COMPLETE        │
│ ▶ 2025-11-02 22:15:26 | Stage 5 (40%) | ...     │
│ ✓ 2025-11-02 22:15:30 | Stage 5 COMPLETE        │
│ ▶ 2025-11-02 22:15:31 | Stage 6 (10%) | ...     │
│ ▶ 2025-11-02 22:15:32 | Stage 6 (30%) | ...     │
│ ▶ 2025-11-02 22:15:33 | Stage 6 (60%) | ...     │
│ ▶ 2025-11-02 22:15:34 | Stage 6 (80%) | ...     │
│ ▶ 2025-11-02 22:15:35 | Stage 6 (85%) | ...     │ ← WATCH HERE
│                                                   │
└──────────────────────────────────────────────────┘
```

## ⚡ Quick Commands

```bash
# Full restart with enhanced monitoring
./stop.sh && ./run.sh

# Check if services are running
ps aux | grep -E "uvicorn|vite" | grep -v grep

# Check logs
tail -f logs/pipeline_events.log

# Test API
curl http://localhost:8000/api/pipeline/events | jq '.events[-5:]'
```

## 📚 Documentation

See these files for more details:
- `ENHANCED_MONITORING_SUMMARY.md` - Complete technical details
- `DEBUG_STAGE6.md` - Step-by-step debugging guide
- `STAGE_6_ENHANCED_MONITORING.md` - Implementation summary

---

**Ready to go!** Run `./run.sh` and watch the new Pipeline Events column for detailed debugging info! 🚀
