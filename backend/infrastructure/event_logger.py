"""
Pipeline Event Logger - Enhanced event logging for detailed monitoring
Provides high-level API for consistent event logging across all pipeline stages
"""
from typing import Dict, Any, Optional, List
from pathlib import Path
from datetime import datetime
import json
import threading
from enum import Enum


class EventType(str, Enum):
    """Event types for pipeline monitoring"""
    CONNECTED = "connected"
    STAGE_START = "stage_start"
    STAGE_UPDATE = "stage_update"
    STAGE_COMPLETE = "stage_complete"
    STAGE_ERROR = "stage_error"
    PIPELINE_COMPLETE = "pipeline_complete"
    PIPELINE_ERROR = "pipeline_error"


class PipelineEventLogger:
    """
    Centralized event logging for pipeline execution
    Logs to file for dashboard consumption and maintains in-memory history
    """
    
    def __init__(self, log_file: Path = None):
        self.log_file = log_file or Path("logs/pipeline_events.log")
        self.log_file.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._event_history: List[Dict[str, Any]] = []
        self._max_history = 1000
    
    def _write_event(self, event: Dict[str, Any]):
        """Thread-safe event writing"""
        with self._lock:
            # Add to history
            self._event_history.append(event)
            if len(self._event_history) > self._max_history:
                self._event_history = self._event_history[-self._max_history:]
            
            # Write to file
            try:
                with open(self.log_file, 'a') as f:
                    f.write(json.dumps(event) + '\n')
            except Exception as e:
                print(f"⚠️  Failed to write event log: {e}")
    
    def log_connected(self, session_id: str):
        """Log session connection"""
        event = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "type": EventType.CONNECTED,
            "message": "Pipeline session started"
        }
        self._write_event(event)
        return event
    
    def log_stage_start(
        self,
        session_id: str,
        stage: int,
        stage_name: str,
        message: str = None
    ):
        """Log pipeline stage start"""
        event = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "type": EventType.STAGE_START,
            "stage": stage,
            "stage_name": stage_name,
            "progress": 0,
            "message": message or f"Starting {stage_name}..."
        }
        self._write_event(event)
        return event
    
    def log_stage_progress(
        self,
        session_id: str,
        stage: int,
        progress: int,
        message: str,
        data: Dict[str, Any] = None
    ):
        """Log pipeline stage progress update"""
        event = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "type": EventType.STAGE_UPDATE,
            "stage": stage,
            "progress": progress,
            "message": message
        }
        if data:
            event["data"] = data
        self._write_event(event)
        return event
    
    def log_stage_complete(
        self,
        session_id: str,
        stage: int,
        stage_name: str,
        result: Dict[str, Any],
        duration_ms: Optional[float] = None
    ):
        """Log pipeline stage completion"""
        event = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "type": EventType.STAGE_COMPLETE,
            "stage": stage,
            "stage_name": stage_name,
            "progress": 100,
            "message": f"{stage_name} completed successfully",
            "result": result
        }
        if duration_ms:
            event["duration_ms"] = duration_ms
        self._write_event(event)
        return event
    
    def log_stage_error(
        self,
        session_id: str,
        stage: int,
        stage_name: str,
        error: str,
        stack_trace: str = None
    ):
        """Log pipeline stage error"""
        event = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "type": EventType.STAGE_ERROR,
            "stage": stage,
            "stage_name": stage_name,
            "message": f"Error in {stage_name}: {error}",
            "error": error
        }
        if stack_trace:
            event["stack_trace"] = stack_trace
        self._write_event(event)
        return event
    
    def log_pipeline_complete(
        self,
        session_id: str,
        total_duration_ms: float,
        summary: Dict[str, Any]
    ):
        """Log complete pipeline execution"""
        event = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "type": EventType.PIPELINE_COMPLETE,
            "message": "Pipeline execution completed successfully",
            "total_duration_ms": total_duration_ms,
            "summary": summary
        }
        self._write_event(event)
        return event
    
    def log_pipeline_error(
        self,
        session_id: str,
        error: str,
        failed_stage: Optional[int] = None
    ):
        """Log pipeline-level error"""
        event = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "type": EventType.PIPELINE_ERROR,
            "message": f"Pipeline failed: {error}",
            "error": error,
            "failed_stage": failed_stage
        }
        self._write_event(event)
        return event
    
    def get_session_events(self, session_id: str, limit: int = None) -> List[Dict[str, Any]]:
        """Get events for a specific session"""
        events = [e for e in self._event_history if e.get("session_id") == session_id]
        if limit:
            events = events[-limit:]
        return events
    
    def get_recent_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent events across all sessions"""
        return self._event_history[-limit:]


# Global logger instance
event_logger = PipelineEventLogger()
