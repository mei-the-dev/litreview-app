# Enhanced Monitoring System - Complete Summary

## 🎯 Objective
Add detailed event logging and visualization to debug Stage 6 pipeline hangs.

## ✅ What Was Built

### 1. Event Logging System
**File**: `backend/core/websocket_manager.py`

Added comprehensive event logging:
- Every WebSocket message is logged
- Events stored in memory (last 1000)
- Events persisted to `logs/pipeline_events.log`
- JSON format for easy parsing
- Includes session_id, timestamp, type, stage, message, progress

```python
# Example event
{
  "session_id": "abc123-...",
  "timestamp": "2025-11-02T22:14:26",
  "type": "stage_update",
  "stage": 6,
  "progress": 85,
  "message": "Running summarization model on 1234 chars..."
}
```

### 2. Events API Endpoints
**File**: `backend/api/routers/pipeline_router.py`

New endpoints:
- `GET /api/pipeline/events` - Get all recent events
- `GET /api/pipeline/events/{session_id}` - Get session-specific events

Usage:
```bash
curl http://localhost:8000/api/pipeline/events | jq
curl http://localhost:8000/api/pipeline/events/{session_id} | jq
```

### 3. Enhanced Dashboard
**File**: `dashboard.py`

Upgraded to 3-column layout:
- **Left Column**: Status, Metrics, Errors (unchanged)
- **Middle Column**: **NEW** - Pipeline Events with detailed debugging
- **Right Column**: Backend and Frontend Logs (unchanged)

Pipeline Events Panel Features:
- Color-coded events:
  - 🔴 Red: Errors
  - 🟢 Green: Stage completions
  - 🔵 Cyan: Progress updates
  - 🟡 Yellow: Connections
- Shows last 20 events
- Real-time updates (0.5s refresh)
- Formatted timestamps
- Stage numbers and progress percentages
- Detailed messages

### 4. Enhanced Stage 6 Logging
**File**: `backend/domain/pipeline/stage_6_synthesis.py`

Added granular progress updates:
- 10%: Starting synthesis
- 30%: Analyzing themes
- 60%: Analyzing methodologies
- 80%: Generating AI insights (loading model warning)
- 85%: Running summarization (with character count)
- 90%: AI summary completed
- 95%: Finalizing report structure
- 100%: Complete

Better error handling:
- Shows truncated error messages in events
- Falls back to manual insights on AI failure
- Logs both success and failure paths

## 🚀 How to Use

### Quick Start
```bash
# Start everything (includes dashboard)
./run.sh

# Or if services already running
python3 dashboard.py
```

### Debug a Stuck Pipeline

1. **Open Dashboard** - Watch the Pipeline Events column (middle)
2. **Run Pipeline** - Open http://localhost:3000, start a review
3. **Watch Events** - See real-time progress in the middle column
4. **Identify Hang** - Last event shows exactly where it stopped
5. **Check Details** - Read error messages and context

### Alternative Debugging Methods

**Check Event Log File**:
```bash
tail -f logs/pipeline_events.log
```

**Query API**:
```bash
# All events
curl http://localhost:8000/api/pipeline/events

# Specific session
curl http://localhost:8000/api/pipeline/events/{session_id}
```

## 🔍 Debugging Stage 6 Hangs

### Progress Checkpoints

| Progress | Step | Expected Duration | Watch For |
|----------|------|-------------------|-----------|
| 10% | Starting | < 1 sec | Initialization |
| 30% | Theme analysis | 1-2 sec | Data processing |
| 60% | Methodology | 1-2 sec | Data processing |
| 80% | AI insights start | < 1 sec | Model loading warning |
| 85% | Running model | 10-120 sec | First time: 1-2 min (download)<br>Later: 10-30 sec |
| 90% | Model complete | < 1 sec | Summary generated |
| 95% | Finalizing | < 1 sec | Report assembly |
| 100% | Complete | - | Stage done |

### Common Hang Points

**At 80-85% (Model Loading)**:
- First run: Model downloading (normal, 1-2 min)
- Subsequent: HuggingFace API issues
- Check: Backend logs for "Bad Request" errors
- Solution: Wait or check API key

**At 85-90% (Running Model)**:
- Rate limit exceeded
- API timeout
- Check: Event message for error details
- Solution: System falls back to manual insights

## 📊 Event Types

The system logs these event types:

1. **connected** - WebSocket connection established
2. **stage_update** - Progress within a stage
3. **stage_complete** - Stage finished successfully
4. **error** - Something went wrong

## 🐛 Troubleshooting

### No Events Showing in Dashboard
- Check if `logs/pipeline_events.log` exists
- Check file permissions: `chmod 666 logs/pipeline_events.log`
- Restart dashboard: `Ctrl+C` then `python3 dashboard.py`

### Events Not Logged to File
- Check directory exists: `mkdir -p logs`
- Check write permissions on `logs/` directory
- Check disk space: `df -h`

### Dashboard Shows "Offline"
```bash
./stop.sh
./run.sh
```

## 📁 Files Changed

1. `backend/core/websocket_manager.py` - Event logging infrastructure
2. `backend/api/routers/pipeline_router.py` - Events API endpoints
3. `backend/domain/pipeline/stage_6_synthesis.py` - Detailed progress logging
4. `dashboard.py` - 3-column layout with Pipeline Events panel

## 🎨 Dashboard Layout

```
╔══════════════════════════════════════════════════════════════════╗
║              🚀 LitReview Dashboard | 2025-11-02 22:14:26       ║
╠═══════════════╦═══════════════╦══════════════╗
║               ║               ║              ║
║  System       ║  Pipeline     ║  Backend     ║
║  Status       ║  Events       ║  Logs        ║
║               ║  (DETAILED)   ║              ║
║ ─────────────║ ─────────────║─────────────║
║               ║  ▶ Stage 6    ║  INFO: ...   ║
║  Metrics      ║    (85%)      ║  INFO: ...   ║
║               ║    Running    ║              ║
║               ║    model...   ║              ║
║ ─────────────║               ║─────────────║
║               ║  ✓ Stage 5    ║  Frontend    ║
║  Errors       ║    COMPLETE   ║  Logs        ║
║               ║               ║              ║
║               ║  ▶ Stage 4    ║  [Vite]      ║
║               ║    (100%)     ║  Ready...    ║
╚═══════════════╩═══════════════╩══════════════╝
```

## 🎯 Next Steps

1. Run the dashboard: `python3 dashboard.py`
2. Trigger a pipeline run
3. Watch the Pipeline Events panel (middle column)
4. Identify exact hang point
5. Use event details to diagnose issue

The enhanced monitoring should reveal:
- Exact stage and progress when hanging
- Whether it's model loading, API calls, or data processing
- Error messages with context
- Time spent on each sub-step

## 📝 Log Files

- `logs/backend.log` - FastAPI server logs
- `logs/frontend.log` - Vite dev server logs
- `logs/pipeline_events.log` - **NEW** - Detailed pipeline events

