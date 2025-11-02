"""
Test HuggingFace API Integration with Log Monitoring
Detects API failures even when fallback succeeds
Based on testing-marko.json specifications
"""
import pytest
import asyncio
from pathlib import Path


@pytest.mark.e2e
@pytest.mark.asyncio
async def test_huggingface_api_primary(log_file_monitor):
    """
    E2E: Test PRIMARY HuggingFace API (not fallback)
    
    Based on testing-marko.json:
    - Must detect API failures even when fallback works
    - Degraded state (using fallback) should be reported as WARNING
    - System should NOT pass silently when using fallback
    """
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent))
    
    from infrastructure.ai.huggingface_client import HuggingFaceClient
    from core.config import settings
    
    client = HuggingFaceClient()
    
    # Track if we're using fallback
    api_used_fallback = False
    api_call_succeeded = False
    
    try:
        # Try to get embeddings
        result = await client.get_embeddings(["test sentence for embeddings"])
        
        if result and len(result) > 0:
            api_call_succeeded = True
        
        # Check logs for fallback indicators
        log_dir = Path(__file__).parent.parent.parent / "logs"
        backend_log = log_dir / "backend.log"
        
        if backend_log.exists():
            with open(backend_log, 'r') as f:
                recent_logs = f.readlines()[-100:]  # Last 100 lines
                recent_text = '\n'.join(recent_logs)
                
                if "falling back to local" in recent_text or "HF API failed" in recent_text:
                    api_used_fallback = True
        
        # Assertions based on testing-marko.json
        if api_used_fallback:
            # Use warnings module instead of pytest.warn
            import warnings
            warnings.warn(
                "⚠️  DEGRADED STATE: HuggingFace API failed, system using local fallback. "
                "This is NOT a success state. Primary API should be working.",
                UserWarning
            )
            print("\n" + "=" * 70)
            print("⚠️  WARNING: SYSTEM IN DEGRADED MODE")
            print("=" * 70)
            print("• HuggingFace API failed (check API key or service status)")
            print("• System is using local model fallback (slower, more memory)")
            print("• This is a degraded state, not full functionality")
            print("• Primary API should be investigated and fixed")
            print("=" * 70)
            
            # Mark this as a degraded state (test passes but with warning)
            # In stricter environments, could assert False here
        
        # Even if fallback works, API failure is a problem
        assert api_call_succeeded, "Neither primary API nor fallback worked"
        
        if not api_used_fallback:
            print("✅ HuggingFace PRIMARY API working correctly")
        else:
            print("⚠️  Test passed but system is DEGRADED (using fallback)")
        
    except Exception as e:
        pytest.fail(f"❌ Both HuggingFace API and fallback failed: {e}")


@pytest.mark.e2e
@pytest.mark.asyncio
async def test_huggingface_api_key_validity():
    """
    E2E: Test if HuggingFace API key is valid
    400 Bad Request usually means invalid/missing API key
    """
    import httpx
    from backend.core.config import settings
    
    if not settings.hf_token:
        pytest.skip("HuggingFace API token not configured")
    
    # Try simple API call to validate key
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
                headers={"Authorization": f"Bearer {settings.hf_token}"},
                json={"inputs": "test"},
                timeout=10.0
            )
            
            if response.status_code == 400:
                pytest.fail(
                    "❌ HuggingFace API returned 400 Bad Request. "
                    "This usually means invalid API key or model access issue. "
                    "Check your HF_TOKEN environment variable."
                )
            elif response.status_code == 401:
                pytest.fail(
                    "❌ HuggingFace API returned 401 Unauthorized. "
                    "API key is invalid or missing."
                )
            elif response.status_code == 403:
                pytest.fail(
                    "❌ HuggingFace API returned 403 Forbidden. "
                    "Model access denied with this API key."
                )
            elif response.status_code == 429:
                pytest.skip("HuggingFace API rate limited (429). This is expected, not a failure.")
            elif response.status_code == 503:
                pytest.skip("HuggingFace model loading (503). This is transient.")
            elif response.status_code == 200:
                print("✅ HuggingFace API key is valid and working")
            else:
                import warnings
                warnings.warn(
                    f"⚠️  Unexpected status code: {response.status_code}",
                    UserWarning
                )
                
        except httpx.TimeoutException:
            pytest.skip("HuggingFace API timeout")
        except Exception as e:
            pytest.fail(f"❌ HuggingFace API test failed: {e}")


@pytest.mark.e2e
def test_api_error_detection_in_logs(log_file_monitor):
    """
    E2E: Verify that API errors are being logged
    This test runs a simple API call and checks if errors are logged
    """
    import subprocess
    import time
    from pathlib import Path
    
    log_dir = Path(__file__).parent.parent.parent / "logs"
    backend_log = log_dir / "backend.log"
    
    # Get current log size
    if backend_log.exists():
        initial_size = backend_log.stat().st_size
    else:
        pytest.skip("Backend log file not found. Start the application first.")
    
    # Make a test request to trigger API call
    import requests
    try:
        requests.get("http://localhost:8000/health", timeout=2)
    except:
        pytest.skip("Backend not running")
    
    time.sleep(1)
    
    # Check for new log entries
    if backend_log.exists():
        with open(backend_log, 'r') as f:
            f.seek(initial_size)
            new_logs = f.read()
            
            # Look for API failure patterns
            if "HF API failed" in new_logs:
                print("\n⚠️  API FAILURE DETECTED IN LOGS:")
                print(new_logs)
                import warnings
                warnings.warn(
                    "HuggingFace API failures detected in logs during test",
                    UserWarning
                )


@pytest.mark.e2e
@pytest.mark.asyncio
async def test_system_health_with_degradation_check(log_file_monitor):
    """
    E2E: Complete system health check including degradation detection
    Tests that system reports degraded state when using fallbacks
    """
    import requests
    from pathlib import Path
    
    # Check backend health
    try:
        response = requests.get("http://localhost:8000/health", timeout=2)
        assert response.status_code == 200
    except:
        pytest.skip("Backend not running")
    
    # Check logs for degradation indicators
    log_dir = Path(__file__).parent.parent.parent / "logs"
    backend_log = log_dir / "backend.log"
    
    degradation_detected = False
    degradation_reasons = []
    
    if backend_log.exists():
        with open(backend_log, 'r') as f:
            recent_logs = f.readlines()[-200:]  # Last 200 lines
            recent_text = '\n'.join(recent_logs)
            
            # Check for various degradation indicators
            if "falling back to local" in recent_text:
                degradation_detected = True
                degradation_reasons.append("Using local AI model fallback")
            
            if "HF API failed" in recent_text:
                degradation_detected = True
                degradation_reasons.append("HuggingFace API failures")
            
            if "Bad Request" in recent_text or "400" in recent_text:
                degradation_detected = True
                degradation_reasons.append("API returning errors")
            
            error_count = recent_text.count("ERROR")
            if error_count > 5:
                degradation_detected = True
                degradation_reasons.append(f"{error_count} errors in recent logs")
    
    # Report status
    if degradation_detected:
        print("\n" + "=" * 70)
        print("⚠️  SYSTEM HEALTH: DEGRADED")
        print("=" * 70)
        print("System is operational but running in degraded mode:")
        for reason in degradation_reasons:
            print(f"  • {reason}")
        print("")
        print("Action required: Investigate and fix degraded components")
        print("=" * 70)
        
        import warnings
        warnings.warn(
            f"System in degraded state: {', '.join(degradation_reasons)}",
            UserWarning
        )
    else:
        print("✅ SYSTEM HEALTH: OPTIMAL - No degradation detected")


@pytest.mark.e2e
def test_fallback_mechanism_works():
    """
    E2E: Test that fallback mechanism actually works
    This is separate from testing if PRIMARY API works
    """
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent))
    
    # Test that local model can be loaded
    try:
        from sentence_transformers import SentenceTransformer
        
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = model.encode(["test sentence"])
        
        assert embeddings is not None
        assert len(embeddings) > 0
        
        print("✅ Fallback mechanism (local model) is functional")
        
    except ImportError:
        pytest.fail("❌ sentence-transformers not installed - fallback won't work")
    except Exception as e:
        pytest.fail(f"❌ Fallback mechanism failed: {e}")
