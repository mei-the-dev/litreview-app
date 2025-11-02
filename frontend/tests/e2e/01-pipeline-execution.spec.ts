import { test, expect } from '@playwright/test';

test.describe('Pipeline Execution with Real-Time Updates', () => {
  test('should complete full pipeline with live updates', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to homepage
    await page.goto('/');
    
    // Verify QueryInput component renders
    await expect(page.locator('[data-testid="query-input"]')).toBeVisible({ timeout: 10000 });
    
    // Enter test keywords
    await page.fill('input[placeholder*="keywords"]', 'machine learning');
    
    // Set max papers (if input exists)
    const maxPapersInput = page.locator('input[type="number"]');
    if (await maxPapersInput.count() > 0) {
      await maxPapersInput.fill('10');
    }
    
    // Click start button
    await page.click('button:has-text("Start"), button:has-text("Review")');
    
    // Wait for BentoGrid to appear
    await expect(page.locator('.bento-card, [class*="bento"]')).toHaveCount(7, { timeout: 5000 }).catch(() => {
      // Bento cards might have different selector
      return expect(page.locator('[data-stage]')).toBeVisible({ timeout: 5000 });
    });
    
    // Track stage completions
    const startTime = Date.now();
    
    // Wait for all stages to complete (max 120 seconds)
    for (let stage = 1; stage <= 7; stage++) {
      await page.waitForSelector(
        `[data-stage="${stage}"][data-status="completed"], [data-stage="${stage}"] .completed, .stage-${stage}.completed`,
        { timeout: 120000 }
      ).catch(async () => {
        // Alternative: check for success indicator
        await page.waitForSelector(
          `text=/Stage ${stage}.*complete/i, [aria-label*="Stage ${stage} complete"]`,
          { timeout: 120000 }
        );
      });
      
      console.log(`Stage ${stage} completed at ${Date.now() - startTime}ms`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`Total pipeline duration: ${duration}ms`);
    
    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
    
    // Verify reasonable completion time
    expect(duration).toBeLessThan(120000); // 2 minutes max
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/pipeline-complete.png', fullPage: true });
  });

  test('should display progress updates in real-time', async ({ page }) => {
    await page.goto('/');
    
    // Start pipeline
    await page.fill('input[placeholder*="keywords"]', 'quantum computing');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    
    // Monitor first stage progress
    const stage1 = page.locator('[data-stage="1"], .stage-1').first();
    await expect(stage1).toBeVisible({ timeout: 10000 });
    
    // Check for progress bar or status text
    const hasProgressBar = await page.locator('[data-stage="1"] progress, [data-stage="1"] [role="progressbar"]').count();
    const hasStatusText = await page.locator('[data-stage="1"] text=/processing|loading|fetching/i').count();
    
    expect(hasProgressBar + hasStatusText).toBeGreaterThan(0);
  });
});
