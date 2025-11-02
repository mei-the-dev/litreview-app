"""Stage 4: Group papers by research methodology"""
from typing import List, Dict
from collections import defaultdict
from backend.api.models.paper_model import Paper
from backend.core.websocket_manager import manager
import re


# Common methodology keywords
METHODOLOGY_KEYWORDS = {
    "Experimental": ["experiment", "experimental", "trial", "controlled", "rct", "randomized"],
    "Survey": ["survey", "questionnaire", "interview", "qualitative", "ethnographic"],
    "Case Study": ["case study", "case-based", "case analysis"],
    "Simulation": ["simulation", "simulated", "monte carlo", "agent-based"],
    "Meta-Analysis": ["meta-analysis", "systematic review", "literature review"],
    "Observational": ["observational", "longitudinal", "cohort", "cross-sectional"],
    "Theoretical": ["theoretical", "framework", "model", "conceptual"],
    "Computational": ["algorithm", "computational", "machine learning", "deep learning", "neural"]
}


async def execute(session_id: str, papers: List[Paper]) -> Dict[str, List[Paper]]:
    """Classify papers by research methodology"""
    
    await manager.send_stage_update(
        session_id,
        stage=4,
        progress=20,
        message="Analyzing research methodologies..."
    )
    
    methodologies = defaultdict(list)
    
    for i, paper in enumerate(papers):
        if i % 10 == 0:
            progress = 20 + int((i / len(papers)) * 60)
            await manager.send_stage_update(
                session_id,
                stage=4,
                progress=progress,
                message=f"Classified {i}/{len(papers)} papers..."
            )
        
        # Combine title and abstract for analysis
        text = (paper.title + " " + (paper.abstract or "")).lower()
        
        # Find matching methodologies
        scores = {}
        for methodology, keywords in METHODOLOGY_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                scores[methodology] = score
        
        # Assign to best matching methodology or "Other"
        if scores:
            best_methodology = max(scores.items(), key=lambda x: x[1])[0]
            paper.methodology = best_methodology
        else:
            paper.methodology = "Other"
        
        methodologies[paper.methodology].append(paper)
    
    await manager.send_stage_complete(
        session_id,
        stage=4,
        result={
            "methodologies_found": len(methodologies),
            "distribution": {
                method: len(papers_list)
                for method, papers_list in methodologies.items()
            }
        },
        data={
            "methodologies": {
                method: [p.model_dump() for p in papers_list]
                for method, papers_list in methodologies.items()
            }
        }
    )
    
    return dict(methodologies)
