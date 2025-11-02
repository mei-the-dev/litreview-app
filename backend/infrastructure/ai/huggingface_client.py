import httpx
from typing import List, Optional
from backend.core.config import settings
import numpy as np
import torch


class HuggingFaceClient:
    """Client for HuggingFace Inference API with GPU-accelerated local model fallback"""
    
    API_URL = "https://api-inference.huggingface.co/models"
    
    def __init__(self):
        self.api_token = settings.hf_token
        # Due to API compatibility issues with sentence-transformers via Inference API,
        # we default to local models for embeddings
        # HF API works better for summarization tasks
        self.use_local = settings.use_local_models or not self.api_token
        self.headers = {}
        if self.api_token:
            self.headers["Authorization"] = f"Bearer {self.api_token}"
        
        # GPU Configuration
        self.device = self._setup_device()
        self.use_fp16 = settings.enable_fp16 and self.device != "cpu"
        
        print(f"🚀 HuggingFace Client initialized:")
        print(f"   Device: {self.device}")
        if self.device == "cuda":
            gpu_name = torch.cuda.get_device_name(0)
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
            print(f"   GPU: {gpu_name} ({gpu_memory:.1f} GB)")
            print(f"   Mixed Precision (FP16): {self.use_fp16}")
        
        # Lazy load local models
        self._local_embedding_model = None
        self._local_summarization_model = None
    
    def _setup_device(self) -> str:
        """Detect and setup compute device"""
        if settings.use_gpu and torch.cuda.is_available():
            return "cuda"
        return "cpu"
    
    def _get_device_id(self) -> int:
        """Get device ID for transformers (-1 for CPU, 0 for first GPU)"""
        return 0 if self.device == "cuda" else -1
    
    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Get sentence embeddings for texts
        
        Note: HF Inference API has issues with sentence-transformer models.
        The all-MiniLM-L6-v2 model is configured as SentenceSimilarityPipeline
        which requires different input format not suitable for embedding extraction.
        We use local model for embeddings (more reliable).
        """
        # Always use local for embeddings due to API compatibility issues
        return await self._get_embeddings_local(texts)
    
    async def _get_embeddings_api(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings from HuggingFace API"""
        # Use a model that's explicitly for feature extraction, not similarity
        model = "sentence-transformers/all-MiniLM-L6-v2"
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            # For feature extraction, send one text at a time and collect results
            embeddings = []
            for text in texts:
                response = await client.post(
                    f"{self.API_URL}/{model}",
                    headers=self.headers,
                    json={"inputs": text, "options": {"wait_for_model": True}}
                )
                response.raise_for_status()
                embedding = response.json()
                
                # Response should be a single embedding vector
                if isinstance(embedding, list) and embedding:
                    # If it's a list of numbers, use it directly
                    if isinstance(embedding[0], (int, float)):
                        embeddings.append(embedding)
                    # If it's nested (batch dimension), take first element
                    elif isinstance(embedding[0], list):
                        embeddings.append(embedding[0])
                else:
                    raise ValueError(f"Unexpected embedding format: {type(embedding)}")
            
            return embeddings

    
    async def _get_embeddings_local(self, texts: List[str]) -> List[List[float]]:
        """Get embeddings from local model with GPU acceleration"""
        if self._local_embedding_model is None:
            from sentence_transformers import SentenceTransformer
            print(f"📦 Loading embedding model: {settings.embedding_model}")
            print(f"   Target device: {self.device}")
            self._local_embedding_model = SentenceTransformer(
                settings.embedding_model,
                device=self.device
            )
            
            # Warm up the model
            print("   Warming up model...")
            _ = self._local_embedding_model.encode(["warmup"], show_progress_bar=False)
            print("   ✅ Model ready!")
            
            if self.device == "cuda":
                memory_allocated = torch.cuda.memory_allocated(0) / 1024**2
                print(f"   GPU Memory: {memory_allocated:.1f} MB")
        
        # Batch encode with progress bar disabled for cleaner logs
        embeddings = self._local_embedding_model.encode(
            texts,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True
        )
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
        """Summarize using GPU-accelerated local model"""
        if self._local_summarization_model is None:
            print(f"📦 Loading summarization model: {settings.summarization_model}")
            print(f"   Target device: {self.device}")
            print("   This may take 1-2 minutes on first run to download ~1.6GB model")
            
            from transformers import pipeline
            
            # Load with GPU if available
            self._local_summarization_model = pipeline(
                "summarization", 
                model=settings.summarization_model,
                device=self._get_device_id(),
                torch_dtype=torch.float16 if self.use_fp16 else torch.float32
            )
            
            # Warm up
            print("   Warming up model...")
            _ = self._local_summarization_model(
                "This is a warmup text.", 
                max_length=50, 
                min_length=10,
                do_sample=False
            )
            print("   ✅ Model ready!")
            
            if self.device == "cuda":
                memory_allocated = torch.cuda.memory_allocated(0) / 1024**2
                memory_reserved = torch.cuda.memory_reserved(0) / 1024**2
                print(f"   GPU Memory: {memory_allocated:.1f} MB allocated, {memory_reserved:.1f} MB reserved")
        
        # Perform summarization
        result = self._local_summarization_model(
            text, 
            max_length=max_length, 
            min_length=min(30, max_length - 10), 
            do_sample=False,
            truncation=True
        )
        return result[0]["summary_text"]


    def get_gpu_stats(self) -> dict:
        """Get current GPU statistics"""
        if self.device == "cuda" and torch.cuda.is_available():
            return {
                "device": self.device,
                "gpu_name": torch.cuda.get_device_name(0),
                "memory_allocated_mb": torch.cuda.memory_allocated(0) / 1024**2,
                "memory_reserved_mb": torch.cuda.memory_reserved(0) / 1024**2,
                "memory_total_gb": torch.cuda.get_device_properties(0).total_memory / 1024**3,
                "fp16_enabled": self.use_fp16
            }
        return {
            "device": "cpu",
            "fp16_enabled": False
        }


# Global client instance
hf_client = HuggingFaceClient()
