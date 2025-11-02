#!/bin/bash

# LitReview Dashboard Launcher
# Launch the interactive dashboard separately

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                           ║${NC}"
echo -e "${BLUE}║    ${GREEN}LitReview Dashboard Monitor${BLUE}         ║${NC}"
echo -e "${BLUE}║                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if servers are running
if [ ! -f ".pids" ]; then
    echo -e "${RED}❌ No running servers detected!${NC}"
    echo -e "${YELLOW}   Run ./run.sh first to start the application${NC}"
    echo ""
    exit 1
fi

# Check if logs exist
if [ ! -d "logs" ]; then
    echo -e "${RED}❌ Logs directory not found!${NC}"
    echo -e "${YELLOW}   Run ./run.sh first to start the application${NC}"
    echo ""
    exit 1
fi

# Install Python rich library if needed
if ! python3 -c "import rich" 2>/dev/null; then
    echo -e "${BLUE}📦 Installing dashboard dependencies...${NC}"
    python3 -m pip install rich requests -q
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Launch dashboard
echo -e "${GREEN}🚀 Launching Dashboard...${NC}"
echo ""
sleep 1

python3 dashboard.py
