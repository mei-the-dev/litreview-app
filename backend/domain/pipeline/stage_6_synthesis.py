"""Stage 6: Generate structured synthesis report"""
from typing import List, Dict
from backend.api.models.paper_model import Paper, LiteratureReviewReport
from backend.infrastructure.ai.huggingface_client import hf_client
from backend.core.websocket_manager import manager


async def execute(
    session_id: str,
    papers: List[Paper],
    themes: Dict[str, List[Paper]],
    methodologies: Dict[str, List[Paper]],
    keywords: List[str]
) -> LiteratureReviewReport:
    """Generate comprehensive literature review synthesis"""
    
    await manager.send_stage_update(
        session_id,
        stage=6,
        progress=5,
        message="Starting synthesis generation...",
        data={"sub_task": "initialization", "total_papers": len(papers), "themes_count": len(themes), "methods_count": len(methodologies)}
    )
    
    # Build synthesis sections
    synthesis_parts = []
    
    # 1. Overview
    await manager.send_stage_update(
        session_id,
        stage=6,
        progress=15,
        message="Building overview section...",
        data={"sub_task": "overview", "status": "in_progress"}
    )
    
    overview = f"""# Literature Review: {', '.join(keywords)}

## Overview
This literature review analyzed {len(papers)} academic papers related to {', '.join(keywords)}.
The papers were classified into {len(themes)} thematic clusters and {len(methodologies)} methodological categories.
"""
    synthesis_parts.append(overview)
    
    await manager.send_stage_update(
        session_id,
        stage=6,
        progress=25,
        message="Overview complete. Starting thematic analysis...",
        data={"sub_task": "theme_analysis", "status": "starting", "theme_count": len(themes)}
    )
    
    # 2. Thematic Analysis
    theme_section = "\n## Thematic Analysis\n\n"
    theme_items = sorted(themes.items(), key=lambda x: len(x[1]), reverse=True)
    for idx, (theme, theme_papers) in enumerate(theme_items):
        theme_progress = 25 + int((idx / len(theme_items)) * 30)  # 25-55% range
        await manager.send_stage_update(
            session_id,
            stage=6,
            progress=theme_progress,
            message=f"Analyzing theme: {theme} ({len(theme_papers)} papers)...",
            data={"sub_task": "theme_analysis", "current_theme": theme, "theme_index": idx + 1, "total_themes": len(themes)}
        )
        
        theme_section += f"### {theme} ({len(theme_papers)} papers)\n\n"
        top_papers = sorted(theme_papers, key=lambda p: p.final_rank or 999)[:3]
        for paper in top_papers:
            theme_section += f"- **{paper.title}** ({paper.year or 'n.d.'})\n"
            if paper.abstract:
                abstract_preview = paper.abstract[:200] + "..." if len(paper.abstract) > 200 else paper.abstract
                theme_section += f"  {abstract_preview}\n\n"
    
    synthesis_parts.append(theme_section)
    
    await manager.send_stage_update(
        session_id,
        stage=6,
        progress=58,
        message="Thematic analysis complete. Starting methodology analysis...",
        data={"sub_task": "methodology_grouping", "status": "starting", "method_count": len(methodologies)}
    )
    
    # 3. Methodological Analysis
    method_section = "\n## Methodological Distribution\n\n"
    method_items = sorted(methodologies.items(), key=lambda x: len(x[1]), reverse=True)
    for idx, (method, method_papers) in enumerate(method_items):
        method_progress = 58 + int((idx / len(method_items)) * 10)  # 58-68% range
        await manager.send_stage_update(
            session_id,
            stage=6,
            progress=method_progress,
            message=f"Processing methodology: {method}...",
            data={"sub_task": "methodology_grouping", "current_method": method, "method_index": idx + 1, "total_methods": len(methodologies)}
        )
        method_section += f"- **{method}**: {len(method_papers)} papers ({len(method_papers)/len(papers)*100:.1f}%)\n"
    
    synthesis_parts.append(method_section)
    
    await manager.send_stage_update(
        session_id,
        stage=6,
        progress=70,
        message="Methodology analysis complete. Compiling top papers...",
        data={"sub_task": "top_papers_compilation", "status": "starting"}
    )
    
    # 4. Top Papers
    top_section = "\n## Highly Relevant Papers\n\n"
    for paper in papers[:10]:
        top_section += f"**{paper.final_rank}. {paper.title}**\n\n"
        top_section += f"- Authors: {', '.join(paper.authors[:3])}{' et al.' if len(paper.authors) > 3 else ''}\n"
        top_section += f"- Year: {paper.year or 'n.d.'}\n"
        top_section += f"- Citations: {paper.citation_count}\n"
        relevance_display = f"{paper.relevance_score:.3f}" if paper.relevance_score is not None else "N/A"
        top_section += f"- Relevance Score: {relevance_display}\n"
        if paper.url:
            top_section += f"- URL: {paper.url}\n"
        top_section += "\n"
    
    synthesis_parts.append(top_section)
    
    await manager.send_stage_update(
        session_id,
        stage=6,
        progress=75,
        message="Top papers compiled. Preparing AI synthesis...",
        data={"sub_task": "synthesis_writing", "status": "starting", "ai_enabled": True}
    )
    
    # 5. Key Insights (AI-generated summary)
    await manager.send_stage_update(
        session_id,
        stage=6,
        progress=80,
        message="Generating AI insights (loading model, may take 1-2 minutes first time)...",
        data={"sub_task": "synthesis_writing", "status": "loading_model", "model": "facebook/bart-large-cnn"}
    )
    
    try:
        # Summarize top abstracts
        top_abstracts = " ".join([
            p.abstract for p in papers[:5] if p.abstract
        ])
        if top_abstracts:
            await manager.send_stage_update(
                session_id,
                stage=6,
                progress=83,
                message=f"Running summarization model on {len(top_abstracts)} chars of abstracts...",
                data={"sub_task": "synthesis_writing", "status": "running_inference", "input_length": len(top_abstracts)}
            )
            ai_summary = await hf_client.summarize(top_abstracts[:2000], max_length=200)
            await manager.send_stage_update(
                session_id,
                stage=6,
                progress=90,
                message="AI summary generated successfully",
                data={"sub_task": "synthesis_writing", "status": "inference_complete", "summary_length": len(ai_summary)}
            )
            insights_section = f"\n## Key Insights\n\n{ai_summary}\n"
            synthesis_parts.append(insights_section)
        else:
            await manager.send_stage_update(
                session_id,
                stage=6,
                progress=85,
                message="No abstracts available for AI summarization, using manual insights"
            )
    except Exception as e:
        error_msg = str(e)
        print(f"Could not generate AI summary: {error_msg}")
        await manager.send_stage_update(
            session_id,
            stage=6,
            progress=85,
            message=f"AI summarization failed ({error_msg[:100]}), using manual insights"
        )
        # Add a manual insights section if AI fails
        insights_section = "\n## Key Insights\n\n"
        insights_section += f"This review covers {len(papers)} papers across {len(themes)} thematic areas. "
        insights_section += f"The most common methodological approach is {max(methodologies.items(), key=lambda x: len(x[1]))[0]} "
        insights_section += f"with {len(max(methodologies.items(), key=lambda x: len(x[1]))[1])} papers.\n"
        synthesis_parts.append(insights_section)
    
    await manager.send_stage_update(
        session_id,
        stage=6,
        progress=93,
        message="Finalizing report structure...",
        data={"sub_task": "finalization", "status": "assembling", "sections": len(synthesis_parts)}
    )
    
    # Combine all sections
    full_synthesis = "\n".join(synthesis_parts)
    
    # Create report object
    report = LiteratureReviewReport(
        query=", ".join(keywords),
        total_papers=len(papers),
        papers_by_theme={theme: len(plist) for theme, plist in themes.items()},
        papers_by_methodology={method: len(plist) for method, plist in methodologies.items()},
        top_papers=papers[:10],
        synthesis=full_synthesis,
        metadata={
            "themes": list(themes.keys()),
            "methodologies": list(methodologies.keys()),
            "avg_citations": sum(p.citation_count for p in papers) / len(papers) if papers else 0
        }
    )
    
    await manager.send_stage_complete(
        session_id,
        stage=6,
        result={
            "report_generated": True,
            "sections": len(synthesis_parts),
            "total_length": len(full_synthesis)
        },
        data={
            "report": report.model_dump()
        }
    )
    
    return report
