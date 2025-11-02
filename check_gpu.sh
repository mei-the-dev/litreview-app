#!/bin/bash
# GPU Status Check Script
# Quick script to verify GPU configuration and status

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         LitReview GPU Configuration Status                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if nvidia-smi is available
if ! command -v nvidia-smi &> /dev/null; then
    echo "❌ nvidia-smi not found - GPU drivers may not be installed"
    exit 1
fi

# GPU Hardware Info
echo "🎮 GPU Hardware:"
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
echo ""

# Current GPU Usage
echo "📊 Current GPU Usage:"
nvidia-smi --query-gpu=memory.used,memory.free,utilization.gpu --format=csv,noheader
echo ""

# Check if backend is running
if curl -s http://localhost:8000/health &> /dev/null; then
    echo "🟢 Backend Status: Online"
    
    # Get GPU stats from API
    echo ""
    echo "🔧 Backend GPU Configuration:"
    gpu_stats=$(curl -s http://localhost:8000/api/monitoring/gpu-stats)
    
    device=$(echo $gpu_stats | python3 -c "import sys, json; print(json.load(sys.stdin).get('device', 'unknown'))" 2>/dev/null)
    fp16=$(echo $gpu_stats | python3 -c "import sys, json; print(json.load(sys.stdin).get('fp16_enabled', False))" 2>/dev/null)
    
    echo "   Device: $device"
    echo "   FP16 Mixed Precision: $fp16"
    echo ""
    
    # Full API response
    echo "   Full GPU Stats:"
    echo "$gpu_stats" | python3 -m json.tool 2>/dev/null | sed 's/^/   /'
else
    echo "🔴 Backend Status: Offline"
    echo "   Run: ./run.sh to start the backend"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Quick Commands:                                               ║"
echo "║  • nvidia-smi              - Full GPU status                   ║"
echo "║  • python test_gpu_models.py  - Test GPU models                ║"
echo "║  • python dashboard.py     - Monitoring dashboard              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
