#!/bin/bash

# LitReview Project Verification Script
# Checks that all files are in place and dependencies are correct

set -e

echo "=========================================="
echo "🔍 LitReview Project Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1 (missing)"
        ((FAILED++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1/ (missing)"
        ((FAILED++))
    fi
}

echo -e "${BLUE}Core Files:${NC}"
check_file "marko.json"
check_file "README.md"
check_file "LICENSE"
check_file "setup.sh"
check_file ".gitignore"
check_file "PROJECT_COMPLETE.md"

echo ""
echo -e "${BLUE}Backend Structure:${NC}"
check_dir "backend"
check_file "backend/main.py"
check_file "backend/requirements.txt"
check_file "backend/.env.example"
check_dir "backend/core"
check_file "backend/core/config.py"
check_file "backend/core/websocket_manager.py"
check_dir "backend/api"
check_dir "backend/api/routers"
check_file "backend/api/routers/pipeline_router.py"
check_dir "backend/api/models"
check_file "backend/api/models/paper_model.py"
check_dir "backend/domain"
check_file "backend/domain/pipeline_orchestrator.py"
check_dir "backend/domain/pipeline"
check_file "backend/domain/pipeline/stage_1_fetch.py"
check_file "backend/domain/pipeline/stage_2_relevance.py"
check_file "backend/domain/pipeline/stage_3_themes.py"
check_file "backend/domain/pipeline/stage_4_methodology.py"
check_file "backend/domain/pipeline/stage_5_ranking.py"
check_file "backend/domain/pipeline/stage_6_synthesis.py"
check_file "backend/domain/pipeline/stage_7_pdf.py"
check_dir "backend/infrastructure"
check_dir "backend/infrastructure/ai"
check_file "backend/infrastructure/ai/huggingface_client.py"
check_dir "backend/infrastructure/external"
check_file "backend/infrastructure/external/semantic_scholar.py"

echo ""
echo -e "${BLUE}Frontend Structure:${NC}"
check_dir "frontend"
check_file "frontend/package.json"
check_file "frontend/tsconfig.json"
check_file "frontend/vite.config.ts"
check_file "frontend/tailwind.config.js"
check_file "frontend/postcss.config.js"
check_file "frontend/index.html"
check_dir "frontend/src"
check_file "frontend/src/main.tsx"
check_file "frontend/src/App.tsx"
check_file "frontend/src/index.css"
check_dir "frontend/src/components"
check_file "frontend/src/components/Header.tsx"
check_file "frontend/src/components/QueryInput.tsx"
check_file "frontend/src/components/StatsFooter.tsx"
check_dir "frontend/src/components/bento"
check_file "frontend/src/components/bento/BentoGrid.tsx"
check_file "frontend/src/components/bento/StageBentoCard.tsx"
check_dir "frontend/src/stores"
check_file "frontend/src/stores/pipelineStore.ts"
check_file "frontend/src/stores/uiStore.ts"
check_dir "frontend/src/hooks"
check_file "frontend/src/hooks/useWebSocket.ts"
check_dir "frontend/src/services"
check_file "frontend/src/services/apiService.ts"
check_dir "frontend/src/types"
check_file "frontend/src/types/pipeline.types.ts"

echo ""
echo "=========================================="
echo "📊 Verification Results"
echo "=========================================="
echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All files verified successfully!${NC}"
    echo ""
    echo "Project is ready to run. Next steps:"
    echo "1. Run: ./setup.sh"
    echo "2. Start backend: cd backend && source venv/bin/activate && python main.py"
    echo "3. Start frontend: cd frontend && npm run dev"
    exit 0
else
    echo -e "${RED}⚠️  Some files are missing. Please review the output above.${NC}"
    exit 1
fi
