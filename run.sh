#!/bin/bash

# LitReview Application Launcher
# Starts both backend and frontend servers

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ASCII Art
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                           ║${NC}"
echo -e "${BLUE}║         ${GREEN}LitReview Application${BLUE}           ║${NC}"
echo -e "${BLUE}║    ${YELLOW}Automated Literature Review System${BLUE}   ║${NC}"
echo -e "${BLUE}║                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}📂 Project Directory:${NC} $SCRIPT_DIR"
echo ""

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  No backend/.env file found${NC}"
    echo -e "${YELLOW}   Creating from .env.example...${NC}"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}   ✓ Created backend/.env${NC}"
        echo -e "${YELLOW}   Please edit backend/.env and add your API keys!${NC}"
    fi
    echo ""
fi

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}⚠️  Python virtual environment not found${NC}"
    echo -e "${YELLOW}   Running setup.sh...${NC}"
    ./setup.sh
    echo ""
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not found${NC}"
    echo -e "${YELLOW}   Installing npm packages...${NC}"
    cd frontend
    npm install --include=dev
    cd ..
    echo ""
fi

# Kill any existing processes on ports 8000 and 3000
echo -e "${BLUE}🔍 Checking for existing processes...${NC}"
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}   Killing process on port 8000...${NC}"
    kill $(lsof -t -i:8000) 2>/dev/null || true
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}   Killing process on port 3000...${NC}"
    kill $(lsof -t -i:3000) 2>/dev/null || true
fi

sleep 1
echo ""

# Create log directory
mkdir -p logs

# Start backend
echo -e "${BLUE}🚀 Starting Backend Server...${NC}"
cd backend
source venv/bin/activate
nohup python main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}   ✓ Backend started (PID: $BACKEND_PID)${NC}"
echo -e "${GREEN}   📝 Logs: logs/backend.log${NC}"
cd ..

# Wait for backend to start
echo -e "${BLUE}   Waiting for backend to initialize (GPU loading may take 30-60s)...${NC}"
RETRY_COUNT=0
MAX_RETRIES=30
DOTS=""
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}   ✓ Backend is healthy${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo ""
        echo -e "${RED}   ✗ Backend failed to start after ${MAX_RETRIES} retries (60s)!${NC}"
        echo -e "${RED}   Check logs/backend.log for errors${NC}"
        echo ""
        echo -e "${YELLOW}Last 30 lines of backend log:${NC}"
        tail -30 logs/backend.log
        exit 1
    fi
    # Show progress dots
    DOTS="${DOTS}."
    echo -ne "\r   Initializing${DOTS} (${RETRY_COUNT}/${MAX_RETRIES})"
    sleep 2
done

echo -e "${GREEN}   ✓ Backend is healthy!${NC}"
echo ""

# Start frontend
echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
cd frontend
nohup npx vite > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}   ✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo -e "${GREEN}   📝 Logs: logs/frontend.log${NC}"
cd ..

# Wait for frontend to start
echo -e "${BLUE}   Waiting for frontend to initialize...${NC}"
sleep 5

# Check if frontend is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${YELLOW}   ⚠️  Frontend may still be starting...${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ LitReview is now RUNNING!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📍 Access Points:${NC}"
echo -e "   Frontend UI:  ${YELLOW}http://localhost:3000${NC}"
echo -e "   Backend API:  ${YELLOW}http://localhost:8000${NC}"
echo -e "   API Docs:     ${YELLOW}http://localhost:8000/docs${NC}"
echo ""
echo -e "${BLUE}📊 Process IDs:${NC}"
echo -e "   Backend:  ${YELLOW}$BACKEND_PID${NC}"
echo -e "   Frontend: ${YELLOW}$FRONTEND_PID${NC}"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   Backend:  ${YELLOW}tail -f logs/backend.log${NC}"
echo -e "   Frontend: ${YELLOW}tail -f logs/frontend.log${NC}"
echo ""
echo -e "${BLUE}🛑 To Stop:${NC}"
echo -e "   ${YELLOW}kill $BACKEND_PID $FRONTEND_PID${NC}"
echo -e "   Or: ${YELLOW}./stop.sh${NC}"
echo ""
echo -e "${GREEN}🎉 Ready to create automated literature reviews!${NC}"
echo -e "${GREEN}   Open ${YELLOW}http://localhost:3000${GREEN} in your browser${NC}"
echo ""

# Save PIDs to file for stop script
echo "BACKEND_PID=$BACKEND_PID" > .pids
echo "FRONTEND_PID=$FRONTEND_PID" >> .pids

# Ask user for dashboard preference
echo -e "${BLUE}═════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Launch interactive dashboard? (Recommended)${NC}"
echo -e "${BLUE}═════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}1)${NC} Yes - Dashboard in new window (detached)"
echo -e "  ${GREEN}2)${NC} Yes - Dashboard in this terminal"
echo -e "  ${YELLOW}3)${NC} No  - Show plain log output"
echo ""
read -p "Choice [1]: " choice
choice=${choice:-1}

echo ""

# Install Python rich library if needed
if ! python3 -c "import rich" 2>/dev/null; then
    echo -e "${BLUE}📦 Installing dashboard dependencies...${NC}"
    python3 -m pip install rich requests -q
    echo ""
fi

if [ "$choice" = "1" ]; then
    echo -e "${GREEN}🎨 Launching Dashboard in new window...${NC}"
    echo ""
    
    # Try to find a terminal emulator
    TERM_CMD=""
    if command -v gnome-terminal &> /dev/null; then
        TERM_CMD="gnome-terminal --title='LitReview Dashboard' -- bash -c"
    elif command -v konsole &> /dev/null; then
        TERM_CMD="konsole --title 'LitReview Dashboard' -e bash -c"
    elif command -v xterm &> /dev/null; then
        TERM_CMD="xterm -title 'LitReview Dashboard' -e bash -c"
    elif command -v x-terminal-emulator &> /dev/null; then
        TERM_CMD="x-terminal-emulator -e bash -c"
    fi
    
    if [ -n "$TERM_CMD" ]; then
        $TERM_CMD "cd '$SCRIPT_DIR' && python3 dashboard.py; exec bash" &
        echo -e "${GREEN}✓ Dashboard launched in new window${NC}"
        echo -e "${BLUE}  If window doesn't appear, run manually: python3 dashboard.py${NC}"
    else
        echo -e "${YELLOW}⚠️  No terminal emulator found, running in current terminal...${NC}"
        sleep 1
        python3 dashboard.py
    fi
    
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✨ LitReview is RUNNING!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}👉 Next steps:${NC}"
    echo -e "   1. Check the Dashboard window for live monitoring"
    echo -e "   2. Open ${YELLOW}http://localhost:3000${NC} in your browser"
    echo -e "   3. Start your first literature review!"
    echo ""
    echo -e "${BLUE}💡 Tip:${NC} Keep the dashboard open to monitor pipeline progress"
    echo ""
    
elif [ "$choice" = "2" ]; then
    echo -e "${GREEN}🎨 Launching Dashboard...${NC}"
    echo ""
    sleep 1
    
    # Launch dashboard in current terminal
    python3 dashboard.py
    
elif [ "$choice" = "3" ]; then
    echo -e "${BLUE}Showing combined logs (Ctrl+C to exit):${NC}"
    echo ""
    
    # Optional: Tail logs (user can Ctrl+C to exit)
    trap 'echo ""; echo "Servers still running. Use ./stop.sh to stop them."; exit 0' INT
    tail -f logs/backend.log logs/frontend.log
fi
