# Frontend E2E Testing & Monitoring

## Overview
Comprehensive frontend E2E testing infrastructure using Playwright with real-time error monitoring and dashboard integration.

## Features Added

### 1. Console Monitoring (`frontend/src/utils/consoleMonitor.ts`)
- Intercepts all console.error, console.warn, console.info calls
- Streams logs to backend via `/api/monitoring/frontend-log`
- Captures unhandled errors and promise rejections
- Non-blocking - won't break app if backend unavailable

### 2. Error Boundary (`frontend/src/components/ErrorBoundary.tsx`)
- Catches React component errors
- Sends error telemetry to backend
- Shows user-friendly error message with reload option
- Captures component stack traces

### 3. Backend Monitoring Endpoint (`backend/api/routers/monitoring_router.py`)
- `POST /api/monitoring/frontend-log` - Receive frontend logs
- `GET /api/monitoring/frontend-logs` - Retrieve recent logs
- `GET /api/monitoring/health-detailed` - Detailed health check
- Logs saved to `logs/frontend.log`

### 4. Playwright E2E Tests

#### `frontend/tests/e2e/pipeline-to-results.e2e.spec.ts`
- Complete pipeline execution with result navigation
- WebSocket connection and message verification
- Console error detection
- Idle state verification

#### `frontend/tests/e2e/results-interaction.e2e.spec.ts`
- Search and filter papers
- Navigate through all result tabs
- Verify charts render (Theme, Methodology views)
- PDF download button accessibility

#### `frontend/tests/e2e/error-scenarios.e2e.spec.ts`
- Empty search handling
- Backend unavailable scenario
- WebSocket disconnection handling
- Rapid navigation stress test
- Responsive design (mobile viewport)
- Memory leak detection

### 5. Dashboard Integration
The existing `dashboard.py` already watches `logs/frontend.log` and displays:
- Frontend logs panel
- Error highlighting (red)
- Warning highlighting (yellow)
- Real-time log streaming

### 6. Comprehensive Test Runner (`run_comprehensive_tests.sh`)
- Runs backend unit tests
- Runs backend E2E tests
- Runs frontend E2E tests with Playwright
- Analyzes logs for errors and warnings
- Detects degraded state (HF API fallback)
- Provides detailed summary with color coding
- Returns appropriate exit codes for CI/CD

## Usage

### Running Tests

**All tests with log analysis:**
```bash
./run_comprehensive_tests.sh
```

**Frontend E2E tests only:**
```bash
cd frontend
npm run test:e2e
```

**With UI mode (interactive):**
```bash
cd frontend
npm run test:e2e:ui
```

**Debug mode (step through):**
```bash
cd frontend
npm run test:e2e:debug
```

**Headed mode (see browser):**
```bash
cd frontend
npm run test:e2e:headed
```

### Monitoring

**Start services with dashboard:**
```bash
./run.sh
python3 dashboard.py  # In separate terminal
```

The dashboard will show:
- Real-time frontend logs
- Console errors from browser
- React error boundary triggers
- System status and health

### CI/CD Integration

Add to GitHub Actions (`.github/workflows/e2e-tests.yml`):
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: ./setup.sh
      - name: Start services
        run: ./run.sh &
      - name: Wait for services
        run: sleep 10
      - name: Run comprehensive tests
        run: ./run_comprehensive_tests.sh
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Architecture

### Data Flow
```
Browser Console → consoleMonitor.ts 
    ↓
    POST /api/monitoring/frontend-log
    ↓
    logs/frontend.log
    ↓
    dashboard.py (real-time display)
```

### Error Detection Levels
1. **Test Failures** - Playwright assertions fail
2. **Console Errors** - Browser console.error() calls
3. **React Errors** - Error boundary catches
4. **Network Errors** - Failed API calls
5. **Log Analysis** - Post-test log scanning

### Test Categories
- **Unit Tests** - Fast, mocked (< 0.5s)
- **Integration Tests** - Real components, mocked APIs (< 5s)
- **E2E Tests** - Full browser automation (< 60s per test)

## Troubleshooting

### Tests Failing with "Services not running"
Start services first:
```bash
./run.sh
```

### Playwright browsers not installed
```bash
cd frontend
npx playwright install chromium --with-deps
```

### Frontend logs not appearing in dashboard
1. Check `logs/frontend.log` exists
2. Verify frontend is making requests
3. Check console monitoring is initialized in `main.tsx`

### Tests pass but errors in logs
This is a **degraded state**. Common causes:
- HuggingFace API failures → using local models (slower)
- Network timeouts → retries succeeded but logged
- Non-critical warnings

Check logs:
```bash
grep -i "error" logs/backend.log | tail -20
grep -i "error" logs/frontend.log | tail -20
```

## Best Practices

### Writing New E2E Tests
1. Always capture console errors in `beforeEach`
2. Use `test.skip()` if prerequisites not met
3. Take screenshots on failure
4. Use meaningful locators (data-testid preferred)
5. Add waits for async operations
6. Test both happy path and error scenarios

### Debugging Failed Tests
1. Check screenshots in `frontend/test-results/`
2. Watch video recordings (if enabled)
3. Review console output in test logs
4. Use `--headed` mode to see browser
5. Use `--debug` mode to step through

### Performance
- Use mocks for fast tests (development)
- Use real APIs for full E2E (CI/CD, pre-deployment)
- Set appropriate timeouts (pipeline can take 60s+)
- Run tests in parallel when possible

## MARKO Integration

This implementation follows the `frontend-e2e-testing-marko.json` specification:
- ✅ Playwright setup and configuration
- ✅ Console monitoring and log streaming
- ✅ Error boundary with telemetry
- ✅ Backend monitoring endpoint
- ✅ Dashboard frontend logs panel
- ✅ Comprehensive E2E test scenarios
- ✅ Log analysis and error detection
- ✅ Test runner with detailed reporting

## Next Steps

1. **Visual Regression Testing** - Add screenshot comparison
2. **Performance Monitoring** - Track metrics over time
3. **Accessibility Testing** - Integrate @axe-core/playwright
4. **Chaos Testing** - Random failure injection
5. **Load Testing** - Multiple concurrent users

## References
- [Playwright Documentation](https://playwright.dev/)
- [Testing MARKO](./testing-marko.json)
- [Frontend E2E MARKO](./frontend-e2e-testing-marko.json)
- [Dashboard Documentation](./DASHBOARD.md)
