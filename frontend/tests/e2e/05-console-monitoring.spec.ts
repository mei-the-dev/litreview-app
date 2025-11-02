import { test, expect } from '@playwright/test';

test.describe('Console Error Detection', () => {
  test('should not have console errors during normal flow', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    // Navigate to homepage
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Interact with the app
    await page.fill('input[placeholder*="keywords"]', 'console test');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    
    // Wait for some processing
    await page.waitForTimeout(10000);
    
    // Report findings
    console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('Console Errors:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }
    
    if (warnings.length > 0) {
      console.log('Console Warnings:');
      warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
    }
    
    // Fail if critical errors found
    const criticalErrors = errors.filter(e => 
      !e.includes('Failed to load resource') && // Network errors sometimes acceptable
      !e.includes('favicon') // Favicon errors are cosmetic
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should catch React errors', async ({ page }) => {
    const reactErrors: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && (
        text.includes('React') ||
        text.includes('component') ||
        text.includes('Warning:')
      )) {
        reactErrors.push(text);
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Interact with app
    await page.fill('input[placeholder*="keywords"]', 'react test');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    await page.waitForTimeout(5000);
    
    if (reactErrors.length > 0) {
      console.log('React-related errors/warnings:');
      reactErrors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Allow React warnings but not errors
    const actualErrors = reactErrors.filter(e => !e.includes('Warning:'));
    expect(actualErrors).toHaveLength(0);
  });

  test('should detect network errors', async ({ page }) => {
    const networkErrors: string[] = [];
    
    page.on('response', response => {
      if (!response.ok() && response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    page.on('requestfailed', request => {
      networkErrors.push(`Failed: ${request.url()}`);
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Start pipeline
    await page.fill('input[placeholder*="keywords"]', 'network test');
    await page.click('button:has-text("Start"), button:has-text("Review")');
    await page.waitForTimeout(10000);
    
    if (networkErrors.length > 0) {
      console.log('Network errors:');
      networkErrors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Some 404s might be acceptable (like favicon), but 500s are not
    const criticalNetworkErrors = networkErrors.filter(e => e.includes('500') || e.includes('Failed:'));
    expect(criticalNetworkErrors).toHaveLength(0);
  });
});
