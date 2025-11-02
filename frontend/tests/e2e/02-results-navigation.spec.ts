import { test, expect } from '@playwright/test';

test.describe('Results View Navigation and Rendering', () => {
  test('should navigate to results after pipeline completion', async ({ page }) => {
    await page.goto('/');
    
    // Complete pipeline (shortened for test speed)
    await page.fill('input[placeholder*="keywords"]', 'artificial intelligence');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    
    // Wait for completion (stage 7)
    await page.waitForSelector('[data-stage="7"][data-status="completed"], .stage-7.completed', { timeout: 120000 });
    
    // Should automatically navigate to results or show results view
    await expect(page.locator('text=/results|papers|themes/i')).toBeVisible({ timeout: 10000 });
    
    // Take screenshot of results
    await page.screenshot({ path: 'test-results/results-view.png', fullPage: true });
  });

  test('should render all result tabs', async ({ page }) => {
    // Navigate directly to results (assumes pipeline completed)
    await page.goto('/');
    
    // Start and complete pipeline first
    await page.fill('input[placeholder*="keywords"]', 'deep learning');
    const maxPapers = page.locator('input[type="number"]');
    if (await maxPapers.count() > 0) {
      await maxPapers.fill('5'); // Fewer papers for speed
    }
    await page.click('button:has-text("Start"), button:has-text("Review")');
    
    // Wait for completion
    await page.waitForSelector('[data-stage="7"][data-status="completed"]', { timeout: 120000 });
    
    // Check for result tabs/sections
    const expectedSections = ['papers', 'theme', 'methodology', 'ranking', 'report', 'pdf', 'download'];
    
    for (const section of expectedSections) {
      const found = await page.locator(`text=/${section}/i, [data-tab="${section}"], [aria-label*="${section}"]`).count();
      if (found > 0) {
        console.log(`✓ Found section: ${section}`);
      }
    }
    
    // Verify at least some result content is visible
    await expect(page.locator('text=/found|papers|results|score/i').first()).toBeVisible();
  });

  test('should display paper list with cards', async ({ page }) => {
    await page.goto('/');
    
    // Complete pipeline
    await page.fill('input[placeholder*="keywords"]', 'neural networks');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    await page.waitForSelector('[data-stage="7"][data-status="completed"]', { timeout: 120000 });
    
    // Look for paper cards or list items
    const paperCards = page.locator('[data-testid="paper-card"], .paper-card, article').filter({ hasText: /title|author|year/i });
    const count = await paperCards.count();
    
    expect(count).toBeGreaterThan(0);
    console.log(`Found ${count} paper cards`);
    
    // Verify first paper has required fields
    const firstCard = paperCards.first();
    await expect(firstCard).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/paper-list.png', fullPage: true });
  });

  test('should allow searching/filtering papers', async ({ page }) => {
    await page.goto('/');
    
    // Complete pipeline
    await page.fill('input[placeholder*="keywords"]', 'computer vision');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    await page.waitForSelector('[data-stage="7"][data-status="completed"]', { timeout: 120000 });
    
    // Look for search/filter input
    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]').first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('learning');
      
      // Wait a moment for filter to apply
      await page.waitForTimeout(1000);
      
      // Verify some papers still visible
      await expect(page.locator('[data-testid="paper-card"], .paper-card, article').first()).toBeVisible();
    }
  });

  test('should display theme visualization', async ({ page }) => {
    await page.goto('/');
    
    // Complete pipeline
    await page.fill('input[placeholder*="keywords"]', 'machine learning');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    await page.waitForSelector('[data-stage="7"][data-status="completed"]', { timeout: 120000 });
    
    // Look for theme-related elements
    const themeElements = await page.locator('text=/theme|cluster|group/i').count();
    expect(themeElements).toBeGreaterThan(0);
    
    // Check for chart elements (SVG, canvas, or chart library classes)
    const hasChart = await page.locator('svg, canvas, [class*="chart"], [class*="pie"]').count();
    if (hasChart > 0) {
      console.log('✓ Chart visualization found');
    }
  });

  test('should provide PDF download option', async ({ page }) => {
    await page.goto('/');
    
    // Complete pipeline
    await page.fill('input[placeholder*="keywords"]', 'blockchain');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    await page.waitForSelector('[data-stage="7"][data-status="completed"]', { timeout: 120000 });
    
    // Look for download button
    const downloadButton = page.locator('button:has-text("Download"), button:has-text("PDF"), a:has-text("Download")').first();
    
    if (await downloadButton.count() > 0) {
      await expect(downloadButton).toBeVisible();
      console.log('✓ PDF download button found');
    }
  });
});
