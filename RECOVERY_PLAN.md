# Recovery & System Assessment Plan

## Current Status (2025-11-02)

### System State
- **Branch**: feature/ux-testing
- **Backend**: ✅ Running (PID 80904, port 8000)
- **Frontend**: ❌ Not running (Vite dependency issue)
- **Tests**: ✅ 55/55 passing
- **APIs**: ✅ Both working (Semantic Scholar + HuggingFace)

### Root Cause Analysis

The user requested "better reasoning" because:
1. Frontend keeps failing to start
2. Multiple feature branches exist but unclear status
3. Tests pass but frontend doesn't work
4. Need holistic view, not just fixing symptoms

## Strategic Assessment

### What Actually Needs to Happen

1. **Fix Frontend Dependencies** (Critical)
   - Problem: Vite can't find itself despite node_modules existing
   - Solution: Clean reinstall of npm dependencies
   - Impact: Frontend will start properly

2. **Clarify Branch Strategy** (Important)
   - Current branches:
     * master (baseline)
     * feature/ux-testing (current, working backend)
     * feature/ux-pipeline-results-presentation (older)
     * feature/rendering-navigation-tests (older)
   - Decision needed: Which branch should be primary?

3. **End-to-End Validation** (Critical)
   - Backend works ✅
   - Frontend needs to start ✅
   - Full pipeline test needed ✅
   - UX/presentation validation needed ✅

4. **Documentation Alignment** (Important)
   - Multiple COMPLETE.md, STATUS.md files
   - Need single source of truth
   - MARKO framework is good but docs scattered

## Recommended Action Plan

### Phase 1: Stabilize Frontend (15 min)
```bash
# 1. Clean frontend dependencies
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 2. Verify Vite works
npx vite --version

# 3. Test frontend start
npm run dev
```

### Phase 2: Validate Full System (10 min)
```bash
# 1. Stop all processes
./stop.sh

# 2. Fresh start with monitoring
./run.sh

# 3. Run full test suite
cd backend
source venv/bin/activate
python -m pytest tests/ -v

# 4. Manual E2E test
# - Open http://localhost:3000
# - Enter query: "machine learning transformers"
# - Verify all 7 stages complete
# - Check PDF download works
```

### Phase 3: Branch Cleanup (5 min)
```bash
# 1. Commit current work
git add -A
git commit -m "fix: frontend dependencies and complete UX testing"

# 2. Evaluate other branches
git diff master..feature/ux-pipeline-results-presentation
git diff master..feature/rendering-navigation-tests

# 3. Decision: Merge or delete old branches
# If ux-testing is most complete:
git checkout master
git merge feature/ux-testing
git push origin master

# Delete stale branches:
git branch -d feature/ux-pipeline-results-presentation
git branch -d feature/rendering-navigation-tests
```

### Phase 4: Final Validation (10 min)
```bash
# 1. Fresh clone simulation
cd /tmp
git clone /home/mei/Downloads/litreview-app test-clone
cd test-clone

# 2. Follow QUICKSTART.md
./setup.sh
./run.sh

# 3. Verify works for new user
```

## Decision Matrix

### Should We...

| Action | Do It? | Reason |
|--------|--------|--------|
| Fix frontend deps | ✅ YES | Critical blocker |
| Merge to master | ✅ YES | Code is stable, tests pass |
| Delete old branches | ⚠️ MAYBE | Check if they have unique work |
| Add Playwright E2E | ❌ NO | Nice-to-have, not blocking |
| Refactor docs | ⚠️ MAYBE | Many MD files, could consolidate |
| Deploy to production | ❌ NO | Not requested yet |

## Success Criteria

After execution, we should have:
1. ✅ Frontend starts without errors
2. ✅ Full pipeline works end-to-end
3. ✅ Single primary branch (master) with all features
4. ✅ Clear, consolidated documentation
5. ✅ New user can run `./setup.sh && ./run.sh` successfully

## Risk Assessment

### Low Risk
- Frontend dependency fix (standard npm operation)
- Running existing tests (already passing)

### Medium Risk
- Branch merging (could have conflicts)
- Deleting old branches (might lose work)

### High Risk
- None identified (system is stable)

## Next Steps

Ask user:
1. **Immediate**: Should I fix frontend dependencies and test full system?
2. **Branch Strategy**: Merge ux-testing to master and delete old branches?
3. **Documentation**: Consolidate into single STATUS.md?
4. **Testing**: Run full E2E test with both APIs?

