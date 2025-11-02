#!/bin/bash

echo "🧪 LitReview - Comprehensive Test Suite with Log Analysis"
echo "=========================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Check services
echo "🔍 Checking services..."
BACKEND_RUNNING=false
FRONTEND_RUNNING=false

if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${RED}❌ Backend is not running${NC}"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Frontend is not running${NC}"
fi

echo ""
echo "================================================"
echo "📦 Backend Unit Tests"
echo "================================================"

cd backend
source venv/bin/activate 2>/dev/null || true

# Run unit tests
pytest tests/ -m "not e2e" -v --tb=short 2>&1 | tee ../test_output.log
BACKEND_UNIT_RESULT=$?

if [ $BACKEND_UNIT_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Backend unit tests passed${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Backend unit tests failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

cd ..

echo ""
echo "================================================"
echo "🌐 Backend E2E Tests"
echo "================================================"

if [ "$BACKEND_RUNNING" = true ]; then
    cd backend
    pytest tests/ -m "e2e" -v --tb=short 2>&1 | tee ../e2e_test_results.log
    BACKEND_E2E_RESULT=$?
    
    if [ $BACKEND_E2E_RESULT -eq 0 ]; then
        echo -e "${GREEN}✅ Backend E2E tests passed${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ Backend E2E tests failed${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    cd ..
else
    echo -e "${YELLOW}⚠️  Skipping E2E tests (backend not running)${NC}"
fi

echo ""
echo "================================================"
echo "🎨 Frontend E2E Tests"
echo "================================================"

if [ "$BACKEND_RUNNING" = true ] && [ "$FRONTEND_RUNNING" = true ]; then
    cd frontend
    
    # Check if Playwright is installed
    if [ ! -d "node_modules/@playwright" ]; then
        echo "📥 Installing Playwright..."
        npm install
    fi
    
    # Run E2E tests
    echo "Running Playwright E2E tests..."
    npx playwright test --reporter=list 2>&1 | tee ../frontend_e2e_results.log
    FRONTEND_E2E_RESULT=$?
    
    if [ $FRONTEND_E2E_RESULT -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend E2E tests passed${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ Frontend E2E tests failed${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        
        # Show Playwright report if available
        if [ -d "playwright-report" ]; then
            echo -e "${BLUE}📊 Playwright HTML report available: frontend/playwright-report/index.html${NC}"
        fi
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    cd ..
else
    echo -e "${YELLOW}⚠️  Skipping frontend E2E tests (services not running)${NC}"
    echo "   Start services with: ./run.sh"
fi

echo ""
echo "================================================"
echo "📋 Log Analysis"
echo "================================================"

ERROR_COUNT=0
WARNING_COUNT=0

# Analyze backend logs
if [ -f "logs/backend.log" ]; then
    echo "🔍 Analyzing backend logs..."
    BACKEND_ERRORS=$(grep -c "ERROR\|Exception\|failed" logs/backend.log 2>/dev/null || echo "0")
    BACKEND_WARNINGS=$(grep -c "WARNING\|fallback" logs/backend.log 2>/dev/null || echo "0")
    
    echo "  Backend errors: $BACKEND_ERRORS"
    echo "  Backend warnings: $BACKEND_WARNINGS"
    
    ERROR_COUNT=$((ERROR_COUNT + BACKEND_ERRORS))
    WARNING_COUNT=$((WARNING_COUNT + BACKEND_WARNINGS))
    
    if [ $BACKEND_ERRORS -gt 0 ]; then
        echo -e "${RED}Recent backend errors:${NC}"
        grep "ERROR\|Exception\|failed" logs/backend.log | tail -3
        echo ""
    fi
    
    # Check for HF API failures
    HF_FAILURES=$(grep -c "HF API failed\|falling back to local" logs/backend.log 2>/dev/null || echo "0")
    if [ $HF_FAILURES -gt 0 ]; then
        echo -e "${YELLOW}⚠️  HuggingFace API fallback detected: ${HF_FAILURES} times${NC}"
        echo "   System is in DEGRADED mode (using local models)"
        WARNINGS=$((WARNINGS + 1))
        echo ""
    fi
else
    echo "⚠️  No backend logs found"
fi

# Analyze frontend logs
if [ -f "logs/frontend.log" ]; then
    echo "🔍 Analyzing frontend logs..."
    FRONTEND_ERRORS=$(grep -c "ERROR\|error" logs/frontend.log 2>/dev/null || echo "0")
    FRONTEND_WARNINGS=$(grep -c "WARNING\|warn" logs/frontend.log 2>/dev/null || echo "0")
    
    echo "  Frontend errors: $FRONTEND_ERRORS"
    echo "  Frontend warnings: $FRONTEND_WARNINGS"
    
    ERROR_COUNT=$((ERROR_COUNT + FRONTEND_ERRORS))
    WARNING_COUNT=$((WARNING_COUNT + FRONTEND_WARNINGS))
    
    if [ $FRONTEND_ERRORS -gt 0 ]; then
        echo -e "${RED}Recent frontend errors:${NC}"
        grep "ERROR\|error" logs/frontend.log | tail -3
        echo ""
    fi
else
    echo "ℹ️  No frontend logs found (normal if no frontend activity)"
fi

echo ""
echo "================================================"
echo "📊 Test Summary"
echo "================================================"

echo ""
echo "Tests Run: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""
echo "Log Analysis:"
echo -e "${RED}Errors: $ERROR_COUNT${NC}"
echo -e "${YELLOW}Warnings: $WARNING_COUNT${NC}"
echo -e "${YELLOW}System Warnings: $WARNINGS${NC}"
echo ""

# Final verdict
if [ $FAILED_TESTS -eq 0 ] && [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     🎉 ALL TESTS PASSED & NO ERRORS 🎉    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    EXIT_CODE=0
elif [ $FAILED_TESTS -eq 0 ] && [ $ERROR_COUNT -gt 0 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║   ⚠️  TESTS PASSED BUT ERRORS IN LOGS ⚠️  ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Review logs for details:"
    echo "  - logs/backend.log"
    echo "  - logs/frontend.log"
    EXIT_CODE=1
else
    echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║         ❌ SOME TESTS FAILED ❌            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Check test output above and logs for details"
    EXIT_CODE=1
fi

echo ""
echo "Artifacts:"
echo "  - Test outputs: test_output.log, e2e_test_results.log"
echo "  - Frontend report: frontend/playwright-report/"
echo "  - Logs: logs/backend.log, logs/frontend.log"
echo ""

exit $EXIT_CODE
