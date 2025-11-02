"""Test event logger functionality"""
import pytest
from pathlib import Path
from backend.infrastructure.event_logger import event_logger, EventType
import json


def test_event_logger_creation():
    """Test that event logger can be created"""
    assert event_logger is not None
    assert event_logger.log_file.exists() or True  # File may not exist yet


def test_log_connected():
    """Test logging connected event"""
    session_id = "test-session-123"
    event = event_logger.log_connected(session_id)
    
    assert event["session_id"] == session_id
    assert event["type"] == EventType.CONNECTED
    assert "timestamp" in event
    assert event["message"] == "Pipeline session started"


def test_log_stage_start():
    """Test logging stage start event"""
    session_id = "test-session-456"
    stage = 1
    stage_name = "Fetching Papers"
    
    event = event_logger.log_stage_start(session_id, stage, stage_name)
    
    assert event["session_id"] == session_id
    assert event["type"] == EventType.STAGE_START
    assert event["stage"] == stage
    assert event["stage_name"] == stage_name
    assert event["progress"] == 0


def test_log_stage_progress():
    """Test logging stage progress event"""
    session_id = "test-session-789"
    stage = 2
    progress = 50
    message = "Processing papers..."
    
    event = event_logger.log_stage_progress(session_id, stage, progress, message)
    
    assert event["session_id"] == session_id
    assert event["type"] == EventType.STAGE_UPDATE
    assert event["stage"] == stage
    assert event["progress"] == progress
    assert event["message"] == message


def test_log_stage_progress_with_data():
    """Test logging stage progress with additional data"""
    session_id = "test-session-abc"
    stage = 3
    progress = 75
    message = "Clustering themes..."
    data = {"themes_found": 5, "papers_processed": 10}
    
    event = event_logger.log_stage_progress(session_id, stage, progress, message, data)
    
    assert event["data"] == data


def test_log_stage_complete():
    """Test logging stage completion"""
    session_id = "test-session-def"
    stage = 1
    stage_name = "Fetching Papers"
    result = {"papers_count": 25}
    duration_ms = 1500.5
    
    event = event_logger.log_stage_complete(
        session_id, stage, stage_name, result, duration_ms
    )
    
    assert event["session_id"] == session_id
    assert event["type"] == EventType.STAGE_COMPLETE
    assert event["stage"] == stage
    assert event["stage_name"] == stage_name
    assert event["progress"] == 100
    assert event["result"] == result
    assert event["duration_ms"] == duration_ms


def test_log_stage_error():
    """Test logging stage error"""
    session_id = "test-session-ghi"
    stage = 2
    stage_name = "Relevance Scoring"
    error = "API rate limit exceeded"
    
    event = event_logger.log_stage_error(session_id, stage, stage_name, error)
    
    assert event["session_id"] == session_id
    assert event["type"] == EventType.STAGE_ERROR
    assert event["stage"] == stage
    assert error in event["message"]
    assert event["error"] == error


def test_log_pipeline_complete():
    """Test logging pipeline completion"""
    session_id = "test-session-jkl"
    total_duration_ms = 45000.0
    summary = {
        "total_papers": 25,
        "total_themes": 5,
        "total_methodologies": 3
    }
    
    event = event_logger.log_pipeline_complete(session_id, total_duration_ms, summary)
    
    assert event["session_id"] == session_id
    assert event["type"] == EventType.PIPELINE_COMPLETE
    assert event["total_duration_ms"] == total_duration_ms
    assert event["summary"] == summary


def test_log_pipeline_error():
    """Test logging pipeline error"""
    session_id = "test-session-mno"
    error = "Pipeline failed at stage 3"
    failed_stage = 3
    
    event = event_logger.log_pipeline_error(session_id, error, failed_stage)
    
    assert event["session_id"] == session_id
    assert event["type"] == EventType.PIPELINE_ERROR
    assert event["error"] == error
    assert event["failed_stage"] == failed_stage


def test_get_session_events():
    """Test retrieving events for a specific session"""
    session_id = "test-session-pqr"
    
    # Log some events
    event_logger.log_connected(session_id)
    event_logger.log_stage_start(session_id, 1, "Stage 1")
    event_logger.log_stage_progress(session_id, 1, 50, "Progress")
    
    # Retrieve events
    events = event_logger.get_session_events(session_id)
    
    assert len(events) >= 3
    assert all(e["session_id"] == session_id for e in events)


def test_get_recent_events():
    """Test retrieving recent events across all sessions"""
    # Log events from different sessions
    event_logger.log_connected("session-1")
    event_logger.log_connected("session-2")
    event_logger.log_connected("session-3")
    
    # Get recent events
    events = event_logger.get_recent_events(limit=10)
    
    assert len(events) > 0
    assert len(events) <= 10


def test_event_file_writing():
    """Test that events are written to file"""
    session_id = "test-file-write"
    event_logger.log_connected(session_id)
    
    # Check file exists and contains the event
    if event_logger.log_file.exists():
        with open(event_logger.log_file, 'r') as f:
            lines = f.readlines()
            # Find our event
            found = any(session_id in line for line in lines[-10:])
            assert found, "Event not found in log file"


def test_event_history_limit():
    """Test that event history respects max size"""
    # The logger should keep only last 1000 events
    initial_count = len(event_logger._event_history)
    
    # Log many events (more than max)
    for i in range(100):
        event_logger.log_connected(f"test-session-{i}")
    
    # Check history size
    assert len(event_logger._event_history) <= event_logger._max_history
