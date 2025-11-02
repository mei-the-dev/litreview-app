from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # API Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    # CORS - will be split from comma-separated string
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    
    # External APIs
    hf_token: str | None = None
    semantic_scholar_api_key: str | None = None
    use_local_models: bool = False
    
    # GPU Configuration
    use_gpu: bool = True  # Auto-detect and use GPU if available
    enable_fp16: bool = True  # Mixed precision for better performance
    embedding_model: str = "sentence-transformers/all-mpnet-base-v2"
    summarization_model: str = "facebook/bart-large-cnn"
    
    # Pipeline Settings
    max_papers_per_query: int = 50
    relevance_threshold: float = 0.5
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_insensitive=True,
        extra="ignore"
    )
    
    def get_cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
