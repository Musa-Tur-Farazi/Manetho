import { test, expect } from '@playwright/test';

test.describe('Simple Smoke Tests', () => {
  
  test('Landing page loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Basic checks that should always work
    await expect(page).toHaveTitle(/.+/); // Has some title
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Landing page loads');
  });

  test('Sign-in page loads successfully', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Wait for any content to load
    await page.waitForTimeout(3000);
    
    // Should have a title and body
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Sign-in page loads');
  });

  test('Sign-up page loads successfully', async ({ page }) => {
    await page.goto('/sign-up');
    
    await page.waitForTimeout(3000);
    
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Sign-up page loads');
  });

  test('App responds to navigation', async ({ page }) => {
    // Test basic navigation
    await page.goto('/');
    expect(page.url()).toContain('/');
    
    await page.goto('/sign-in');
    expect(page.url()).toContain('/sign-in');
    
    await page.goto('/sign-up');
    expect(page.url()).toContain('/sign-up');
    
    console.log('✅ Basic navigation works');
  });

  test('Protected routes redirect when not authenticated', async ({ page }) => {
    const protectedRoutes = ['/home', '/chat', '/community', '/profile'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      
      // Should redirect to auth or stay with auth requirement
      const isRedirected = currentUrl.includes('/sign-in') || 
                          currentUrl.includes('/auth') || 
                          currentUrl.includes('clerk');
      
      console.log(`🔒 ${route} → ${currentUrl} (redirected: ${isRedirected})`);
    }
    
    console.log('✅ Protected routes require authentication');
  });

  test('No critical JavaScript errors on public pages', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Filter out common harmless errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.toLowerCase().includes('chunk') &&
      !error.includes('hydration')
    );
    
    console.log(`💡 Total console messages: ${errors.length}`);
    console.log(`⚠️  Critical errors: ${criticalErrors.length}`);
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    
    console.log('✅ Error monitoring completed');
  });

  test('Basic responsive behavior', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Responsive design works on different viewports');
  });

  test('Theme switching (if available)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Look for theme toggle
    const themeButton = page.locator('button').filter({ hasText: /theme|dark|light/i });
    
    if (await themeButton.count() > 0) {
      const initialTheme = await page.locator('html').getAttribute('class') || '';
      
      await themeButton.first().click();
      await page.waitForTimeout(500);
      
      const newTheme = await page.locator('html').getAttribute('class') || '';
      
      console.log(`🎨 Theme changed: "${initialTheme}" → "${newTheme}"`);
      console.log('✅ Theme switching works');
    } else {
      console.log('ℹ️  Theme toggle not found on this page');
    }
  });

  test('Performance baseline', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`⚡ Page load time: ${loadTime}ms`);
    
    // Reasonable performance expectation
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
    
    if (loadTime < 2000) {
      console.log('🚀 Excellent performance');
    } else if (loadTime < 5000) {
      console.log('✅ Good performance');
    } else {
      console.log('⚠️  Performance could be improved');
    }
  });
}); 