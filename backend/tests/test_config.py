"""
Test Configuration Module
Ensures environment variables and settings work correctly
"""
import pytest
from backend.core.config import settings


def test_settings_exist():
    """Test that settings object exists"""
    assert settings is not None


def test_default_settings():
    """Test default settings values"""
    assert settings.host == "0.0.0.0"
    assert settings.port == 8000
    assert isinstance(settings.debug, bool)


def test_cors_origins_parsing():
    """Test CORS origins are properly parsed"""
    origins = settings.get_cors_origins_list()
    assert isinstance(origins, list)
    assert len(origins) > 0


def test_pipeline_settings():
    """Test pipeline configuration settings"""
    assert hasattr(settings, 'max_papers_per_query')
    assert hasattr(settings, 'relevance_threshold')
    assert isinstance(settings.max_papers_per_query, int)
    assert isinstance(settings.relevance_threshold, float)
