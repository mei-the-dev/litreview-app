# Stage Cards Improvement - Quick Reference

## 🎯 What Changed

### Before
- Stage cards showed only current state
- No history of what happened
- Stage 6 was a "black box"
- Updates overwrote previous information

### After
- ✅ Complete update history (max 50 entries)
- ✅ Expandable timeline showing all updates
- ✅ Stage 6 shows 7 detailed sub-tasks
- ✅ Updates accumulate instead of overwriting
- ✅ Auto-expand Stage 6 for transparency
- ✅ Visual pulse on new updates

## 🔑 Key Features

### 1. Update History Timeline
**Location:** Any stage card → "Show Details" button

**Shows:**
- Vertical timeline with icons (✓ complete, ⟳ running, ○ pending)
- Timestamps for each update
- Progress percentages
- Data highlights (theme names, methods, etc.)
- Last 10 unique updates

### 2. Stage 6 Progress Checklist
**Location:** Stage 6 card (auto-expands when running)

**7 Sub-tasks:**
1. Initialization (5%)
2. Overview (20%)
3. Theme Analysis (25-55%)
4. Methodology Grouping (58-68%)
5. Top Papers Compilation (70-75%)
6. AI Synthesis (75-90%)
7. Finalization (95-100%)

**Shows per sub-task:**
- Status icon
- Progress indicator
- Theme/method being processed
- AI model status ("Loading model...", "Running inference...")
- Paper counts, theme counts, etc.

### 3. Pipeline Summary Header
**Location:** Top of pipeline view (above stage cards)

**Displays:**
- Overall progress bar (average across all stages)
- Elapsed time (updates every second)
- Completed stages count (e.g., "4/7 Stages")
- Current stage name and message

### 4. Enhanced Layout
**Desktop (> 1024px):**
- Stage 1: 2x1 (wide)
- Stage 2-5: 1x1 (compact)
- **Stage 6: 2x2 (large, row-span-2)** ← Key change
- Stage 7: 2x1 (wide)

**Responsive:**
- Tablet: 2 columns
- Mobile: 1 column (stacked)

## 🎨 Visual Enhancements

### Animations
- **Pulse on update:** Card briefly scales to 1.02 when new data arrives
- **Expand/collapse:** Smooth height transition with AnimatePresence
- **Progress bars:** Animated width changes (0.5s ease-out)
- **Timeline items:** Staggered fade-in (50ms delay each)

### Color Coding
- **Running:** Primary gold (#FF9D5C) with ring glow
- **Completed:** Success green with subtle shadow
- **Error:** Danger red with prominent shadow
- **Pending:** Gray (neutral)

## 💾 Persistent State

### localStorage Keys
- `stage-1-expanded` through `stage-7-expanded`
- Stores: `true` or `false`
- Persists across browser sessions

### Auto-Behaviors
- Stage 6 auto-expands when `status === 'running'`
- Manual expansions are remembered
- History accumulates during pipeline run
- History preserved after completion

## 🧪 Testing Checklist

### Manual Testing
1. Start app: `./run.sh`
2. Navigate to: `http://localhost:3000`
3. Run pipeline: Enter "machine learning" as query
4. Observe:
   - [ ] Summary header appears with elapsed time
   - [ ] Stage 6 auto-expands
   - [ ] Progress checklist shows sub-tasks
   - [ ] New updates trigger pulse animation
   - [ ] Can manually expand other stages
   - [ ] Timeline shows update history
   - [ ] Expansion state persists on refresh
   - [ ] Stage 6 card is larger than others
   - [ ] Layout is responsive (test mobile/tablet)

### Data Validation
1. Open browser console
2. Check: `localStorage.getItem('stage-6-expanded')`
3. Inspect: Pipeline store updateHistory array
4. Verify: History limited to 50 items
5. Confirm: Timestamps are ISO 8601 format

## 🛠️ Developer Reference

### Data Structure
```typescript
interface StageUpdateHistoryEntry {
  timestamp: string;      // ISO 8601
  progress: number;       // 0-100
  message: string;        // Human-readable status
  data?: {                // Stage-specific data
    sub_task?: string;    // Stage 6 sub-task ID
    current_theme?: string;
    current_method?: string;
    theme_count?: number;
    // ... more fields
  };
}

interface PipelineStage {
  id: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  message: string;
  result?: any;
  data?: any;
  updateHistory: StageUpdateHistoryEntry[];
  lastUpdate?: StageUpdateHistoryEntry;
  startTime?: number;
  endTime?: number;
}
```

### Accessing Update History
```typescript
// In component
const { stages } = usePipelineStore();
const stage6 = stages.find(s => s.id === 6);

// Get all updates
const allUpdates = stage6.updateHistory;

// Get latest update
const latest = stage6.lastUpdate;

// Get specific sub-task updates
const themeUpdates = allUpdates.filter(
  u => u.data?.sub_task === 'theme_analysis'
);
```

### Adding New Sub-Task
```typescript
// In StageProgressChecklist.tsx
const STAGE_6_SUBTASKS = [
  // ... existing
  { id: 'new_subtask', label: 'New Sub-task', minProgress: 85 },
];
```

## 📊 Performance Notes

### Memory Usage
- ~100 bytes per history entry
- Max 50 entries per stage
- 7 stages × 50 entries × 100 bytes = ~35KB
- Negligible impact on performance

### Render Optimization
- Timeline only renders when expanded
- `AnimatePresence` manages unmounting
- CSS transforms are GPU-accelerated
- No virtual scrolling needed (max 10 items shown)

### Best Practices
- History limit prevents memory leaks
- Circular buffer implementation
- Debounced animations (600ms cooldown)
- localStorage operations are async-safe

## 🐛 Troubleshooting

### Issue: Stage 6 not auto-expanding
**Fix:** Check that stage.status === 'running' and stage.id === 6

### Issue: Update history not accumulating
**Fix:** Verify WebSocket is passing `data` field in updates

### Issue: localStorage not persisting
**Fix:** Check browser privacy settings, try incognito mode

### Issue: Animations laggy
**Fix:** Reduce prefers-reduced-motion, check GPU acceleration

### Issue: Timeline empty
**Fix:** Verify updateHistory array has entries, check WebSocket connection

## 📚 Related Files

**Components:**
- `frontend/src/components/bento/StageBentoCard.tsx` - Main card
- `frontend/src/components/bento/StageUpdateTimeline.tsx` - Timeline view
- `frontend/src/components/bento/StageProgressChecklist.tsx` - Stage 6 checklist
- `frontend/src/components/bento/PipelineSummaryHeader.tsx` - Summary header

**State:**
- `frontend/src/stores/pipelineStore.ts` - Pipeline state management
- `frontend/src/types/pipeline.types.ts` - Type definitions

**Hooks:**
- `frontend/src/hooks/useWebSocket.ts` - WebSocket integration

**Documentation:**
- `STAGE_CARDS_IMPROVEMENT_COMPLETE.md` - Full implementation doc
- `stage-cards-improvement-marko.json` - MARKO planning document

## 🎓 Key Learnings

1. **Accumulating vs Overwriting:** Maintaining history provides better UX
2. **Auto-Expansion:** Reduces user effort for common workflows
3. **Visual Feedback:** Pulse animations make interface feel responsive
4. **Persistent State:** localStorage improves multi-session UX
5. **Asymmetric Layouts:** Large cards for complex stages improve readability

## 🚀 Future Enhancements

### Phase 5 (Optional)
- [ ] Export pipeline trace as JSON
- [ ] Replay mode (accelerated visualization)
- [ ] Search/filter within history
- [ ] Compare two pipeline runs
- [ ] Mini-map showing all stages

### Additional Ideas
- [ ] Keyboard shortcuts (Space to expand/collapse)
- [ ] Dark/light mode toggle for timeline
- [ ] Print-friendly view
- [ ] Share pipeline URL with embedded state
- [ ] Download update history as CSV

---

**Version:** 1.0
**Last Updated:** 2025-11-03
**Status:** Production Ready
