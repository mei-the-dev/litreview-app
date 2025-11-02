"""Pipeline orchestrator - coordinates all 7 stages"""
from typing import List
from pathlib import Path
from backend.api.models.paper_model import PipelineRequest, LiteratureReviewReport
from backend.domain.pipeline import (
    stage_1_fetch,
    stage_2_relevance,
    stage_3_themes,
    stage_4_methodology,
    stage_5_ranking,
    stage_6_synthesis,
    stage_7_pdf
)


async def run_pipeline(session_id: str, request: PipelineRequest) -> dict:
    """
    Execute the complete 7-stage literature review pipeline
    
    Returns final report and PDF path
    """
    
    # Stage 1: Fetch papers from Semantic Scholar
    papers = await stage_1_fetch.execute(
        session_id,
        keywords=request.keywords,
        max_papers=request.max_papers
    )
    
    if not papers:
        raise Exception("No papers found for the given keywords")
    
    # Stage 2: Calculate relevance scores
    papers = await stage_2_relevance.execute(
        session_id,
        papers=papers,
        keywords=request.keywords
    )
    
    # Stage 3: Group by themes
    themes = await stage_3_themes.execute(session_id, papers=papers)
    
    # Stage 4: Group by methodology
    methodologies = await stage_4_methodology.execute(session_id, papers=papers)
    
    # Stage 5: Final ranking
    papers = await stage_5_ranking.execute(session_id, papers=papers)
    
    # Stage 6: Generate synthesis report
    report = await stage_6_synthesis.execute(
        session_id,
        papers=papers,
        themes=themes,
        methodologies=methodologies,
        keywords=request.keywords
    )
    
    # Stage 7: Generate PDF
    output_dir = Path("./output")
    pdf_path = await stage_7_pdf.execute(session_id, report=report, output_dir=output_dir)
    
    return {
        "report": report,
        "pdf_path": pdf_path,
        "session_id": session_id
    }
