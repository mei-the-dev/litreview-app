"""Stage 1: Fetch papers from Semantic Scholar"""
from typing import List
from backend.api.models.paper_model import Paper
from backend.infrastructure.external.semantic_scholar import SemanticScholarClient
from backend.core.websocket_manager import manager


async def execute(session_id: str, keywords: List[str], max_papers: int = 50) -> List[Paper]:
    """Fetch papers from Semantic Scholar API"""
    
    await manager.send_stage_update(
        session_id, 
        stage=1, 
        progress=10, 
        message=f"Searching Semantic Scholar for: {', '.join(keywords)}"
    )
    
    client = SemanticScholarClient()
    
    await manager.send_stage_update(
        session_id, 
        stage=1, 
        progress=50, 
        message="Fetching paper metadata..."
    )
    
    papers = await client.search_papers(keywords, limit=max_papers)
    
    await manager.send_stage_update(
        session_id, 
        stage=1, 
        progress=90, 
        message=f"Found {len(papers)} papers"
    )
    
    await manager.send_stage_complete(
        session_id,
        stage=1,
        result={
            "papers_count": len(papers),
            "papers": [p.model_dump() for p in papers[:5]]  # Preview first 5
        }
    )
    
    return papers
