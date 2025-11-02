# Navigation Issue - Root Cause Analysis

**Date:** 2025-11-02  
**Issue:** Frontend does not navigate to results view after pipeline completion

## Root Cause

The pipeline DOES complete successfully (all 7 stages), but the **WebSocket connection closes/times out before stages 6 and 7 complete**, preventing the frontend from receiving the completion events.

### Evidence

1. **Pipeline Status API shows completion:**
   - Session: `87297d14-fb7e-4850-9169-bf3bbd1ce565`
   - Status: `completed`
   - PDF generated: `backend/output/literature_review_20251102_184129.pdf` ✅
   - Report generated: ✅
   - All data present: ✅

2. **WebSocket test shows timeout:**
   ```
   Stage 6: 80% - Generating AI insights...
   ⏱️ Timeout waiting for messages
   ```
   - Stages 1-5 complete successfully
   - Stage 6 starts but client doesn't receive completion
   - Stage 7 never seen by client
   - Pipeline actually completes on backend

3. **PDF files exist:**
   - Multiple PDFs in `backend/output/`
   - Latest: `literature_review_20251102_184129.pdf` (22K)
   - Matches timestamp in API response

## Why WebSocket Closes Early

The issue is likely:

1. **Long-running AI operations**: Stage 6 calls `hf_client.summarize()` which can take 30+ seconds
2. **WebSocket timeout**: Default timeout in test script (120s) may be insufficient
3. **Network keep-alive**: WebSocket may close due to inactivity during long AI calls
4. **Background task isolation**: Pipeline runs in asyncio background task, may not properly emit events if connection drops

## Data Flow Issues Fixed

We DID fix important data flow issues:

✅ Added `data` parameter to `send_stage_complete()`  
✅ Stage 1 now sends full `papers` array in data  
✅ Stage 3 sends `themes` dictionary  
✅ Stage 4 sends `methodologies` dictionary  
✅ Stage 5 sends `ranked_papers` array  
✅ Stage 6 sends `report` object  
✅ Stage 7 sends `pdf_path` in result  

## Solution

### Option 1: Increase WebSocket Robustness (RECOMMENDED)

1. **Add ping/pong keep-alive** during long operations
2. **Send progress updates more frequently** during AI operations
3. **Handle WebSocket reconnection** on frontend
4. **Store pipeline state** so frontend can resume after reconnection

### Option 2: Polling Fallback

1. Frontend polls `/api/pipeline/status/{session_id}` if WebSocket closes
2. Once status is "completed", fetch results and navigate
3. Less real-time but more reliable

### Option 3: Server-Sent Events (SSE)

1. Replace WebSocket with SSE for one-way updates
2. More reliable for long-running operations
3. Automatic reconnection built-in

## Immediate Fix

Add polling fallback to frontend:

```typescript
// In useWebSocket.ts
ws.onclose = () => {
  // Start polling if pipeline is running
  if (isRunning) {
    const pollInterval = setInterval(async () => {
      const status = await fetch(`/api/pipeline/status/${sessionId}`);
      const data = await status.json();
      
      if (data.status === 'completed') {
        // Navigate to results
        setPdfPath(data.result.pdf_path);
        clearInterval(pollInterval);
      }
    }, 5000);
  }
};
```

## Testing Results

✅ All unit tests pass (18/18)  
✅ Pipeline completes successfully  
✅ PDF generation works  
✅ Data structures properly sent  
⚠️ WebSocket times out before completion  
❌ Frontend doesn't receive stage 6/7 events  
❌ Navigation doesn't trigger  

## Next Steps

1. **Implement polling fallback** (Quick fix - 30 min)
2. **Improve WebSocket robustness** (Better fix - 2 hours)
3. **Add stage 6/7 timeout handling** (Prevent hanging)
4. **Test with real Hugging Face API** (Verify timing)

## Files Modified Today

- ✅ `backend/core/websocket_manager.py` - Added data parameter
- ✅ `backend/domain/pipeline/stage_1_fetch.py` - Send papers data
- ✅ `backend/domain/pipeline/stage_3_themes.py` - Send themes data
- ✅ `backend/domain/pipeline/stage_4_methodology.py` - Send methodologies data
- ✅ `backend/domain/pipeline/stage_5_ranking.py` - Send ranked_papers data
- ✅ `backend/domain/pipeline/stage_6_synthesis.py` - Send report data
- ✅ `frontend/src/stores/pipelineStore.ts` - Added navigation logging
- ✅ `frontend/src/hooks/useWebSocket.ts` - Added stage 7 logging
- ✅ `frontend/src/App.tsx` - Added view change logging

## Conclusion

The **navigation logic is correct** and would work if the WebSocket stayed connected. The real issue is **WebSocket connection reliability during long-running operations**. 

The fixes we implemented today **improve data completeness** and will work once we solve the WebSocket timeout issue.

**Recommended immediate action:** Implement polling fallback in useWebSocket.ts as a temporary solution while we improve WebSocket robustness.
