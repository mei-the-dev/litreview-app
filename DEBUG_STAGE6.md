# Debug Stage 6 - Quick Guide

## Problem
Pipeline gets stuck at Stage 6 (generating synthesis report)

## Solution - Enhanced Monitoring

### Step 1: Start the Enhanced Dashboard
```bash
./run.sh  # Starts backend + frontend + dashboard
```

Or if services are already running:
```bash
python3 dashboard.py
```

### Step 2: Trigger a Pipeline Run
Open browser: http://localhost:3000
- Enter keywords (e.g., "machine learning")
- Click "Start Review"

### Step 3: Watch the Pipeline Events Panel
The dashboard now has a **Pipeline Events** column (middle) showing:

```
✓ 2025-11-02 22:14:26 | Stage 1 COMPLETE
▶ 2025-11-02 22:14:28 | Stage 2 (30%) | Calculating relevance scores...
✓ 2025-11-02 22:14:35 | Stage 2 COMPLETE
...
▶ 2025-11-02 22:15:20 | Stage 6 (80%) | Generating AI insights (loading model, may take 1-2 minutes first time)...
▶ 2025-11-02 22:15:21 | Stage 6 (85%) | Running summarization model on 1234 chars of abstracts...
```

### Step 4: Identify the Hang Point

#### If stuck at "Generating AI insights (loading model...)"
- **Cause**: HuggingFace model downloading (first time only)
- **Fix**: Wait 1-2 minutes for model download
- **Check**: Look for HuggingFace API errors in Backend Logs panel
- **Fallback**: System will use manual insights if model fails

#### If stuck at "Running summarization model..."
- **Cause**: HuggingFace API rate limit or timeout
- **Check**: Backend Logs for "Bad Request" or "429" errors
- **Check**: `logs/pipeline_events.log` for detailed error

#### If stuck at other percentages
- 10%: Just started
- 30%: Theme analysis
- 60%: Methodology analysis
- 95%: Finalizing (should be quick)

### Step 5: Check Event Log File
```bash
tail -f logs/pipeline_events.log
```

Look for the last event to see exactly where it stopped:
```json
{"session_id": "abc123...", "type": "stage_update", "stage": 6, "progress": 85, "message": "Running summarization model on 1234 chars...", "timestamp": "2025-11-02T22:15:21"}
```

### Step 6: Query Events via API
```bash
# Get all events
curl http://localhost:8000/api/pipeline/events | jq

# Get events for specific session (copy session_id from dashboard)
curl http://localhost:8000/api/pipeline/events/{session_id} | jq
```

## Common Issues & Solutions

### 1. Stage 6 Stuck at 80-85% (AI Insights)
**Problem**: HuggingFace API not responding
**Solutions**:
- Check HuggingFace API key in `.env`
- Wait for rate limit to reset (60 seconds)
- System should auto-fallback to manual insights after timeout

### 2. No Pipeline Events Showing
**Problem**: WebSocket not logging
**Solution**: Check that `logs/pipeline_events.log` exists and has write permissions
```bash
ls -la logs/
touch logs/pipeline_events.log
```

### 3. Dashboard Shows "Offline"
**Problem**: Services not running
**Solution**:
```bash
./stop.sh
./run.sh
```

### 4. Events Show Errors
**Problem**: Look at the error message in red
**Common errors**:
- "Bad Request" → Check API keys
- "Rate limit" → Wait 60 seconds
- "Timeout" → Increase timeout in stage code
- "No abstracts" → Papers don't have abstracts, using manual insights

## Visual Guide

Dashboard Layout:
```
┌────────────────┬────────────────┬────────────────┐
│  LEFT          │  MIDDLE        │  RIGHT         │
│  Status        │  PIPELINE      │  Backend Logs  │
│  Metrics       │  EVENTS        │  Frontend Logs │
│  Errors        │  (DETAILED)    │                │
└────────────────┴────────────────┴────────────────┘
```

Watch the **MIDDLE COLUMN** - Pipeline Events for real-time debugging!

## Files Modified
- `backend/core/websocket_manager.py` - Event logging
- `backend/api/routers/pipeline_router.py` - Events API
- `backend/domain/pipeline/stage_6_synthesis.py` - Detailed progress
- `dashboard.py` - Pipeline Events panel

