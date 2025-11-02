"""
Test API Health Endpoint
Critical for monitoring and dashboard functionality
"""
import pytest


def test_health_endpoint_exists(client):
    """Test that /health endpoint exists"""
    response = client.get("/health")
    assert response.status_code == 200


def test_health_endpoint_returns_json(client):
    """Test that /health returns JSON"""
    response = client.get("/health")
    assert response.headers["content-type"] == "application/json"


def test_health_endpoint_structure(client):
    """Test /health response structure"""
    response = client.get("/health")
    data = response.json()
    
    assert "status" in data
    assert data["status"] == "healthy"


def test_health_endpoint_performance(client):
    """Test /health responds quickly (< 100ms)"""
    import time
    start = time.time()
    response = client.get("/health")
    elapsed = (time.time() - start) * 1000
    
    assert response.status_code == 200
    assert elapsed < 100, f"Health check took {elapsed}ms, should be < 100ms"
