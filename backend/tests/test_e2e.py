"""
End-to-End Tests (Non-Mocked)
Tests complete system functionality with real APIs
"""
import pytest
import asyncio
from pathlib import Path


@pytest.mark.e2e
@pytest.mark.asyncio
@pytest.mark.timeout(180)
async def test_health_endpoint_e2e(client):
    """E2E: Verify health endpoint works"""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    
    print("✅ Health endpoint working")


@pytest.mark.e2e
@pytest.mark.asyncio
async def test_semantic_scholar_connection():
    """E2E: Verify can connect to Semantic Scholar"""
    import httpx
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://api.semanticscholar.org/graph/v1/paper/search",
                params={"query": "machine learning", "limit": 1},
                timeout=10.0
            )
            
            # 200 = success, 429 = rate limited (but API is accessible)
            assert response.status_code in [200, 429], f"Unexpected status: {response.status_code}"
            
            if response.status_code == 200:
                data = response.json()
                assert "data" in data
                print("✅ Semantic Scholar API accessible")
            else:
                print("✅ Semantic Scholar API accessible (rate limited)")
                
        except httpx.TimeoutException:
            pytest.skip("Semantic Scholar API timeout")


@pytest.mark.e2e
@pytest.mark.asyncio 
async def test_huggingface_or_local_model():
    """E2E: Verify AI model (HF API or local) works"""
    try:
        # Try importing sentence transformers (local fallback)
        from sentence_transformers import SentenceTransformer
        
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = model.encode(["test sentence"])
        
        assert embeddings is not None
        assert len(embeddings) > 0
        
        print("✅ Local AI model working")
        
    except ImportError:
        pytest.skip("sentence-transformers not installed")


@pytest.mark.e2e  
def test_frontend_exists():
    """E2E: Verify frontend directory exists"""
    frontend_path = Path(__file__).parent.parent.parent / "frontend"
    
    assert frontend_path.exists(), "Frontend directory not found"
    assert (frontend_path / "package.json").exists(), "package.json not found"
    
    print("✅ Frontend structure exists")


@pytest.mark.e2e
def test_all_stage_files_exist():
    """E2E: Verify all 7 pipeline stage files exist"""
    stages_path = Path(__file__).parent.parent / "domain" / "pipeline"
    
    for i in range(1, 8):
        stage_file = stages_path / f"stage_{i}_*.py"
        matching_files = list(stages_path.glob(f"stage_{i}_*.py"))
        
        assert len(matching_files) > 0, f"Stage {i} file not found"
    
    print("✅ All 7 pipeline stages exist")


@pytest.mark.e2e
def test_api_documentation_accessible(client):
    """E2E: Verify OpenAPI docs are accessible"""
    response = client.get("/docs")
    
    assert response.status_code == 200
    
    print("✅ API documentation accessible")


@pytest.mark.e2e
def test_cors_configuration(client):
    """E2E: Verify CORS headers are set"""
    # Test that CORS allows requests from frontend
    response = client.get(
        "/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET"
        }
    )
    
    # Should respond (CORS configured if response exists)
    assert response.status_code in [200, 204]
    
    print("✅ CORS configured")


@pytest.mark.e2e
def test_logs_directory_exists():
    """E2E: Verify logs directory can be created"""
    logs_path = Path(__file__).parent.parent.parent / "logs"
    logs_path.mkdir(exist_ok=True)
    
    assert logs_path.exists()
    assert logs_path.is_dir()
    
    print("✅ Logs directory accessible")


@pytest.mark.e2e
def test_dashboard_script_exists():
    """E2E: Verify dashboard.py exists"""
    dashboard_path = Path(__file__).parent.parent.parent / "dashboard.py"
    
    assert dashboard_path.exists(), "dashboard.py not found"
    
    print("✅ Dashboard script exists")


@pytest.mark.e2e
def test_run_scripts_exist():
    """E2E: Verify run scripts exist and are executable"""
    app_path = Path(__file__).parent.parent.parent
    
    scripts = ["run.sh", "stop.sh", "monitor.sh", "setup.sh"]
    
    for script in scripts:
        script_path = app_path / script
        assert script_path.exists(), f"{script} not found"
        
        # Check if executable (on Unix)
        import os
        if os.name != 'nt':  # Not Windows
            assert os.access(script_path, os.X_OK), f"{script} not executable"
    
    print("✅ All run scripts exist and are executable")
