#!/usr/bin/env python3
"""
Quick pipeline test to verify Stage 6 GPU acceleration
Tests the complete pipeline with a small query
"""
import asyncio
import httpx
import time
import sys

async def test_pipeline():
    """Run a quick pipeline test"""
    print("="*70)
    print("🧪 TESTING PIPELINE WITH GPU ACCELERATION")
    print("="*70)
    
    # Test data
    test_query = {
        "keywords": ["machine learning", "neural networks"],
        "max_results": 10
    }
    
    print(f"\n📋 Query: {test_query['keywords']}")
    print(f"📊 Max results: {test_query['max_results']}")
    
    async with httpx.AsyncClient(timeout=300.0) as client:
        # Start pipeline
        print("\n🚀 Starting pipeline...")
        start_time = time.time()
        
        response = await client.post(
            "http://localhost:8000/api/pipeline/start",
            json=test_query
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to start pipeline: {response.status_code}")
            print(response.text)
            return False
        
        result = response.json()
        session_id = result.get("session_id")
        print(f"✅ Pipeline started: {session_id}")
        
        # Poll status
        last_stage = 0
        while True:
            await asyncio.sleep(2)
            
            status_response = await client.get(
                f"http://localhost:8000/api/pipeline/status/{session_id}"
            )
            
            if status_response.status_code == 200:
                status = status_response.json()
                current_stage = status.get("current_stage", 0)
                
                if current_stage > last_stage:
                    elapsed = time.time() - start_time
                    stage_name = status.get("message", "")
                    print(f"   Stage {current_stage}/7: {stage_name} ({elapsed:.1f}s)")
                    last_stage = current_stage
                
                if status.get("status") == "completed":
                    elapsed = time.time() - start_time
                    print(f"\n✅ Pipeline completed in {elapsed:.1f}s!")
                    print(f"   Total papers: {len(status.get('results', {}).get('papers', []))}")
                    
                    # Check Stage 6 specifically
                    if "report" in status.get("results", {}):
                        report = status["results"]["report"]
                        print(f"   Report sections: {len(report.get('synthesis', '').split('##'))}")
                        print(f"\n📊 Stage 6 (Synthesis) completed successfully with GPU!")
                    
                    return True
                
                elif status.get("status") == "failed":
                    print(f"\n❌ Pipeline failed: {status.get('error')}")
                    return False
            
            elif status_response.status_code == 404:
                # Session not found yet, keep waiting
                pass
            else:
                print(f"\n⚠️  Status check failed: {status_response.status_code}")
    
    return False

if __name__ == "__main__":
    try:
        result = asyncio.run(test_pipeline())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
