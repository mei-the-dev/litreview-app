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
        progress=10,
        message="Generating synthesis report..."
    )
    
    # Build synthesis sections
    synthesis_parts = []
    
    # 1. Overview
    overview = f"""# Literature Review: {', '.join(keywords)}

## Overview
This literature review analyzed {len(papers)} academic papers related to {', '.join(keywords)}.
The papers were classified into {len(themes)} thematic clusters and {len(methodologies)} methodological categories.
"""
    synthesis_parts.append(overview)
    
    await manager.send_stage_update(
        session_id,
        stage=6,
        progress=30,
        message="Analyzing thematic clusters..."
    )
    
    # 2. Thematic Analysis
    theme_section = "\n## Thematic Analysis\n\n"
    for theme, theme_papers in sorted(themes.items(), key=lambda x: len(x[1]), reverse=True):
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
        progress=60,
        message="Analyzing methodologies..."
    )
    
    # 3. Methodological Analysis
    method_section = "\n## Methodological Distribution\n\n"
    for method, method_papers in sorted(methodologies.items(), key=lambda x: len(x[1]), reverse=True):
        method_section += f"- **{method}**: {len(method_papers)} papers ({len(method_papers)/len(papers)*100:.1f}%)\n"
    
    synthesis_parts.append(method_section)
    
    # 4. Top Papers
    top_section = "\n## Highly Relevant Papers\n\n"
    for paper in papers[:10]:
        top_section += f"**{paper.final_rank}. {paper.title}**\n\n"
        top_section += f"- Authors: {', '.join(paper.authors[:3])}{' et al.' if len(paper.authors) > 3 else ''}\n"
        top_section += f"- Year: {paper.year or 'n.d.'}\n"
        top_section += f"- Citations: {paper.citation_count}\n"
        top_section += f"- Relevance Score: {paper.relevance_score:.3f if paper.relevance_score else 'N/A'}\n"
        if paper.url:
            top_section += f"- URL: {paper.url}\n"
        top_section += "\n"
    
    synthesis_parts.append(top_section)
    
    # 5. Key Insights (AI-generated summary)
    await manager.send_stage_update(
        session_id,
        stage=6,
        progress=80,
        message="Generating AI insights..."
    )
    
    try:
        # Summarize top abstracts
        top_abstracts = " ".join([
            p.abstract for p in papers[:5] if p.abstract
        ])
        if top_abstracts:
            ai_summary = await hf_client.summarize(top_abstracts[:2000], max_length=200)
            insights_section = f"\n## Key Insights\n\n{ai_summary}\n"
            synthesis_parts.append(insights_section)
    except Exception as e:
        print(f"Could not generate AI summary: {e}")
    
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
        }
    )
    
    return report
