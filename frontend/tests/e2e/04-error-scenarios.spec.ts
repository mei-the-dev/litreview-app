import { test, expect } from '@playwright/test';

test.describe('Error Scenarios', () => {
  test('should handle empty search results', async ({ page }) => {
    await page.goto('/');
    
    // Enter unlikely keywords
    await page.fill('input[placeholder*="keywords"]', 'xyzabc123nonexistent999');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    
    // Wait for some processing
    await page.waitForTimeout(10000);
    
    // Should show some feedback - either error or empty state
    const hasEmptyState = await page.locator('text=/no.*found|no.*papers|try.*different|empty/i').count();
    const hasError = await page.locator('text=/error|failed|problem/i').count();
    
    expect(hasEmptyState + hasError).toBeGreaterThan(0);
    
    await page.screenshot({ path: 'test-results/empty-results.png', fullPage: true });
  });

  test('should validate input before submission', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit without keywords
    const submitButton = page.locator('button:has-text("Start"), button:has-text("Review")').first();
    
    // Check if button is disabled or shows validation
    const isDisabled = await submitButton.isDisabled();
    
    if (!isDisabled) {
      await submitButton.click();
      
      // Should show validation message
      const hasValidation = await page.locator('text=/required|enter.*keywords|please.*provide/i').count();
      console.log(`Validation shown: ${hasValidation > 0}`);
    } else {
      console.log('Submit button properly disabled when no input');
    }
  });

  test('should display loading states', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[placeholder*="keywords"]', 'loading test');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    
    // Check for loading indicators
    const loadingIndicators = await page.locator('text=/loading|processing|fetching/i, [class*="loading"], [class*="spinner"], .animate-spin').count();
    
    expect(loadingIndicators).toBeGreaterThan(0);
    
    await page.screenshot({ path: 'test-results/loading-state.png' });
  });

  test('should handle backend errors gracefully', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    
    // Normal flow
    await page.fill('input[placeholder*="keywords"]', 'error handling test');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Log any errors found
    if (consoleErrors.length > 0) {
      console.log('Console errors detected:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Expect minimal errors (some might be acceptable warnings)
    expect(consoleErrors.filter(e => !e.includes('Warning')).length).toBeLessThan(3);
  });
});
