"""
Real End-to-End Pipeline Tests
Tests that execute the actual pipeline with real data and verify results.
These tests catch runtime errors that unit tests miss.
"""
import pytest
import httpx
import asyncio
import time
from pathlib import Path


BASE_URL = "http://localhost:8000"


@pytest.mark.asyncio
async def test_full_pipeline_execution():
    """Execute full pipeline with real data and verify completion"""
    
    # Start pipeline
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/pipeline/start",
            json={"keywords": ["machine learning"], "max_papers": 5}
        )
        assert response.status_code == 200, f"Failed to start pipeline: {response.text}"
        
        data = response.json()
        assert "session_id" in data, "No session_id in response"
        session_id = data["session_id"]
        
        # Poll for completion (max 120 seconds)
        max_attempts = 24  # 24 * 5 = 120 seconds
        for attempt in range(max_attempts):
            await asyncio.sleep(5)
            
            status_response = await client.get(
                f"{BASE_URL}/api/pipeline/status/{session_id}"
            )
            assert status_response.status_code == 200, "Failed to get status"
            
            status_data = status_response.json()
            status = status_data.get("status")
            
            if status == "completed":
                # Success!
                break
            elif status == "failed":
                error = status_data.get("error", "Unknown error")
                pytest.fail(f"Pipeline failed: {error}")
            elif status not in ["pending", "running"]:
                pytest.fail(f"Unexpected status: {status}")
        else:
            pytest.fail(f"Pipeline did not complete within 120 seconds")


@pytest.mark.asyncio
async def test_stage_6_synthesis_no_format_errors():
    """Regression test for format string bug in stage 6"""
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/pipeline/start",
            json={"keywords": ["neural networks"], "max_papers": 3}
        )
        assert response.status_code == 200
        session_id = response.json()["session_id"]
        
        # Wait for pipeline to complete or fail
        for _ in range(24):
            await asyncio.sleep(5)
            status_response = await client.get(
                f"{BASE_URL}/api/pipeline/status/{session_id}"
            )
            status_data = status_response.json()
            status = status_data.get("status")
            
            if status in ["completed", "failed"]:
                # Check for specific format error
                error_msg = status_data.get("error", "")
                assert "Invalid format specifier" not in error_msg, \
                    f"Format string error in stage 6: {error_msg}"
                assert status == "completed", \
                    f"Pipeline failed: {error_msg}"
                break


@pytest.mark.asyncio
async def test_output_files_generated():
    """Verify that pipeline generates actual output files"""
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/pipeline/start",
            json={"keywords": ["deep learning"], "max_papers": 3}
        )
        assert response.status_code == 200
        session_id = response.json()["session_id"]
        
        # Wait for completion
        for _ in range(24):
            await asyncio.sleep(5)
            status_response = await client.get(
                f"{BASE_URL}/api/pipeline/status/{session_id}"
            )
            status_data = status_response.json()
            
            if status_data.get("status") == "completed":
                # Check result
                result_response = await client.get(
                    f"{BASE_URL}/api/pipeline/result/{session_id}"
                )
                assert result_response.status_code == 200
                result = result_response.json()
                
                # The result contains report + metadata
                assert "report" in result or "synthesis" in result, "No report in result"
                
                report = result.get("report", result)
                
                # Verify report structure
                assert "synthesis" in report, f"No synthesis in report. Keys: {report.keys()}"
                assert "total_papers" in report, "No total_papers in result"
                assert report["total_papers"] > 0, "No papers processed"
                
                # Check output directory (relative to test run location)
                output_dir = Path("output")
                if not output_dir.exists():
                    output_dir = Path("backend/output")
                
                pdf_files = list(output_dir.glob("literature_review_*.pdf"))
                html_files = list(output_dir.glob("literature_review_*.html"))
                
                # Should have at least one output file (PDF or HTML fallback)
                assert len(pdf_files) + len(html_files) > 0, \
                    "No output files generated"
                
                break
        else:
            pytest.fail("Pipeline did not complete")


@pytest.mark.asyncio  
async def test_relevance_score_formatting():
    """Test that relevance scores are properly formatted in synthesis"""
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/pipeline/start",
            json={"keywords": ["AI"], "max_papers": 5}
        )
        assert response.status_code == 200
        session_id = response.json()["session_id"]
        
        # Wait for completion
        for _ in range(24):
            await asyncio.sleep(5)
            status_response = await client.get(
                f"{BASE_URL}/api/pipeline/status/{session_id}"
            )
            status_data = status_response.json()
            
            if status_data.get("status") == "completed":
                result_response = await client.get(
                    f"{BASE_URL}/api/pipeline/result/{session_id}"
                )
                result = result_response.json()
                
                # The result contains report + metadata
                report = result.get("report", result)
                synthesis = report.get("synthesis", "")
                
                # Check that relevance scores appear in synthesis
                assert synthesis, "synthesis is empty"
                assert "Relevance Score:" in synthesis, \
                    f"Relevance Score field missing from synthesis. First 200 chars: {synthesis[:200]}"
                
                # Should not have any Python format spec errors
                assert ".3f if" not in synthesis, \
                    "Unformatted conditional in synthesis"
                
                break
        else:
            pytest.fail("Pipeline did not complete")


@pytest.mark.asyncio
async def test_no_errors_in_backend_logs():
    """Verify that pipeline execution doesn't produce ERROR logs"""
    
    # Read initial log size
    log_file = Path("logs/backend.log")
    if log_file.exists():
        initial_size = log_file.stat().st_size
    else:
        initial_size = 0
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/pipeline/start",
            json={"keywords": ["transformer models"], "max_papers": 3}
        )
        assert response.status_code == 200
        session_id = response.json()["session_id"]
        
        # Wait for completion
        for _ in range(24):
            await asyncio.sleep(5)
            status_response = await client.get(
                f"{BASE_URL}/api/pipeline/status/{session_id}"
            )
            
            if status_response.json().get("status") in ["completed", "failed"]:
                break
    
    # Check logs for errors (excluding allowed fallback messages)
    if log_file.exists():
        with open(log_file, 'r') as f:
            # Read only new content
            f.seek(initial_size)
            new_logs = f.read()
            
            # Filter out allowed messages
            lines = new_logs.split('\n')
            error_lines = [
                line for line in lines 
                if ('ERROR' in line or 'Exception' in line or 'Traceback' in line)
                and 'falling back to local' not in line  # This is expected
            ]
            
            assert len(error_lines) == 0, \
                f"Found {len(error_lines)} errors in logs:\n" + \
                '\n'.join(error_lines[:5])  # Show first 5 errors


@pytest.mark.asyncio
async def test_huggingface_api_or_fallback_works():
    """Verify HuggingFace API works or local fallback succeeds"""
    
    from backend.infrastructure.ai.huggingface_client import hf_client
    
    # Test embeddings
    texts = ["machine learning", "neural networks"]
    embeddings = await hf_client.get_embeddings(texts)
    
    assert len(embeddings) == 2, "Should return 2 embeddings"
    assert len(embeddings[0]) == 384, "Embeddings should be 384-dimensional"
    assert all(isinstance(x, float) for x in embeddings[0]), \
        "Embeddings should be floats"


@pytest.mark.asyncio
async def test_semantic_scholar_api_works():
    """Verify Semantic Scholar API returns valid results"""
    
    from backend.infrastructure.external.semantic_scholar import semantic_scholar
    
    papers = await semantic_scholar.search_papers(
        keywords=["machine learning"],
        limit=5
    )
    
    assert len(papers) > 0, "Should return at least 1 paper"
    assert papers[0].title, "Papers should have titles"
    assert papers[0].authors, "Papers should have authors"
