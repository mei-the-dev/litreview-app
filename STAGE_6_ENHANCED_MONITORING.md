# Stage 6 Enhanced Monitoring

## Summary
Enhanced the monitoring dashboard with detailed pipeline event logging to help debug Stage 6 (synthesis report generation) issues.

## Changes Made

### 1. Enhanced WebSocket Manager (`backend/core/websocket_manager.py`)
- Added event logging to both file and memory
- Created `logs/pipeline_events.log` for persistent event storage
- Added `get_recent_events()` method to retrieve events for debugging
- All WebSocket messages are now logged with timestamps

### 2. New API Endpoints (`backend/api/routers/pipeline_router.py`)
- `GET /api/pipeline/events/{session_id}` - Get events for specific session
- `GET /api/pipeline/events` - Get all recent events
- Useful for debugging pipeline issues via API calls

### 3. Enhanced Dashboard (`dashboard.py`)
- Added new **Pipeline Events** panel (middle column)
- Shows real-time detailed events with color coding:
  - 🔴 Red: Errors
  - 🟢 Green: Stage completion
  - 🔵 Cyan: Progress updates
  - 🟡 Yellow: Connections
- Displays last 20 events with:
  - Timestamp
  - Stage number
  - Progress percentage
  - Detailed messages
- Auto-refreshes every 0.5 seconds

### 4. Enhanced Stage 6 Logging (`backend/domain/pipeline/stage_6_synthesis.py`)
- Added detailed progress updates:
  - 85%: Model running with character count
  - 90%: AI summary completion
  - 95%: Finalizing report
- Better error messages with truncated error details
- Logging for both success and failure paths

## How to Use for Debugging

### Run Dashboard
```bash
python3 dashboard.py
```

The dashboard now has 3 columns:
- **Left**: System status, metrics, errors
- **Middle**: Pipeline Events (NEW - detailed event log)
- **Right**: Backend and frontend logs

### Check Events via API
```bash
# Get all recent events
curl http://localhost:8000/api/pipeline/events

# Get events for specific session
curl http://localhost:8000/api/pipeline/events/{session_id}
```

### Check Event Log File
```bash
tail -f logs/pipeline_events.log
```

## Debugging Stage 6 Issues

When Stage 6 gets stuck, check:

1. **Dashboard Pipeline Events Panel** - See exactly where it stopped
2. **Event Log** - `logs/pipeline_events.log` for complete history
3. **Error Messages** - Dashboard shows detailed error context
4. **Progress Updates** - See which sub-step is hanging:
   - 10%: Starting
   - 30%: Thematic analysis
   - 60%: Methodological analysis
   - 80%: AI insights (often slowest - model loading)
   - 85%: Model running
   - 90%: Summary complete
   - 95%: Finalizing
   - 100%: Stage complete

## Known Issues to Watch For

### AI Model Loading
- First time: Takes 1-2 minutes to download model
- Subsequent runs: ~10-30 seconds
- Check for "loading model" message in events
- Falls back to manual insights if fails

### HuggingFace API
- Rate limits can cause delays
- Check for "Bad Request" errors
- Falls back to local model if API fails

## Next Steps

Run a pipeline and monitor the detailed events to identify:
1. Exact point where Stage 6 hangs
2. Error messages with context
3. Time spent on each sub-step
4. Whether it's AI model loading, API calls, or data processing

