#!/bin/bash

# LitReview Test Runner
# Runs comprehensive test suite with options for unit and E2E tests

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                            ║${NC}"
echo -e "${BLUE}║        ${GREEN}LitReview Test Suite${BLUE}              ║${NC}"
echo -e "${BLUE}║                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Run ./setup.sh first${NC}"
    exit 1
fi

# Activate venv
source venv/bin/activate

# Install test dependencies
echo -e "${BLUE}📦 Installing test dependencies...${NC}"
pip install -r requirements-test.txt -q

echo ""
echo -e "${GREEN}Choose test mode:${NC}"
echo -e "  ${BLUE}1)${NC} Unit tests only (fast, mocked)"
echo -e "  ${BLUE}2)${NC} E2E tests only (slow, real APIs)"
echo -e "  ${BLUE}3)${NC} All tests (unit + E2E)"
echo -e "  ${BLUE}4)${NC} With coverage report"
echo ""
read -p "Choice [1]: " choice
choice=${choice:-1}

echo ""

case $choice in
    1)
        echo -e "${BLUE}🧪 Running unit tests...${NC}"
        pytest tests/ -m "not e2e" -v
        ;;
    2)
        echo -e "${BLUE}🌐 Running E2E tests...${NC}"
        pytest tests/ -m "e2e" -v
        ;;
    3)
        echo -e "${BLUE}🔬 Running all tests...${NC}"
        pytest tests/ -v
        ;;
    4)
        echo -e "${BLUE}📊 Running tests with coverage...${NC}"
        pytest tests/ --cov=. --cov-report=html --cov-report=term
        echo ""
        echo -e "${GREEN}Coverage report generated: backend/htmlcov/index.html${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

exit_code=$?

echo ""
if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✅ ALL TESTS PASSED ✅           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║          ❌ SOME TESTS FAILED ❌          ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
fi

echo ""
exit $exit_code
