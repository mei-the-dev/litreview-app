"""
Test WebSocket Manager
Critical for real-time updates to frontend
"""
import pytest
from backend.core.websocket_manager import manager


def test_websocket_manager_exists():
    """Test that websocket manager exists"""
    assert manager is not None


@pytest.mark.asyncio
async def test_websocket_manager_connect():
    """Test connecting a websocket"""
    from fastapi import WebSocket
    from unittest.mock import Mock, AsyncMock, MagicMock
    
    # Create a proper mock websocket
    mock_ws = MagicMock(spec=WebSocket)
    mock_ws.accept = AsyncMock()
    mock_ws.send_json = AsyncMock()
    mock_ws.close = AsyncMock()
    
    session_id = "test-session-123"
    
    # Manager expects (websocket, session_id) order
    try:
        await manager.connect(mock_ws, session_id)
    except TypeError:
        # If signature is (session_id, websocket)
        await manager.connect(session_id, mock_ws)
    
    mock_ws.accept.assert_called()
