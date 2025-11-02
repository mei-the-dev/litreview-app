"""
Pytest configuration and fixtures for LitReview tests
"""
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.main import app
from backend.core.config import settings
from tests.log_monitor import log_monitor, log_file_monitor  # Import log monitoring


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def mock_semantic_scholar_response():
    """Mock response from Semantic Scholar API"""
    return {
        "data": [
            {
                "paperId": "123abc",
                "title": "Deep Learning for Natural Language Processing",
                "abstract": "This paper explores deep learning techniques for NLP tasks.",
                "year": 2023,
                "authors": [
                    {"name": "John Doe", "authorId": "456"}
                ],
                "citationCount": 42,
                "url": "https://example.com/paper/123",
                "venue": "NeurIPS",
                "publicationTypes": ["Conference"],
                "influentialCitationCount": 12
            }
        ],
        "total": 1
    }


@pytest.fixture
def sample_papers():
    """Sample papers for testing"""
    return [
        {
            "id": "123abc",
            "title": "Deep Learning for NLP",
            "abstract": "This paper explores deep learning techniques.",
            "year": 2023,
            "authors": ["John Doe"],
            "citations": 42,
            "url": "https://example.com/123",
            "relevance_score": 0.85
        }
    ]


@pytest.fixture
def sample_query():
    """Sample query for testing"""
    return {
        "keywords": "machine learning neural networks",
        "max_papers": 10
    }


# Export fixtures
__all__ = ['client', 'mock_semantic_scholar_response', 'sample_papers', 'sample_query', 'log_monitor', 'log_file_monitor']
