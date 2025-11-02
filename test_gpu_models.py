#!/usr/bin/env python3
"""
Test GPU model loading and performance
"""
import asyncio
import sys
import os
import time

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.infrastructure.ai.huggingface_client import hf_client

async def test_gpu():
    """Test GPU configuration"""
    print("="*60)
    print("🎮 GPU MODEL TESTING")
    print("="*60)
    
    # Show GPU stats
    stats = hf_client.get_gpu_stats()
    print("\n📊 Initial GPU Stats:")
    for key, value in stats.items():
        print(f"   {key}: {value}")
    
    print("\n" + "="*60)
    print("Testing Embeddings Model (sentence-transformers)")
    print("="*60)
    
    test_texts = [
        "Machine learning is a subset of artificial intelligence.",
        "Natural language processing enables computers to understand human language.",
        "Deep learning uses neural networks with multiple layers."
    ]
    
    start = time.time()
    embeddings = await hf_client.get_embeddings(test_texts)
    elapsed = time.time() - start
    
    print(f"\n✅ Embeddings generated!")
    print(f"   Texts: {len(test_texts)}")
    print(f"   Embedding dimension: {len(embeddings[0])}")
    print(f"   Time: {elapsed:.3f}s")
    
    # Show GPU stats after embeddings
    stats = hf_client.get_gpu_stats()
    if stats.get("device") == "cuda":
        print(f"   GPU Memory Used: {stats.get('memory_allocated_mb', 0):.1f} MB")
    
    print("\n" + "="*60)
    print("Testing Summarization Model (BART)")
    print("="*60)
    
    test_abstract = """
    Recent advances in natural language processing have been driven by the development of 
    large-scale pre-trained language models such as BERT, GPT, and their variants. These 
    models are trained on massive corpora of text data and can be fine-tuned for a wide 
    range of downstream tasks. The transformer architecture, which underlies these models, 
    has proven to be highly effective for capturing long-range dependencies in text. 
    However, the computational cost of training and deploying these models remains a 
    significant challenge for researchers and practitioners.
    """
    
    start = time.time()
    summary = await hf_client.summarize(test_abstract, max_length=100)
    elapsed = time.time() - start
    
    print(f"\n✅ Summary generated!")
    print(f"   Input length: {len(test_abstract)} chars")
    print(f"   Summary: {summary}")
    print(f"   Time: {elapsed:.3f}s")
    
    # Show final GPU stats
    stats = hf_client.get_gpu_stats()
    if stats.get("device") == "cuda":
        print(f"   GPU Memory Used: {stats.get('memory_allocated_mb', 0):.1f} MB")
        print(f"   GPU Memory Reserved: {stats.get('memory_reserved_mb', 0):.1f} MB")
    
    print("\n" + "="*60)
    print("✨ GPU Test Complete!")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_gpu())
