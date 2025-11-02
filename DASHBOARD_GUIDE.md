# Dashboard & Monitoring Quick Reference Guide

## Starting the System

```bash
./run.sh
# Choose option 1: Dashboard in new window (recommended)
# Or option 2: Dashboard in current terminal
```

## Dashboard Layout (3-Column Design)

### Left Column
- **System Status**: Backend/Frontend health, PIDs, response times
- **System Metrics**: Request count, errors, uptime
- **GPU & LLM Monitor**: GPU memory, utilization, LLM token usage
- **Recent Errors**: Last 10 errors from any component

### Middle Column (KEY FEATURES)
- **Pipeline Stages**: Visual progress bars for all 7 stages
  - Shows current stage with ▶ indicator
  - Completed stages have ✓ green checkmark
  - Displays progress percentage for active stages
- **Pipeline Events (Detailed)**: Real-time event log
  - Color-coded by event type
  - Shows timestamps, stage numbers, messages
  - Last 20 events displayed

### Right Column
- **Backend Logs**: Real-time backend server logs
- **Frontend Logs**: Real-time frontend dev server logs

## Understanding Pipeline Events

### Event Types in Dashboard
- 🔌 **connected** (yellow): New pipeline session started
- ▶ **stage_update** (cyan): Stage in progress with % complete
- ✓ **stage_complete** (green): Stage finished successfully  
- ⚠️ **error** (red): Something went wrong

### The 7 Pipeline Stages
1. **Fetch Papers** - Query Semantic Scholar API
2. **Relevance Score** - AI scoring of paper relevance  
3. **Theme Grouping** - Cluster papers by research themes
4. **Methodology** - Group by research methodology
5. **Ranking** - Multi-factor ranking algorithm
6. **Synthesis** - LLM-generated summary report
7. **PDF Export** - Generate formatted PDF document

## Monitoring GPU Usage

Watch for:
- **VRAM Usage**: Should stay under 10GB for RTX 3060 12GB
- **Utilization**: Spikes during AI model inference (stages 2, 3, 6)
- **Model Loading**: First inference takes 30-60s to load model

## Normal Pipeline Execution Pattern

```
🔌 Session abc123 connected
▶ Stage 1 (50%) | Fetching papers from Semantic Scholar...
▶ Stage 1 (100%) | Fetched 25 papers
✓ Stage 1 DONE
▶ Stage 2 (25%) | Scoring paper relevance...
▶ Stage 2 (75%) | Analyzing with AI model...
✓ Stage 2 DONE
▶ Stage 6 (10%) | Generating synthesis report...
▶ Stage 6 (85%) | Running summarization model...
✓ Stage 6 DONE
▶ Stage 7 (50%) | Generating PDF...
✓ Stage 7 DONE - Pipeline complete!
```

## Troubleshooting Dashboard Issues

### Issue: "No pipeline events" showing in dashboard

**Diagnosis:**
- Pipeline events only appear when a pipeline is actively running or has run
- Empty `logs/pipeline_events.log` = no pipelines executed yet

**Solution:**
```bash
# Option 1: Run a real pipeline from the frontend
# Open http://localhost:3000 and start a review

# Option 2: Load test events
./test_dashboard_events.sh
# Dashboard should immediately show 13 test events
```

### Issue: Pipeline stages not updating

**Check:**
1. Is backend running? Check "System Status" panel for green dot
2. Is a pipeline actively running? Check frontend at http://localhost:3000
3. Is `logs/pipeline_events.log` being written? `tail -f logs/pipeline_events.log`

**Debug:**
```bash
# Watch events being written in real-time
tail -f logs/pipeline_events.log

# Check if WebSocket is sending events  
grep "stage_update" logs/backend.log
```

### Issue: Backend failed to start (run.sh error)

**Recent Fix Applied:**
- Extended timeout from 30s to 60s
- GPU model loading can take 30-60 seconds on first start

**If still failing:**
```bash
# Check backend logs
tail -30 logs/backend.log

# Try manual start to see errors
cd backend
source venv/bin/activate
python main.py
```

Common causes:
- Missing API keys in `backend/.env`
- Port 8000 already in use: `lsof -i:8000`
- GPU driver issues: `nvidia-smi`
- Python dependencies: `pip install -r requirements.txt`

## Performance Metrics

### Expected Timings (RTX 3060 12GB)
- Stage 1: 5-10 seconds (Semantic Scholar API call)
- Stage 2: 30-60 seconds (AI scoring + model load)
- Stage 3: 10-20 seconds (Theme clustering)
- Stage 4: 10-20 seconds (Methodology classification)
- Stage 5: 1-2 seconds (Ranking algorithm)
- Stage 6: **60-180 seconds** (LLM summarization - SLOWEST)
- Stage 7: 5-10 seconds (PDF generation)

**Total Pipeline Time**: 2-5 minutes for 25 papers

### Resource Usage
- **CPU**: Moderate (20-40%) during processing
- **GPU**: Heavy bursts (70-90%) during AI inference (stages 2, 3, 6)
- **RAM**: 4-8 GB (Python backend + Node frontend + models)
- **VRAM**: 3-6 GB peak during model inference
- **Network**: Active during stage 1 and if using HuggingFace API

## Stage 6 (Synthesis) - Special Attention

This stage often takes longest and can appear "stuck":

**What's happening:**
```
Progress 10%  → Building report structure
Progress 30%  → Analyzing themes
Progress 60%  → Analyzing methodologies  
Progress 80%  → Running LLM summarization (SLOW - can take 60-120s)
Progress 90%  → Finalizing report
Progress 100% → Complete!
```

**Dashboard messages to watch for:**
- "Generating synthesis report..."
- "Running summarization model on X chars..."
- "AI summary generated successfully"
- "Finalizing report structure..."

**If stuck at 80-90%:**
- Check backend logs: `tail -f logs/backend.log`
- Look for HuggingFace API errors or GPU OOM
- First run downloads model (~2GB) - can take extra 2-3 minutes

## Dashboard Controls

- **Ctrl+C** - Exit dashboard (backend/frontend keep running)
- **Auto-refresh** - Updates every 0.5 seconds automatically

## Viewing Raw Logs

```bash
# Watch all logs simultaneously
tail -f logs/*.log

# Watch specific logs
tail -f logs/backend.log      # Backend API, pipeline execution
tail -f logs/frontend.log     # Frontend dev server
tail -f logs/pipeline_events.log  # Structured pipeline events (JSON)

# Search logs
grep -i "error" logs/backend.log
grep "stage_complete" logs/pipeline_events.log
grep "GPU" logs/backend.log
```

## Testing the System

### 1. Test Dashboard Event Display
```bash
./test_dashboard_events.sh
# Creates 13 test events
# Dashboard should show them immediately in Pipeline Events panel
```

### 2. Test Full Pipeline
```bash
# 1. Ensure system is running: ./run.sh
# 2. Open frontend: http://localhost:3000
# 3. Enter keywords: "machine learning", "deep learning"  
# 4. Click "Start Review"
# 5. Watch dashboard for real-time progress
# 6. After stage 7: Frontend auto-navigates to results
```

### 3. Test Navigation to Results
```bash
# After pipeline completes:
# ✓ Frontend shows "Results" view
# ✓ Can browse: Papers, Themes, Methodologies, Rankings, Report, PDF
# ✓ Can download PDF
# ✓ Can filter and search papers
```

## Integration: Dashboard + Frontend

**Dashboard** (http://localhost:8000 + terminal UI)
- Technical monitoring and debugging
- Real-time logs and errors
- GPU/LLM metrics
- Pipeline event stream

**Frontend** (http://localhost:3000)
- User-facing UI with glassmorphism design
- Interactive pipeline progress
- Results browser with beautiful bento layout
- PDF preview and download

**Best Practice:** Keep both open side-by-side during development

## Stopping the System

```bash
# Stop everything (backend + frontend)
./stop.sh

# Stop dashboard only (Ctrl+C in dashboard terminal)
# Backend and frontend continue running

# Stop specific service
kill $(cat logs/backend.pid)   # Stop backend only
kill $(cat logs/frontend.pid)  # Stop frontend only
```

## Files and Locations

```
logs/
├── backend.log           # Backend API logs
├── frontend.log          # Frontend dev server logs
├── pipeline_events.log   # Structured JSON events (for dashboard)
├── backend.pid           # Backend process ID
└── frontend.pid          # Frontend process ID

backend/.env              # API keys (HUGGINGFACE_API_KEY, etc.)
output/                   # Generated PDF reports
dashboard.py              # Dashboard script
run.sh                    # Startup script
stop.sh                   # Shutdown script
```

## Quick Fixes

| Problem | Solution |
|---------|----------|
| Dashboard blank | Run a pipeline or use `./test_dashboard_events.sh` |
| Backend won't start | Check `backend/.env` has API keys, wait 60s for GPU init |
| Stage 6 stuck | Normal - LLM takes 60-180s, check logs for progress |
| GPU out of memory | Reduce batch size or use CPU fallback (automatic) |
| WebSocket disconnected | Polling fallback activates automatically |
| Results not showing | Check browser console for setPdfPath logs |

## Support

For issues:
1. Check `logs/backend.log` for errors
2. Verify API keys in `backend/.env`
3. Test GPU: `nvidia-smi`
4. Review `DASHBOARD_FIX_SUMMARY.md` for architecture details

---

**Dashboard v2.0** - Real-time monitoring for LitReview Literature Review System
**Updated:** 2025-11-02 - Fixed backend startup timing, verified event monitoring
