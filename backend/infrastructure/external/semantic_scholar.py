import httpx
from typing import List, Optional
from backend.api.models.paper_model import Paper
from backend.core.config import settings
import asyncio


class SemanticScholarClient:
    """Client for Semantic Scholar API"""
    
    BASE_URL = "https://api.semanticscholar.org/graph/v1"
    
    def __init__(self):
        self.api_key = settings.semantic_scholar_api_key
        self.headers = {}
        if self.api_key:
            self.headers["x-api-key"] = self.api_key
    
    async def search_papers(self, keywords: List[str], limit: int = 50) -> List[Paper]:
        """Search for papers using keywords"""
        query = " ".join(keywords)
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/paper/search",
                    params={
                        "query": query,
                        "limit": limit,
                        "fields": "paperId,title,abstract,authors,year,citationCount,url,venue"
                    },
                    headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                
                papers = []
                for item in data.get("data", []):
                    try:
                        paper = Paper(
                            paper_id=item.get("paperId", ""),
                            title=item.get("title", ""),
                            abstract=item.get("abstract"),
                            authors=[a.get("name", "") for a in item.get("authors", [])],
                            year=item.get("year"),
                            citation_count=item.get("citationCount", 0),
                            url=item.get("url"),
                            venue=item.get("venue")
                        )
                        papers.append(paper)
                    except Exception as e:
                        print(f"Error parsing paper: {e}")
                        continue
                
                return papers
                
            except httpx.HTTPError as e:
                print(f"Error fetching papers: {e}")
                raise Exception(f"Failed to fetch papers from Semantic Scholar: {str(e)}")
    
    async def get_paper_details(self, paper_id: str) -> Optional[Paper]:
        """Get detailed information for a specific paper"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/paper/{paper_id}",
                    params={"fields": "paperId,title,abstract,authors,year,citationCount,url,venue"},
                    headers=self.headers
                )
                response.raise_for_status()
                item = response.json()
                
                return Paper(
                    paper_id=item.get("paperId", ""),
                    title=item.get("title", ""),
                    abstract=item.get("abstract"),
                    authors=[a.get("name", "") for a in item.get("authors", [])],
                    year=item.get("year"),
                    citation_count=item.get("citationCount", 0),
                    url=item.get("url"),
                    venue=item.get("venue")
                )
            except httpx.HTTPError:
                return None


# Global instance
semantic_scholar = SemanticScholarClient()

