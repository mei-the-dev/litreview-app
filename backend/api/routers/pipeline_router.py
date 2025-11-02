from fastapi import APIRouter, HTTPException, BackgroundTasks
from backend.api.models.paper_model import PipelineRequest, PipelineResponse
from backend.domain.pipeline_orchestrator import run_pipeline
from backend.core.config import settings
import uuid
import asyncio


router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])


# Track running pipelines
running_pipelines = {}


@router.post("/start", response_model=PipelineResponse)
async def start_pipeline(request: PipelineRequest, background_tasks: BackgroundTasks):
    """
    Start a new literature review pipeline
    
    Returns session_id and WebSocket URL for real-time updates
    """
    
    # Generate unique session ID
    session_id = str(uuid.uuid4())
    
    # Add pipeline to background tasks
    async def run_pipeline_task():
        try:
            running_pipelines[session_id] = {"status": "running", "result": None}
            result = await run_pipeline(session_id, request)
            running_pipelines[session_id] = {"status": "completed", "result": result}
        except Exception as e:
            running_pipelines[session_id] = {"status": "failed", "error": str(e)}
            from backend.core.websocket_manager import manager
            await manager.send_error(session_id, str(e))
    
    # Run in background
    asyncio.create_task(run_pipeline_task())
    
    return PipelineResponse(
        session_id=session_id,
        status="started",
        message="Pipeline started successfully. Connect to WebSocket for real-time updates.",
        websocket_url=f"ws://localhost:{settings.port}/ws/{session_id}"
    )


@router.get("/status/{session_id}")
async def get_pipeline_status(session_id: str):
    """Get the current status of a pipeline"""
    
    if session_id not in running_pipelines:
        raise HTTPException(status_code=404, detail="Pipeline session not found")
    
    return running_pipelines[session_id]


@router.get("/result/{session_id}")
async def get_pipeline_result(session_id: str):
    """Get the final result of a completed pipeline"""
    
    if session_id not in running_pipelines:
        raise HTTPException(status_code=404, detail="Pipeline session not found")
    
    pipeline = running_pipelines[session_id]
    
    if pipeline["status"] == "running":
        raise HTTPException(status_code=425, detail="Pipeline is still running")
    
    if pipeline["status"] == "failed":
        raise HTTPException(status_code=500, detail=pipeline.get("error", "Pipeline failed"))
    
    return pipeline["result"]
