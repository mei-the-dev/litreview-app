"""Stage 2: Calculate relevance scores using AI embeddings"""
from typing import List
import numpy as np
from backend.api.models.paper_model import Paper
from backend.infrastructure.ai.huggingface_client import hf_client
from backend.core.websocket_manager import manager


async def execute(session_id: str, papers: List[Paper], keywords: List[str]) -> List[Paper]:
    """Score papers by relevance to query keywords using semantic similarity"""
    
    await manager.send_stage_update(
        session_id,
        stage=2,
        progress=10,
        message="Generating embeddings for query..."
    )
    
    # Get query embedding
    query_text = " ".join(keywords)
    query_embedding = (await hf_client.get_embeddings([query_text]))[0]
    
    await manager.send_stage_update(
        session_id,
        stage=2,
        progress=30,
        message="Generating embeddings for papers..."
    )
    
    # Get paper embeddings (title + abstract)
    paper_texts = []
    valid_papers = []
    
    for paper in papers:
        text = paper.title
        if paper.abstract:
            text += " " + paper.abstract
        paper_texts.append(text)
        valid_papers.append(paper)
    
    # Batch process embeddings
    paper_embeddings = await hf_client.get_embeddings(paper_texts)
    
    await manager.send_stage_update(
        session_id,
        stage=2,
        progress=70,
        message="Calculating similarity scores..."
    )
    
    # Calculate cosine similarity
    query_vec = np.array(query_embedding)
    scores = []
    
    for i, paper_embedding in enumerate(paper_embeddings):
        paper_vec = np.array(paper_embedding)
        similarity = np.dot(query_vec, paper_vec) / (
            np.linalg.norm(query_vec) * np.linalg.norm(paper_vec)
        )
        
        # Combine with citation count (normalized)
        citation_weight = min(valid_papers[i].citation_count / 1000, 1.0)
        final_score = 0.8 * similarity + 0.2 * citation_weight
        
        valid_papers[i].relevance_score = float(final_score)
        scores.append(float(final_score))
    
    # Sort by relevance
    valid_papers.sort(key=lambda p: p.relevance_score or 0, reverse=True)
    
    await manager.send_stage_complete(
        session_id,
        stage=2,
        result={
            "papers_scored": len(valid_papers),
            "avg_score": float(np.mean(scores)),
            "top_papers": [
                {"title": p.title, "score": p.relevance_score}
                for p in valid_papers[:5]
            ]
        }
    )
    
    return valid_papers
