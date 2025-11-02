"""Stage 5: Final ranking of papers"""
from typing import List
from backend.api.models.paper_model import Paper
from backend.core.websocket_manager import manager


async def execute(session_id: str, papers: List[Paper]) -> List[Paper]:
    """
    Rank papers using multi-factor scoring:
    - Relevance score (40%)
    - Citation count (30%)
    - Recency (20%)
    - Abstract quality (10%)
    """
    
    await manager.send_stage_update(
        session_id,
        stage=5,
        progress=20,
        message="Calculating final rankings..."
    )
    
    # Normalize factors
    max_citations = max((p.citation_count for p in papers), default=1)
    max_year = max((p.year for p in papers if p.year), default=2024)
    min_year = min((p.year for p in papers if p.year), default=1990)
    
    scored_papers = []
    
    for paper in papers:
        # Factor 1: Relevance score (already 0-1)
        relevance = paper.relevance_score or 0
        
        # Factor 2: Citation count (normalized)
        citations = paper.citation_count / max_citations if max_citations > 0 else 0
        
        # Factor 3: Recency (normalized)
        if paper.year:
            year_range = max_year - min_year if max_year > min_year else 1
            recency = (paper.year - min_year) / year_range
        else:
            recency = 0
        
        # Factor 4: Abstract quality (has abstract = 1, no abstract = 0)
        abstract_quality = 1.0 if paper.abstract else 0.5
        
        # Weighted final score
        final_score = (
            0.40 * relevance +
            0.30 * citations +
            0.20 * recency +
            0.10 * abstract_quality
        )
        
        scored_papers.append((final_score, paper))
    
    # Sort by final score
    scored_papers.sort(key=lambda x: x[0], reverse=True)
    
    # Assign ranks
    ranked_papers = []
    for rank, (score, paper) in enumerate(scored_papers, 1):
        paper.final_rank = rank
        ranked_papers.append(paper)
    
    await manager.send_stage_update(
        session_id,
        stage=5,
        progress=80,
        message="Rankings calculated"
    )
    
    await manager.send_stage_complete(
        session_id,
        stage=5,
        result={
            "papers_ranked": len(ranked_papers),
            "top_10": [
                {
                    "rank": p.final_rank,
                    "title": p.title,
                    "score": round(scored_papers[i][0], 3)
                }
                for i, p in enumerate(ranked_papers[:10])
            ]
        },
        data={
            "ranked_papers": [p.model_dump() for p in ranked_papers]
        }
    )
    
    return ranked_papers
