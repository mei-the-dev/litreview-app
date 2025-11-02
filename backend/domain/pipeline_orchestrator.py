"""Pipeline orchestrator - coordinates all 7 stages"""
from typing import List
from pathlib import Path
import time
import traceback
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
from backend.infrastructure.event_logger import event_logger


async def run_pipeline(session_id: str, request: PipelineRequest) -> dict:
    """
    Execute the complete 7-stage literature review pipeline with comprehensive logging
    
    Returns final report and PDF path
    """
    
    pipeline_start_time = time.time()
    stage_times = {}
    
    try:
        # Log pipeline start
        event_logger.log_connected(session_id)
        
        # Stage 1: Fetch papers from Semantic Scholar
        stage_start = time.time()
        event_logger.log_stage_start(session_id, 1, "Fetching Papers")
        papers = await stage_1_fetch.execute(
            session_id,
            keywords=request.keywords,
            max_papers=request.max_papers
        )
        stage_times[1] = (time.time() - stage_start) * 1000  # ms
        
        if not papers:
            error_msg = "No papers found for the given keywords"
            event_logger.log_pipeline_error(session_id, error_msg, failed_stage=1)
            raise Exception(error_msg)
        
        # Stage 2: Calculate relevance scores
        stage_start = time.time()
        event_logger.log_stage_start(session_id, 2, "Relevance Scoring")
        papers = await stage_2_relevance.execute(
            session_id,
            papers=papers,
            keywords=request.keywords
        )
        stage_times[2] = (time.time() - stage_start) * 1000
        
        # Stage 3: Group by themes
        stage_start = time.time()
        event_logger.log_stage_start(session_id, 3, "Theme Clustering")
        themes = await stage_3_themes.execute(session_id, papers=papers)
        stage_times[3] = (time.time() - stage_start) * 1000
        
        # Stage 4: Group by methodology
        stage_start = time.time()
        event_logger.log_stage_start(session_id, 4, "Methodology Grouping")
        methodologies = await stage_4_methodology.execute(session_id, papers=papers)
        stage_times[4] = (time.time() - stage_start) * 1000
        
        # Stage 5: Final ranking
        stage_start = time.time()
        event_logger.log_stage_start(session_id, 5, "Final Ranking")
        papers = await stage_5_ranking.execute(session_id, papers=papers)
        stage_times[5] = (time.time() - stage_start) * 1000
        
        # Stage 6: Generate synthesis report
        stage_start = time.time()
        event_logger.log_stage_start(session_id, 6, "Synthesis Report")
        report = await stage_6_synthesis.execute(
            session_id,
            papers=papers,
            themes=themes,
            methodologies=methodologies,
            keywords=request.keywords
        )
        stage_times[6] = (time.time() - stage_start) * 1000
        
        # Stage 7: Generate PDF
        stage_start = time.time()
        event_logger.log_stage_start(session_id, 7, "PDF Generation")
        output_dir = Path("./output")
        pdf_path = await stage_7_pdf.execute(session_id, report=report, output_dir=output_dir)
        stage_times[7] = (time.time() - stage_start) * 1000
        
        # Log pipeline completion
        total_duration = (time.time() - pipeline_start_time) * 1000
        event_logger.log_pipeline_complete(
            session_id,
            total_duration,
            {
                "total_papers": len(papers),
                "total_themes": len(themes),
                "total_methodologies": len(methodologies),
                "stage_durations_ms": stage_times,
                "pdf_path": str(pdf_path)
            }
        )
        
        return {
            "report": report,
            "pdf_path": pdf_path,
            "session_id": session_id,
            "stage_durations": stage_times,
            "total_duration_ms": total_duration
        }
        
    except Exception as e:
        # Log pipeline error
        error_msg = str(e)
        stack = traceback.format_exc()
        event_logger.log_pipeline_error(session_id, error_msg)
        print(f"❌ Pipeline error in session {session_id}: {error_msg}\n{stack}")
        raise
