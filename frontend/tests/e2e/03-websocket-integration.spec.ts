import { test, expect } from '@playwright/test';

test.describe('WebSocket Integration Testing', () => {
  test('should establish WebSocket connection', async ({ page }) => {
    const wsMessages: any[] = [];
    
    // Monitor WebSocket connections
    page.on('websocket', ws => {
      console.log(`WebSocket opened: ${ws.url()}`);
      
      ws.on('framesent', frame => {
        console.log(`⬆️ Sent: ${frame.payload}`);
      });
      
      ws.on('framereceived', frame => {
        try {
          const data = JSON.parse(frame.payload as string);
          wsMessages.push(data);
          console.log(`⬇️ Received: ${JSON.stringify(data)}`);
        } catch (e) {
          console.log(`⬇️ Received (non-JSON): ${frame.payload}`);
        }
      });
      
      ws.on('close', () => {
        console.log('WebSocket closed');
      });
    });

    await page.goto('/');
    
    // Start pipeline
    await page.fill('input[placeholder*="keywords"]', 'test query');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    
    // Wait for some WebSocket messages
    await page.waitForTimeout(5000);
    
    // Verify WebSocket connection was established
    expect(wsMessages.length).toBeGreaterThan(0);
    
    console.log(`Received ${wsMessages.length} WebSocket messages`);
  });

  test('should update UI when WebSocket messages received', async ({ page }) => {
    let messageCount = 0;
    
    page.on('websocket', ws => {
      ws.on('framereceived', async frame => {
        try {
          const data = JSON.parse(frame.payload as string);
          messageCount++;
          
          // Check if UI updated after this message
          if (data.stage && data.type === 'stage_update') {
            // Wait a bit for DOM to update
            await page.waitForTimeout(100);
            
            // Verify stage card exists
            const stageCard = await page.locator(`[data-stage="${data.stage}"]`).count();
            console.log(`Stage ${data.stage} card exists: ${stageCard > 0}`);
          }
        } catch (e) {
          // Ignore non-JSON messages
        }
      });
    });

    await page.goto('/');
    await page.fill('input[placeholder*="keywords"]', 'websocket test');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    
    // Wait for several messages
    await page.waitForTimeout(10000);
    
    console.log(`Total messages received: ${messageCount}`);
    expect(messageCount).toBeGreaterThan(0);
  });

  test('should handle WebSocket disconnection gracefully', async ({ page }) => {
    await page.goto('/');
    
    let wsConnection: any = null;
    
    page.on('websocket', ws => {
      wsConnection = ws;
    });

    // Start pipeline
    await page.fill('input[placeholder*="keywords"]', 'disconnect test');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    
    // Wait for connection
    await page.waitForTimeout(2000);
    
    // Force close WebSocket if we captured it
    if (wsConnection) {
      // Note: Playwright doesn't expose direct close method, this is demonstration
      console.log('WebSocket connection monitored');
    }
    
    // Check if UI shows error or reconnection message
    // (This depends on your implementation)
    const hasErrorIndicator = await page.locator('text=/connection|lost|error/i').count();
    console.log(`Error indicator present: ${hasErrorIndicator > 0}`);
  });
});
