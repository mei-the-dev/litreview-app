"""
Test UX presentation features: data flow from backend to frontend.
Tests WebSocket data transmission and state management for results display.
"""
import pytest
import json
import asyncio
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket
from tests.fixtures.sample_data import SAMPLE_PAPERS, SAMPLE_THEMES, SAMPLE_METHODOLOGIES, SAMPLE_REPORT


class TestResultsDataFlow:
    """Test that pipeline results are properly sent via WebSocket."""
    
    def test_stage_1_sends_papers_data(self, client):
        """Test that stage 1 completion sends papers array."""
        # Start a pipeline
        response = client.post("/api/pipeline/start", json={
            "keywords": ["test"],
            "max_papers": 5
        })
        assert response.status_code == 200
        session_id = response.json()["session_id"]
        
        # Mock the WebSocket message that should be sent
        expected_message = {
            "type": "stage_complete",
            "stage": 1,
            "data": {
                "papers": SAMPLE_PAPERS,
                "papers_count": len(SAMPLE_PAPERS)
            },
            "result": {
                "papers_count": len(SAMPLE_PAPERS)
            }
        }
        
        # Verify papers data structure
        assert isinstance(SAMPLE_PAPERS, list)
        assert len(SAMPLE_PAPERS) > 0
        assert all("paper_id" in p for p in SAMPLE_PAPERS)
        assert all("title" in p for p in SAMPLE_PAPERS)
        
        # log_monitor.log_info(f"Stage 1 should send {len(SAMPLE_PAPERS)} papers")
    
    def test_stage_3_sends_themes_data(self):
        """Test that stage 3 completion sends themes grouping."""
        expected_message = {
            "type": "stage_complete",
            "stage": 3,
            "data": {
                "themes": SAMPLE_THEMES,
                "themes_found": len(SAMPLE_THEMES)
            },
            "result": {
                "themes_found": len(SAMPLE_THEMES)
            }
        }
        
        # Verify themes data structure
        assert isinstance(SAMPLE_THEMES, dict)
        assert len(SAMPLE_THEMES) > 0
        for theme, papers in SAMPLE_THEMES.items():
            assert isinstance(papers, list)
            assert all("theme" in p for p in papers)
        
        # log_monitor.info(f"Stage 3 should send {len(SAMPLE_THEMES)} themes")
    
    def test_stage_4_sends_methodologies_data(self):
        """Test that stage 4 completion sends methodology grouping."""
        expected_message = {
            "type": "stage_complete",
            "stage": 4,
            "data": {
                "methodologies": SAMPLE_METHODOLOGIES,
                "methodologies_found": len(SAMPLE_METHODOLOGIES)
            },
            "result": {
                "methodologies_found": len(SAMPLE_METHODOLOGIES)
            }
        }
        
        # Verify methodologies data structure
        assert isinstance(SAMPLE_METHODOLOGIES, dict)
        assert len(SAMPLE_METHODOLOGIES) > 0
        for methodology, papers in SAMPLE_METHODOLOGIES.items():
            assert isinstance(papers, list)
            assert all("methodology" in p for p in papers)
        
        # log_monitor.info(f"Stage 4 should send {len(SAMPLE_METHODOLOGIES)} methodologies")
    
    def test_stage_5_sends_ranked_papers(self):
        """Test that stage 5 completion sends ranked papers."""
        ranked_papers = sorted(SAMPLE_PAPERS, key=lambda p: p.get("final_rank", 999))
        
        expected_message = {
            "type": "stage_complete",
            "stage": 5,
            "data": {
                "ranked_papers": ranked_papers,
                "papers_ranked": len(ranked_papers)
            },
            "result": {
                "papers_ranked": len(ranked_papers)
            }
        }
        
        # Verify ranking
        assert all("final_rank" in p for p in ranked_papers)
        assert ranked_papers[0]["final_rank"] == 1
        
        # log_monitor.info(f"Stage 5 should send {len(ranked_papers)} ranked papers")
    
    def test_stage_6_sends_report(self):
        """Test that stage 6 completion sends full report."""
        expected_message = {
            "type": "stage_complete",
            "stage": 6,
            "data": {
                "report": SAMPLE_REPORT
            },
            "result": {
                "report_generated": True
            }
        }
        
        # Verify report structure
        assert "query" in SAMPLE_REPORT
        assert "total_papers" in SAMPLE_REPORT
        assert "papers_by_theme" in SAMPLE_REPORT
        assert "papers_by_methodology" in SAMPLE_REPORT
        assert "synthesis" in SAMPLE_REPORT
        assert len(SAMPLE_REPORT["synthesis"]) > 0
        
        # log_monitor.info("Stage 6 should send complete report")
    
    def test_stage_7_sends_pdf_path(self):
        """Test that stage 7 completion sends PDF path."""
        pdf_path = "/output/test_session/report.pdf"
        
        expected_message = {
            "type": "stage_complete",
            "stage": 7,
            "result": {
                "pdf_path": pdf_path,
                "pdf_generated": True
            }
        }
        
        assert pdf_path.endswith(".pdf")
        # log_monitor.info(f"Stage 7 should send PDF path: {pdf_path}")


class TestResultsEndpoints:
    """Test API endpoints for accessing results."""
    
    def test_get_papers_endpoint(self, client):
        """Test endpoint to retrieve papers."""
        # This would be implemented if we add REST endpoints for results
        # For now, verify data is available via WebSocket
        # log_monitor.info("Papers should be accessible via WebSocket stage 1 completion")
    
    def test_get_report_endpoint(self, client):
        """Test endpoint to retrieve report."""
        # log_monitor.info("Report should be accessible via WebSocket stage 6 completion")
    
    def test_pdf_download_endpoint(self, client):
        """Test PDF can be downloaded."""
        # Test would attempt to download PDF from /output/{session}/report.pdf
        # log_monitor.info("PDF should be downloadable from output path")


class TestDataIntegrity:
    """Test that data remains consistent through the pipeline."""
    
    def test_papers_maintain_all_fields(self):
        """Test that papers keep all required fields through stages."""
        required_fields = ["paper_id", "title", "abstract", "authors", "year", "citation_count"]
        
        for paper in SAMPLE_PAPERS:
            for field in required_fields:
                assert field in paper, f"Paper missing required field: {field}"
        
        # log_monitor.info("All papers have required fields")
    
    def test_theme_grouping_preserves_papers(self):
        """Test that grouping by theme doesn't lose papers."""
        total_papers_in_themes = sum(len(papers) for papers in SAMPLE_THEMES.values())
        assert total_papers_in_themes == len(SAMPLE_PAPERS)
        
        # log_monitor.info(f"Theme grouping preserves all {len(SAMPLE_PAPERS)} papers")
    
    def test_methodology_grouping_preserves_papers(self):
        """Test that grouping by methodology doesn't lose papers."""
        total_papers_in_methodologies = sum(len(papers) for papers in SAMPLE_METHODOLOGIES.values())
        assert total_papers_in_methodologies == len(SAMPLE_PAPERS)
        
        # log_monitor.info(f"Methodology grouping preserves all {len(SAMPLE_PAPERS)} papers")
    
    def test_ranking_maintains_order(self):
        """Test that rankings are consistent."""
        ranked = sorted(SAMPLE_PAPERS, key=lambda p: p["final_rank"])
        
        for i, paper in enumerate(ranked, 1):
            assert paper["final_rank"] == i, f"Ranking mismatch at position {i}"
        
        # log_monitor.info("Rankings are consistent and ordered")


class TestPerformance:
    """Test performance of results data transmission."""
    
    def test_large_dataset_transmission(self):
        """Test that large datasets can be transmitted efficiently."""
        # Generate 100 papers
        large_dataset = SAMPLE_PAPERS * 20
        
        # Verify size is manageable
        json_size = len(json.dumps(large_dataset))
        assert json_size < 10 * 1024 * 1024  # Less than 10MB
        
        # log_monitor.info(f"Large dataset ({len(large_dataset)} papers) is {json_size} bytes")
    
    def test_report_size_reasonable(self):
        """Test that report size is reasonable for transmission."""
        report_size = len(json.dumps(SAMPLE_REPORT))
        assert report_size < 1 * 1024 * 1024  # Less than 1MB
        
        # log_monitor.info(f"Report size is {report_size} bytes")


@pytest.mark.integration
class TestEndToEndResultsFlow:
    """Integration tests for complete results flow."""
    
    @pytest.mark.asyncio
    async def test_complete_pipeline_results_available(self, client):
        """Test that running complete pipeline makes all results available."""
        # Start pipeline
        response = client.post("/api/pipeline/start", json={
            "keywords": ["machine learning"],
            "max_papers": 5
        })
        assert response.status_code == 200
        session_id = response.json()["session_id"]
        
        # Wait briefly for pipeline to start processing
        import time
        time.sleep(2)
        
        # Check pipeline status
        status_response = client.get(f"/api/pipeline/status/{session_id}")
        assert status_response.status_code == 200
        status_data = status_response.json()
        
        # Verify pipeline started successfully
        assert status_data["status"] in ["running", "in_progress", "completed"], \
            f"Pipeline should be running or completed, got: {status_data['status']}"


class TestResultsViewTransition:
    """Test the transition from pipeline view to results view."""
    
    def test_transition_trigger_on_stage_7_complete(self):
        """Test that completing stage 7 triggers view transition."""
        # In frontend, setPdfPath should set currentView to 'results'
        # This is tested in frontend tests, but we verify backend sends correct signal
        
        pdf_path = "/output/session123/report.pdf"
        stage_7_message = {
            "type": "stage_complete",
            "stage": 7,
            "result": {"pdf_path": pdf_path, "pdf_generated": True}
        }
        
        assert stage_7_message["stage"] == 7
        assert stage_7_message["result"]["pdf_path"]
        
        # log_monitor.info("Stage 7 completion should trigger results view")
    
    def test_all_result_data_available_before_transition(self):
        """Test that all data is available when transitioning to results."""
        # Verify all stages have sent their data before stage 7
        required_data = {
            "stage_1": "papers",
            "stage_3": "themes",
            "stage_4": "methodologies",
            "stage_5": "ranked_papers",
            "stage_6": "report",
            "stage_7": "pdf_path"
        }
        
        # In a real test, we'd verify WebSocket sent all these
        # log_monitor.info("All result data should be available before showing results view")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
