#!/usr/bin/env python3
"""
Diagnostic script for Stage 6 synthesis issues
Tests HF API, local models, and provides recommendations
"""
import asyncio
import sys
import time
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

async def test_hf_api():
    """Test HuggingFace API connectivity and authentication"""
    print("\n" + "="*60)
    print("TEST 1: HuggingFace API")
    print("="*60)
    
    try:
        from infrastructure.ai.huggingface_client import hf_client
        from core.config import settings
        
        print(f"HF Token configured: {bool(settings.hf_token)}")
        print(f"Token length: {len(settings.hf_token) if settings.hf_token else 0}")
        print(f"Use local models: {settings.use_local_models}")
        
        test_text = "Artificial intelligence and machine learning are transforming how we process and analyze data. " * 5
        
        print("\nTesting HF API summarization...")
        start = time.time()
        try:
            summary = await hf_client._summarize_api(test_text, max_length=50)
            elapsed = time.time() - start
            print(f"✓ HF API working! ({elapsed:.1f}s)")
            print(f"  Summary: {summary[:100]}...")
            return True
        except Exception as e:
            elapsed = time.time() - start
            print(f"✗ HF API failed ({elapsed:.1f}s): {type(e).__name__}: {str(e)[:100]}")
            return False
            
    except Exception as e:
        print(f"✗ Setup error: {e}")
        return False

async def test_local_model():
    """Test local summarization model"""
    print("\n" + "="*60)
    print("TEST 2: Local Summarization Model")
    print("="*60)
    
    try:
        from infrastructure.ai.huggingface_client import hf_client
        
        # Check if model is already cached
        from pathlib import Path
        cache_dir = Path.home() / ".cache" / "huggingface" / "hub"
        model_dirs = list(cache_dir.glob("models--facebook--bart-large-cnn*")) if cache_dir.exists() else []
        
        if model_dirs:
            print(f"✓ Model cached at: {model_dirs[0]}")
            print("  Model should load quickly")
        else:
            print("⚠ Model not cached - will download ~1.6GB on first use")
            print("  This can take 1-2 minutes depending on connection speed")
        
        test_text = "Artificial intelligence and machine learning are transforming how we process and analyze data. " * 5
        
        print("\nTesting local model (be patient, first load is slow)...")
        start = time.time()
        
        try:
            summary = await hf_client._summarize_local(test_text, max_length=50)
            elapsed = time.time() - start
            print(f"✓ Local model working! ({elapsed:.1f}s)")
            print(f"  Summary: {summary[:100]}...")
            return True
        except Exception as e:
            elapsed = time.time() - start
            print(f"✗ Local model failed ({elapsed:.1f}s): {type(e).__name__}: {str(e)[:200]}")
            return False
            
    except Exception as e:
        print(f"✗ Setup error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_full_summarize():
    """Test the full summarize method with fallback"""
    print("\n" + "="*60)
    print("TEST 3: Full Summarize (with automatic fallback)")
    print("="*60)
    
    try:
        from infrastructure.ai.huggingface_client import hf_client
        
        test_text = "Artificial intelligence and machine learning are transforming how we process and analyze data. " * 10
        
        print("Testing hf_client.summarize()...")
        start = time.time()
        
        try:
            summary = await hf_client.summarize(test_text, max_length=50)
            elapsed = time.time() - start
            print(f"✓ Summarization working! ({elapsed:.1f}s)")
            print(f"  Summary: {summary}")
            return True
        except Exception as e:
            elapsed = time.time() - start
            print(f"✗ Summarization failed ({elapsed:.1f}s): {e}")
            return False
            
    except Exception as e:
        print(f"✗ Setup error: {e}")
        return False

def print_recommendations(api_works, local_works, full_works):
    """Print recommendations based on test results"""
    print("\n" + "="*60)
    print("RECOMMENDATIONS")
    print("="*60)
    
    if full_works:
        print("✓ Stage 6 should work!")
        if not api_works and local_works:
            print("⚠ Using local models (slower, but works)")
            print("  Consider fixing HF API token for faster processing")
    elif local_works and not api_works:
        print("⚠ Local model works, but HF API fails")
        print("  Stage 6 will work but be slow (1-2 min)")
        print("  Solutions:")
        print("  1. Get a valid HF API token from https://huggingface.co/settings/tokens")
        print("  2. Set USE_LOCAL_MODELS=true in .env to skip API attempts")
        print("  3. Pre-cache the model by running this test once")
    elif api_works and not local_works:
        print("✓ HF API works!")
        print("  Stage 6 should be fast")
    else:
        print("✗ Both API and local models failed!")
        print("  Stage 6 will NOT work. Solutions:")
        print("  1. Check internet connection")
        print("  2. Install transformers: pip install transformers torch")
        print("  3. Ensure HF API token is valid")
        print("  4. Check available disk space for model cache")

async def main():
    print("Stage 6 Synthesis Diagnostic Tool")
    print("This will test HF API and local models")
    
    # Run tests
    api_works = await test_hf_api()
    local_works = await test_local_model()
    full_works = await test_full_summarize()
    
    # Print recommendations
    print_recommendations(api_works, local_works, full_works)
    
    print("\n" + "="*60)
    print("Diagnostic complete!")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(main())
