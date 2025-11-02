from fastapi import WebSocket
from typing import Dict, Set
import json
import asyncio
from datetime import datetime


class ConnectionManager:
    """Manages WebSocket connections for real-time pipeline updates"""
    
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
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
    
    async def send_stage_complete(self, session_id: str, stage: int, result: dict):
        """Send pipeline stage completion"""
        await self.send_message(session_id, {
            "type": "stage_complete",
            "stage": stage,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def send_error(self, session_id: str, error: str, stage: int = None):
        """Send error message"""
        await self.send_message(session_id, {
            "type": "error",
            "stage": stage,
            "error": error,
            "timestamp": datetime.utcnow().isoformat()
        })


# Global manager instance
manager = ConnectionManager()
