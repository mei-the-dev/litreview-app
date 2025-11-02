from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging
from datetime import datetime
import os

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])

# Setup frontend log file
frontend_log_path = os.path.join("logs", "frontend.log")
os.makedirs("logs", exist_ok=True)

# Create logger for frontend logs
frontend_logger = logging.getLogger("frontend")
frontend_logger.setLevel(logging.INFO)
if not frontend_logger.handlers:
    fh = logging.FileHandler(frontend_log_path)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    frontend_logger.addHandler(fh)


class FrontendLogMessage(BaseModel):
    level: str
    message: str
    timestamp: str
    source: Optional[str] = None
    stack: Optional[str] = None
    componentStack: Optional[str] = None
    sessionId: Optional[str] = None


@router.post("/frontend-log")
async def log_frontend_message(log: FrontendLogMessage):
    """
    Receive and log frontend console messages.
    """
    try:
        # Format log message
        log_text = f"[{log.sessionId or 'unknown'}] {log.message}"
        if log.source:
            log_text += f" | Source: {log.source}"
        if log.stack:
            log_text += f"\nStack: {log.stack}"
        if log.componentStack:
            log_text += f"\nComponent Stack: {log.componentStack}"
        
        # Log at appropriate level
        if log.level == "error":
            frontend_logger.error(log_text)
        elif log.level == "warn":
            frontend_logger.warning(log_text)
        elif log.level == "info":
            frontend_logger.info(log_text)
        else:
            frontend_logger.debug(log_text)
        
        return {"status": "logged"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log: {str(e)}")


@router.get("/frontend-logs")
async def get_frontend_logs(lines: int = 100):
    """
    Retrieve recent frontend logs.
    """
    try:
        if not os.path.exists(frontend_log_path):
            return {"logs": []}
        
        with open(frontend_log_path, 'r') as f:
            all_lines = f.readlines()
            recent_lines = all_lines[-lines:] if len(all_lines) > lines else all_lines
            
        return {"logs": [line.strip() for line in recent_lines]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve logs: {str(e)}")


@router.get("/health-detailed")
async def health_detailed():
    """
    Detailed health check including log status.
    """
    try:
        backend_log_exists = os.path.exists("logs/backend.log")
        frontend_log_exists = os.path.exists("logs/frontend.log")
        
        # Check if logs have errors
        error_count = 0
        if backend_log_exists:
            with open("logs/backend.log", 'r') as f:
                for line in f:
                    if "ERROR" in line or "Exception" in line:
                        error_count += 1
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "logs": {
                "backend_exists": backend_log_exists,
                "frontend_exists": frontend_log_exists,
                "recent_errors": error_count
            }
        }
    
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e)
        }
