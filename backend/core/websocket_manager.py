from fastapi import WebSocket
from typing import Dict, Set, List
import json
import asyncio
from datetime import datetime
from pathlib import Path


class ConnectionManager:
    """Manages WebSocket connections for real-time pipeline updates"""
    
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.event_log: List[dict] = []
        self.event_log_file = Path("logs/pipeline_events.log")
        self.event_log_file.parent.mkdir(exist_ok=True)
    
    async def connect(self, websocket: WebSocket, session_id: str):
        """Connect a new WebSocket client"""
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)
        
        # Send connection confirmation
        await self.send_message(session_id, {
            "type": "connected",
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def disconnect(self, websocket: WebSocket, session_id: str):
        """Disconnect a WebSocket client"""
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
    
    async def send_message(self, session_id: str, message: dict):
        """Send message to all clients in a session"""
        # Log event
        self._log_event(session_id, message)
        
        if session_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)
            
            # Clean up disconnected clients
            for conn in disconnected:
                self.disconnect(conn, session_id)
    
    def _log_event(self, session_id: str, message: dict):
        """Log event to file and memory"""
        # Make a copy to avoid modifying original
        msg_copy = dict(message)
        
        # Convert any datetime objects to ISO format strings
        def serialize_datetime(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            elif isinstance(obj, dict):
                return {k: serialize_datetime(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [serialize_datetime(item) for item in obj]
            return obj
        
        msg_copy = serialize_datetime(msg_copy)
        
        event = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            **msg_copy
        }
        self.event_log.append(event)
        
        # Keep only last 1000 events in memory
        if len(self.event_log) > 1000:
            self.event_log = self.event_log[-1000:]
        
        # Write to file
        try:
            with open(self.event_log_file, 'a') as f:
                f.write(json.dumps(event) + '\n')
        except Exception as e:
            print(f"Failed to write event log: {e}")
    
    async def send_stage_update(self, session_id: str, stage: int, progress: int, message: str, data: dict = None):
        """Send pipeline stage update"""
        await self.send_message(session_id, {
            "type": "stage_update",
            "stage": stage,
            "progress": progress,
            "message": message,
            "data": data or {},
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def send_stage_complete(self, session_id: str, stage: int, result: dict, data: dict = None):
        """Send pipeline stage completion"""
        message = {
            "type": "stage_complete",
            "stage": stage,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        if data:
            message["data"] = data
        await self.send_message(session_id, message)
    
    async def send_error(self, session_id: str, error: str, stage: int = None):
        """Send error message"""
        await self.send_message(session_id, {
            "type": "error",
            "stage": stage,
            "error": error,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def get_recent_events(self, session_id: str = None, limit: int = 100) -> List[dict]:
        """Get recent events, optionally filtered by session_id"""
        events = self.event_log[-limit:]
        if session_id:
            events = [e for e in events if e.get('session_id') == session_id]
        return events


# Global manager instance
manager = ConnectionManager()
