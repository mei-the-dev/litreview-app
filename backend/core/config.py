from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # API Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # External APIs
    hf_token: str | None = None
    semantic_scholar_api_key: str | None = None
    use_local_models: bool = False
    
    # Pipeline Settings
    max_papers_per_query: int = 50
    relevance_threshold: float = 0.5
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
