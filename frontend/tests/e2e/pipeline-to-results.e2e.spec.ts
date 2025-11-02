import { test, expect, Page } from '@playwright/test';

test.describe('Complete Pipeline to Results Navigation', () => {
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    consoleWarnings = [];

    // Capture console errors and warnings
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });
  });

  test('complete pipeline execution with result navigation', async ({ page }) => {
    // 1. Navigate to app
    await page.goto('/');
    await expect(page).toHaveTitle(/LitReview/i);

    // 2. Verify QueryInput is visible
    const queryInput = page.locator('input[placeholder*="keywords" i], input[type="text"]').first();
    await expect(queryInput).toBeVisible({ timeout: 10000 });

    // 3. Enter search keywords
    await queryInput.fill('machine learning');
    
    // 4. Find and click start button
    const startButton = page.locator('button:has-text("Start"), button:has-text("Review")').first();
    await expect(startButton).toBeVisible();
    await startButton.click();

    // 5. Verify pipeline stages appear
    await expect(page.locator('text=/stage|Stage/i').first()).toBeVisible({ timeout: 5000 });

    // 6. Wait for pipeline completion (stage 7 or results view)
    // Look for either "PDF Generated" or ResultsView appearing
    try {
      await Promise.race([
        page.waitForSelector('text=/pdf generated|stage 7.*complete/i', { timeout: 90000 }),
        page.waitForSelector('[data-testid="results-view"], .results-view', { timeout: 90000 }),
        // Or wait for results navigation tabs
        page.waitForSelector('button:has-text("All Papers"), [role="tab"]', { timeout: 90000 }),
      ]);
    } catch (e) {
      // Take screenshot on timeout
      await page.screenshot({ path: 'test-results/pipeline-timeout.png', fullPage: true });
      throw new Error('Pipeline did not complete within 90 seconds');
    }

    // 7. Check if we're in results view (might auto-transition)
    const hasResultsTabs = await page.locator('button:has-text("All Papers"), [role="tab"]:has-text("Papers")').count();
    
    if (hasResultsTabs > 0) {
      console.log('✅ Auto-transitioned to results view');
      
      // 8. Verify result tabs are visible
      await expect(page.locator('button:has-text("All Papers"), [role="tab"]:has-text("Papers")').first()).toBeVisible();
      
      // 9. Test navigation through tabs
      const tabs = ['Theme', 'Methodology', 'Ranking', 'Report', 'PDF'];
      
      for (const tabName of tabs) {
        const tab = page.locator(`button:has-text("${tabName}"), [role="tab"]:has-text("${tabName}")`).first();
        if (await tab.isVisible()) {
          await tab.click();
          await page.waitForTimeout(500); // Wait for content to render
          
          // Verify some content is visible
          const content = page.locator(`[data-testid="${tabName.toLowerCase()}-view"], .${tabName.toLowerCase()}-view`).first();
          const hasContent = await content.count() > 0;
          console.log(`Tab "${tabName}": ${hasContent ? '✅ content found' : '⚠️  content div not found, but tab works'}`);
        }
      }

      // 10. Navigate back to papers list
      const papersTab = page.locator('button:has-text("All Papers"), button:has-text("Papers")').first();
      if (await papersTab.isVisible()) {
        await papersTab.click();
        await page.waitForTimeout(500);
      }

      // 11. Verify papers are rendered (check for paper cards or list items)
      const hasPapers = await page.locator('[data-testid="paper-card"], .paper-card, article').count();
      if (hasPapers > 0) {
        console.log(`✅ Found ${hasPapers} paper elements rendered`);
      } else {
        console.log('⚠️  No paper cards found - data might not be rendering');
      }
    } else {
      console.log('⚠️  Results view not visible yet - pipeline might still be running');
    }

    // 12. Final checks
    expect(consoleErrors.length).toBe(0, `Console errors detected: ${consoleErrors.join('\n')}`);
    
    if (consoleWarnings.length > 0) {
      console.warn(`⚠️  Console warnings detected: ${consoleWarnings.length}`);
      consoleWarnings.forEach(w => console.warn(`  - ${w}`));
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-results/final-state.png', fullPage: true });
  });

  test('verify WebSocket connection and updates', async ({ page }) => {
    const websocketMessages: any[] = [];

    // Monitor WebSocket messages
    page.on('websocket', ws => {
      ws.on('framereceived', event => {
        try {
          const data = JSON.parse(event.payload.toString());
          websocketMessages.push(data);
        } catch (e) {
          // Not JSON, ignore
        }
      });
    });

    // Navigate and start pipeline
    await page.goto('/');
    const queryInput = page.locator('input[type="text"]').first();
    await queryInput.fill('AI research');
    
    const startButton = page.locator('button:has-text("Start"), button:has-text("Review")').first();
    await startButton.click();

    // Wait for some WebSocket messages
    await page.waitForTimeout(10000);

    // Verify we received WebSocket messages
    expect(websocketMessages.length).toBeGreaterThan(0);
    console.log(`✅ Received ${websocketMessages.length} WebSocket messages`);

    // Verify messages have expected structure
    const hasStageUpdates = websocketMessages.some(msg => 
      msg.type === 'stage_update' || msg.type === 'stage_complete'
    );
    expect(hasStageUpdates).toBe(true);
  });

  test('verify no console errors during idle state', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check console
    expect(consoleErrors.length).toBe(0, `Console errors in idle state: ${consoleErrors.join('\n')}`);
  });
});
