#!/bin/bash

# LitReview Application Stopper
# Stops both backend and frontend servers

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}🛑 Stopping LitReview Application...${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Read PIDs from file if exists
if [ -f ".pids" ]; then
    source .pids
    
    if [ ! -z "$BACKEND_PID" ]; then
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo -e "${BLUE}Stopping Backend (PID: $BACKEND_PID)...${NC}"
            kill $BACKEND_PID 2>/dev/null || true
            echo -e "${GREEN}✓ Backend stopped${NC}"
        else
            echo -e "${BLUE}Backend already stopped${NC}"
        fi
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo -e "${BLUE}Stopping Frontend (PID: $FRONTEND_PID)...${NC}"
            kill $FRONTEND_PID 2>/dev/null || true
            echo -e "${GREEN}✓ Frontend stopped${NC}"
        else
            echo -e "${BLUE}Frontend already stopped${NC}"
        fi
    fi
    
    rm .pids
fi

# Also kill any processes on ports 8000 and 3000 as backup
echo ""
echo -e "${BLUE}Checking ports 8000 and 3000...${NC}"

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${BLUE}Killing remaining process on port 8000...${NC}"
    kill $(lsof -t -i:8000) 2>/dev/null || true
    echo -e "${GREEN}✓ Port 8000 cleared${NC}"
else
    echo -e "${GREEN}✓ Port 8000 is free${NC}"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${BLUE}Killing remaining process on port 3000...${NC}"
    kill $(lsof -t -i:3000) 2>/dev/null || true
    echo -e "${GREEN}✓ Port 3000 cleared${NC}"
else
    echo -e "${GREEN}✓ Port 3000 is free${NC}"
fi

echo ""
echo -e "${GREEN}✅ LitReview has been stopped${NC}"
echo ""
echo -e "${BLUE}To start again, run: ${GREEN}./run.sh${NC}"
echo ""
