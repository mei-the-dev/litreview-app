import httpx
from typing import List, Optional
from backend.core.config import settings
import numpy as np


class HuggingFaceClient:
    """Client for HuggingFace Inference API with local model fallback"""
    
    API_URL = "https://api-inference.huggingface.co/models"
    
    def __init__(self):
        self.api_token = settings.hf_token
        self.use_local = settings.use_local_models or not self.api_token
        self.headers = {}
        if self.api_token:
            self.headers["Authorization"] = f"Bearer {self.api_token}"
        
        # Lazy load local models
        self._local_embedding_model = None
        self._local_summarization_model = None
    
    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get sentence embeddings for texts"""
        if self.use_local:
            return await self._get_embeddings_local(texts)
        
        try:
            return await self._get_embeddings_api(texts)
        except Exception as e:
            print(f"HF API failed, falling back to local: {e}")
            return await self._get_embeddings_local(texts)
    
    async def _get_embeddings_api(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings from HuggingFace API"""
        model = "sentence-transformers/all-MiniLM-L6-v2"
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.API_URL}/{model}",
                headers=self.headers,
                json={"inputs": texts, "options": {"wait_for_model": True}}
            )
            response.raise_for_status()
            return response.json()
    
    async def _get_embeddings_local(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings from local model"""
        if self._local_embedding_model is None:
            from sentence_transformers import SentenceTransformer
            self._local_embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        
        embeddings = self._local_embedding_model.encode(texts)
        return embeddings.tolist()
    
    async def summarize(self, text: str, max_length: int = 150) -> str:
        """Summarize text"""
        if self.use_local:
            return await self._summarize_local(text, max_length)
        
        try:
            return await self._summarize_api(text, max_length)
        except Exception as e:
            print(f"HF API failed, falling back to local: {e}")
            return await self._summarize_local(text, max_length)
    
    async def _summarize_api(self, text: str, max_length: int) -> str:
        """Summarize using HuggingFace API"""
        model = "facebook/bart-large-cnn"
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.API_URL}/{model}",
                headers=self.headers,
                json={
                    "inputs": text,
                    "parameters": {
                        "max_length": max_length,
                        "min_length": 30
                    },
                    "options": {"wait_for_model": True}
                }
            )
            response.raise_for_status()
            result = response.json()
            return result[0]["summary_text"] if isinstance(result, list) else result["summary_text"]
    
    async def _summarize_local(self, text: str, max_length: int) -> str:
        """Summarize using local model"""
        if self._local_summarization_model is None:
            from transformers import pipeline
            self._local_summarization_model = pipeline("summarization", model="facebook/bart-large-cnn")
        
        result = self._local_summarization_model(text, max_length=max_length, min_length=30, do_sample=False)
        return result[0]["summary_text"]


# Global client instance
hf_client = HuggingFaceClient()
