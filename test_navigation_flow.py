#!/usr/bin/env python3
"""
Test script to verify navigation to results view after stage 7 completion
"""
import asyncio
import json
import websockets
import requests
from datetime import datetime

BACKEND_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000"

async def test_pipeline_navigation():
    """Test complete pipeline with navigation monitoring"""
    
    print("=" * 80)
    print("🔍 Testing Pipeline Navigation to Results View")
    print("=" * 80)
    print()
    
    # Step 1: Start pipeline
    print("📤 Step 1: Starting pipeline...")
    response = requests.post(
        f"{BACKEND_URL}/api/pipeline/start",
        json={
            "keywords": ["machine learning", "neural networks"],
            "max_papers": 10
        }
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to start pipeline: {response.status_code}")
        return False
    
    data = response.json()
    session_id = data["session_id"]
    print(f"✅ Pipeline started with session: {session_id}")
    print()
    
    # Step 2: Connect to WebSocket and monitor stages
    print("🔌 Step 2: Connecting to WebSocket...")
    ws_url = f"{WS_URL}/ws/{session_id}"
    
    stage_completions = {}
    stage_7_data = None
    
    try:
        async with websockets.connect(ws_url) as websocket:
            print(f"✅ WebSocket connected")
            print()
            print("📊 Monitoring pipeline stages:")
            print("-" * 80)
            
            # Monitor messages
            while True:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=120)
                    update = json.loads(message)
                    
                    msg_type = update.get("type")
                    stage = update.get("stage")
                    
                    if msg_type == "connected":
                        print(f"🔗 Connected to session {update.get('session_id')}")
                        continue
                    
                    if msg_type == "stage_update":
                        progress = update.get("progress", 0)
                        message_text = update.get("message", "")
                        print(f"   Stage {stage}: {progress}% - {message_text}")
                    
                    elif msg_type == "stage_complete":
                        result = update.get("result", {})
                        data_obj = update.get("data", {})
                        
                        stage_completions[stage] = {
                            "result": result,
                            "data": data_obj,
                            "timestamp": datetime.now().isoformat()
                        }
                        
                        print(f"✅ Stage {stage} COMPLETE:")
                        print(f"   Result: {json.dumps(result, indent=6)}")
                        
                        # Check data field
                        if data_obj:
                            data_keys = list(data_obj.keys())
                            print(f"   Data fields: {data_keys}")
                            for key in data_keys:
                                if isinstance(data_obj[key], list):
                                    print(f"     - {key}: {len(data_obj[key])} items")
                                elif isinstance(data_obj[key], dict):
                                    print(f"     - {key}: {len(data_obj[key])} keys")
                        else:
                            print(f"   ⚠️  No data field in completion message!")
                        
                        # Special handling for stage 7
                        if stage == 7:
                            stage_7_data = update
                            print()
                            print("=" * 80)
                            print("🎉 STAGE 7 COMPLETE - PDF GENERATED!")
                            print("=" * 80)
                            print(f"PDF Path: {result.get('pdf_path', 'NOT FOUND')}")
                            print()
                            print("📍 Navigation Check:")
                            
                            # Check if all required data is present
                            required_stages = [1, 3, 4, 5, 6, 7]
                            all_present = all(s in stage_completions for s in required_stages)
                            
                            if all_present:
                                print("   ✅ All stages (1-7) completed")
                            else:
                                missing = [s for s in required_stages if s not in stage_completions]
                                print(f"   ⚠️  Missing stages: {missing}")
                            
                            # Check data availability
                            print()
                            print("   Data Availability:")
                            data_checks = {
                                1: "papers",
                                3: "themes",
                                4: "methodologies",
                                5: "ranked_papers",
                                6: "report",
                                7: "pdf_path in result"
                            }
                            
                            for stage_num, data_name in data_checks.items():
                                if stage_num in stage_completions:
                                    if stage_num == 7:
                                        has_data = "pdf_path" in stage_completions[stage_num]["result"]
                                    else:
                                        has_data = data_name in stage_completions[stage_num]["data"]
                                    
                                    status = "✅" if has_data else "❌"
                                    print(f"   {status} Stage {stage_num}: {data_name}")
                            
                            print()
                            print("=" * 80)
                            print("🎬 Frontend should now navigate to results view!")
                            print("=" * 80)
                            
                            # Wait a bit more to see if any other messages come
                            await asyncio.sleep(2)
                            break
                    
                    elif msg_type == "error":
                        error_msg = update.get("error", "Unknown error")
                        print(f"❌ Error at stage {stage}: {error_msg}")
                        return False
                
                except asyncio.TimeoutError:
                    print("⏱️  Timeout waiting for messages")
                    break
                except websockets.exceptions.ConnectionClosed:
                    print("🔌 WebSocket connection closed")
                    break
    
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        return False
    
    # Step 3: Verify all data is available
    print()
    print("=" * 80)
    print("📊 Final Verification")
    print("=" * 80)
    
    success = True
    
    # Check stage 7 completion
    if 7 not in stage_completions:
        print("❌ Stage 7 did not complete")
        success = False
    elif "pdf_path" not in stage_completions[7]["result"]:
        print("❌ Stage 7 result missing pdf_path")
        success = False
    else:
        print(f"✅ Stage 7 completed with PDF: {stage_completions[7]['result']['pdf_path']}")
    
    # Check all data fields
    print()
    print("Data Fields Check:")
    expected_data = {
        1: "papers",
        3: "themes",
        4: "methodologies",
        5: "ranked_papers",
        6: "report"
    }
    
    for stage_num, field_name in expected_data.items():
        if stage_num in stage_completions:
            if field_name in stage_completions[stage_num]["data"]:
                print(f"   ✅ Stage {stage_num}: {field_name} present")
            else:
                print(f"   ❌ Stage {stage_num}: {field_name} MISSING")
                success = False
        else:
            print(f"   ❌ Stage {stage_num}: Not completed")
            success = False
    
    print()
    if success:
        print("🎉 SUCCESS: All data present, navigation should work!")
    else:
        print("❌ FAILURE: Some data missing, navigation may not work properly")
    
    return success

if __name__ == "__main__":
    result = asyncio.run(test_pipeline_navigation())
    exit(0 if result else 1)
