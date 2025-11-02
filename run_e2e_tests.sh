#!/bin/bash

# Comprehensive E2E Test Runner with Dashboard Integration
# This script starts backend, frontend, and runs E2E tests with monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=8000
FRONTEND_PORT=3000
BACKEND_PID_FILE=".pids/backend_e2e.pid"
FRONTEND_PID_FILE=".pids/frontend_e2e.pid"
LOG_DIR="logs"
TEST_RESULTS_DIR="frontend/test-results"

# Create necessary directories
mkdir -p .pids
mkdir -p "$LOG_DIR"
mkdir -p "$TEST_RESULTS_DIR"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      LitReview E2E Test Suite with Monitoring         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo "Stopping backend (PID: $BACKEND_PID)"
            kill $BACKEND_PID 2>/dev/null || true
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo "Stopping frontend (PID: $FRONTEND_PID)"
            kill $FRONTEND_PID 2>/dev/null || true
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # Kill any remaining processes on those ports
    lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}Cleanup complete${NC}"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Check if backend is already running
if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}Backend already running on port $BACKEND_PORT${NC}"
    BACKEND_ALREADY_RUNNING=true
else
    echo -e "${BLUE}Starting backend server...${NC}"
    cd backend
    source venv/bin/activate 2>/dev/null || true
    python main.py > "../$LOG_DIR/backend_e2e.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "../$BACKEND_PID_FILE"
    cd ..
    echo -e "${GREEN}Backend started (PID: $BACKEND_PID)${NC}"
    BACKEND_ALREADY_RUNNING=false
fi

# Check if frontend is already running
if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}Frontend already running on port $FRONTEND_PORT${NC}"
    FRONTEND_ALREADY_RUNNING=true
else
    echo -e "${BLUE}Starting frontend dev server...${NC}"
    cd frontend
    npm run dev > "../$LOG_DIR/frontend_e2e.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "../$FRONTEND_PID_FILE"
    cd ..
    echo -e "${GREEN}Frontend started (PID: $FRONTEND_PID)${NC}"
    FRONTEND_ALREADY_RUNNING=false
fi

# Wait for services to be ready
echo -e "\n${BLUE}Waiting for services to be ready...${NC}"

# Wait for backend
MAX_ATTEMPTS=30
ATTEMPT=0
while ! curl -s http://localhost:$BACKEND_PORT/health > /dev/null; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
        echo -e "${RED}Backend failed to start after $MAX_ATTEMPTS seconds${NC}"
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo -e "\n${GREEN}✓ Backend is ready${NC}"

# Wait for frontend
ATTEMPT=0
while ! curl -s http://localhost:$FRONTEND_PORT > /dev/null; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
        echo -e "${RED}Frontend failed to start after $MAX_ATTEMPTS seconds${NC}"
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo -e "${GREEN}✓ Frontend is ready${NC}"

# Run E2E tests
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Running E2E Tests                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo

cd frontend

# Run tests with proper error handling
TEST_EXIT_CODE=0
npm run test:e2e || TEST_EXIT_CODE=$?

cd ..

# Display results
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Test Results Summary                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ All E2E tests passed!${NC}"
else
    echo -e "${RED}✗ Some E2E tests failed (exit code: $TEST_EXIT_CODE)${NC}"
fi

# Check for test artifacts
if [ -d "$TEST_RESULTS_DIR" ]; then
    echo -e "\n${BLUE}Test artifacts:${NC}"
    ls -lh "$TEST_RESULTS_DIR"/*.png 2>/dev/null || echo "  No screenshots"
fi

# Check for Playwright HTML report
if [ -d "frontend/playwright-report" ]; then
    echo -e "\n${BLUE}HTML Report available:${NC} frontend/playwright-report/index.html"
    echo -e "${YELLOW}View with:${NC} cd frontend && npx playwright show-report"
fi

# Check logs for errors
echo -e "\n${BLUE}Checking logs for errors...${NC}"
BACKEND_ERRORS=$(grep -i "error" "$LOG_DIR/backend_e2e.log" 2>/dev/null | wc -l || echo 0)
FRONTEND_ERRORS=$(grep -i "error" "$LOG_DIR/frontend.log" 2>/dev/null | wc -l || echo 0)

echo "  Backend errors: $BACKEND_ERRORS"
echo "  Frontend errors: $FRONTEND_ERRORS"

if [ $BACKEND_ERRORS -gt 0 ]; then
    echo -e "\n${YELLOW}Recent backend errors:${NC}"
    grep -i "error" "$LOG_DIR/backend_e2e.log" 2>/dev/null | tail -5 || true
fi

if [ $FRONTEND_ERRORS -gt 0 ]; then
    echo -e "\n${YELLOW}Recent frontend errors:${NC}"
    grep -i "error" "$LOG_DIR/frontend.log" 2>/dev/null | tail -5 || true
fi

# Don't cleanup if servers were already running
if [ "$BACKEND_ALREADY_RUNNING" = true ] || [ "$FRONTEND_ALREADY_RUNNING" = true ]; then
    echo -e "\n${YELLOW}Note: Servers were already running, not stopping them${NC}"
    trap - EXIT INT TERM
fi

echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              E2E Test Run Complete                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

exit $TEST_EXIT_CODE
