#!/bin/bash

# Test script to verify dashboard is correctly monitoring pipeline events

echo "🧪 Testing Dashboard Event Monitoring"
echo "======================================"
echo ""

# Check if logs directory exists
if [ ! -d "logs" ]; then
    echo "❌ logs/ directory not found"
    exit 1
fi

# Create test pipeline events
echo "📝 Creating test pipeline events..."
cat > logs/pipeline_events.log << 'EOF'
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:00.000000", "type": "connected", "message": "Pipeline session started"}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:01.000000", "type": "stage_update", "stage": 1, "progress": 50, "message": "Fetching papers from Semantic Scholar..."}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:05.000000", "type": "stage_update", "stage": 1, "progress": 100, "message": "Fetched 25 papers"}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:06.000000", "type": "stage_complete", "stage": 1, "message": "Stage 1 complete", "result": {"papers_count": 25}}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:07.000000", "type": "stage_update", "stage": 2, "progress": 25, "message": "Scoring paper relevance..."}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:10.000000", "type": "stage_update", "stage": 2, "progress": 75, "message": "Analyzing with AI model..."}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:12.000000", "type": "stage_complete", "stage": 2, "message": "Stage 2 complete", "result": {"scored": 25}}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:13.000000", "type": "stage_update", "stage": 6, "progress": 10, "message": "Generating synthesis report..."}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:15.000000", "type": "stage_update", "stage": 6, "progress": 50, "message": "Running LLM summarization..."}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:20.000000", "type": "stage_update", "stage": 6, "progress": 90, "message": "Finalizing report..."}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:22.000000", "type": "stage_complete", "stage": 6, "message": "Stage 6 complete", "result": {"report_generated": true}}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:23.000000", "type": "stage_update", "stage": 7, "progress": 50, "message": "Generating PDF..."}
{"session_id": "test-abc123", "timestamp": "2025-11-02T23:00:25.000000", "type": "stage_complete", "stage": 7, "message": "Pipeline complete!", "result": {"pdf_path": "/output/report_test-abc123.pdf"}}
EOF

echo "✅ Test events created"
echo ""

# Check if backend is running
echo "🔍 Checking backend status..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is running"
else
    echo "⚠️  Backend is not running"
    echo "   Start it with: ./run.sh"
    exit 1
fi

echo ""
echo "📊 Dashboard Test Instructions:"
echo "================================"
echo ""
echo "1. Open dashboard in another terminal:"
echo "   python3 dashboard.py"
echo ""
echo "2. Look for:"
echo "   ✓ Pipeline Status panel showing stages"
echo "   ✓ Pipeline Events panel showing detailed events"
echo "   ✓ Active pipeline session 'test-abc1'"
echo "   ✓ Stages marked as DONE (green checkmarks)"
echo "   ✓ Recent events in chronological order"
echo ""
echo "3. If events don't appear:"
echo "   - Check that dashboard.py is watching logs/pipeline_events.log"
echo "   - Check file permissions"
echo "   - Verify JSON format is valid"
echo ""

# Verify JSON format
echo "🔬 Verifying JSON format..."
if cat logs/pipeline_events.log | while read line; do echo "$line" | jq . > /dev/null 2>&1 || exit 1; done; then
    echo "✅ All events are valid JSON"
else
    echo "❌ Some events have invalid JSON format"
    exit 1
fi

echo ""
echo "✅ Test setup complete!"
echo ""
echo "💡 Run the dashboard now: python3 dashboard.py"
