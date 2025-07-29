import { test, expect } from '@playwright/test';
import { testUsers, selectors, testData, PageActions } from './utils/test-utils';

test.describe('Navigation Tests', () => {
  let pageActions: PageActions;

  test.beforeEach(async ({ page }) => {
    pageActions = new PageActions(page);
  });

  test.describe('Landing Page', () => {
    test('should display landing page correctly', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Check page title
      await expect(page).toHaveTitle('Manetho');
      
      // Check main headings
      await expect(page.locator('h1:has-text("Manetho")')).toBeVisible();
      await expect(page.locator('h1:has-text("Your AI-PoweredLearning Partner")')).toBeVisible();
      
      // Check main buttons
      await expect(page.locator('button:has-text("Log in")')).toBeVisible();
      await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
      
      // Check navigation links
      await expect(page.locator('a:has-text("About Us")')).toBeVisible();
      await expect(page.locator('a:has-text("Privacy Policy")')).toBeVisible();
      await expect(page.locator('a:has-text("Terms of Service")')).toBeVisible();
    });

    test('should navigate to sign in page', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Click on Log in button
      await page.click('button:has-text("Log in")');
      
      // Should navigate to sign in page
      await expect(page).toHaveURL(/.*sign-in.*/);
      await expect(page).toHaveTitle('Manetho');
    });

    test('should navigate to sign up page', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Click on Get Started button
      await page.click('button:has-text("Get Started")');
      
      // Should navigate to sign up page or show sign up form
      await expect(page).toHaveTitle('Manetho');
    });
  });

  test.describe('Home Page', () => {
    test('should display home page correctly', async ({ page }) => {
      await page.goto('http://localhost:3000/home');
      await page.waitForLoadState('networkidle');
      
      // Check page title
      await expect(page).toHaveTitle('Manetho');
      
      // Check main heading
      await expect(page.locator('h1:has-text("Welcome back, there!")')).toBeVisible();
      
      // Check feature buttons
      await expect(page.locator('button:has-text("Start Solving")')).toBeVisible();
      await expect(page.locator('button:has-text("Join Community")')).toBeVisible();
      await expect(page.locator('button:has-text("Study Now")')).toBeVisible();
      await expect(page.locator('button:has-text("Create Mind Map")')).toBeVisible();
      await expect(page.locator('button:has-text("Generate Quiz")')).toBeVisible();
    });

    test('should navigate to doubt solving from home', async ({ page }) => {
      await page.goto('http://localhost:3000/home');
      await page.waitForLoadState('networkidle');
      
      // Click on Start Solving button
      await page.click('button:has-text("Start Solving")');
      
      // Should navigate to doubt solving page
      await expect(page).toHaveURL(/.*doubt-solving.*/);
      await expect(page).toHaveTitle('Manetho');
    });

    test('should navigate to community from home', async ({ page }) => {
      await page.goto('http://localhost:3000/home');
      await page.waitForLoadState('networkidle');
      
      // Click on Join Community button
      await page.click('button:has-text("Join Community")');
      
      // Should navigate to community page
      await expect(page).toHaveURL(/.*community.*/);
      await expect(page).toHaveTitle('Manetho');
    });

    test('should navigate to flashcards from home', async ({ page }) => {
      await page.goto('http://localhost:3000/home');
      await page.waitForLoadState('networkidle');
      
      // Click on Study Now button
      await page.click('button:has-text("Study Now")');
      
      // Should navigate to flashcards page
      await expect(page).toHaveURL(/.*flashcards.*/);
      await expect(page).toHaveTitle('Manetho');
    });

    test('should navigate to mind maps from home', async ({ page }) => {
      await page.goto('http://localhost:3000/home');
      await page.waitForLoadState('networkidle');
      
      // Click on Create Mind Map button
      await page.click('button:has-text("Create Mind Map")');
      
      // Should navigate to mind maps page
      await expect(page).toHaveURL(/.*mind-maps.*/);
      await expect(page).toHaveTitle('Manetho');
    });

    test('should navigate to quiz from home', async ({ page }) => {
      await page.goto('http://localhost:3000/home');
      await page.waitForLoadState('networkidle');
      
      // Click on Generate Quiz button
      await page.click('button:has-text("Generate Quiz")');
      
      // Should navigate to quiz page
      await expect(page).toHaveURL(/.*quiz.*/);
      await expect(page).toHaveTitle('Manetho');
    });
  });

  test.describe('Feature Pages', () => {
    test('should access doubt solving page', async ({ page }) => {
      await page.goto('http://localhost:3000/tools/doubt-solving');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveTitle('Manetho');
      await expect(page).toHaveURL(/.*doubt-solving.*/);
    });

    test('should access community page', async ({ page }) => {
      await page.goto('http://localhost:3000/community');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveTitle('Manetho');
      await expect(page).toHaveURL(/.*community.*/);
    });

    test('should access flashcards page', async ({ page }) => {
      await page.goto('http://localhost:3000/tools/flashcards');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveTitle('Manetho');
      await expect(page).toHaveURL(/.*flashcards.*/);
    });

    test('should access mind maps page', async ({ page }) => {
      await page.goto('http://localhost:3000/tools/mind-maps');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveTitle('Manetho');
      await expect(page).toHaveURL(/.*mind-maps.*/);
    });

    test('should access quiz page', async ({ page }) => {
      await page.goto('http://localhost:3000/quiz');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveTitle('Manetho');
      await expect(page).toHaveURL(/.*quiz.*/);
    });

    test('should access group study page', async ({ page }) => {
      await page.goto('http://localhost:3000/group-study');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveTitle('Manetho');
      await expect(page).toHaveURL(/.*group-study.*/);
    });
  });

  test.describe('Authentication Pages', () => {
    test('should access sign in page', async ({ page }) => {
      await page.goto('http://localhost:3000/custom-auth/sign-in');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveTitle('Manetho');
      await expect(page).toHaveURL(/.*sign-in.*/);
      
      // Check for form elements
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');
      
      // These elements should exist (even if they might be hidden or disabled)
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();
    });

    test('should access sign up page', async ({ page }) => {
      await page.goto('http://localhost:3000/custom-auth/sign-up');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveTitle('Manetho');
      await expect(page).toHaveURL(/.*sign-up.*/);
      
      // Check for form elements
      const firstNameInput = page.locator('input[name="firstName"]');
      const lastNameInput = page.locator('input[name="lastName"]');
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');
      
      // These elements should exist
      await expect(firstNameInput).toBeVisible();
      await expect(lastNameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();
    });
  });

  test.describe('URL Navigation', () => {
    test('should handle direct URL navigation', async ({ page }) => {
      const pages = [
        '/',
        '/home',
        '/tools/doubt-solving',
        '/community',
        '/tools/flashcards',
        '/tools/mind-maps',
        '/quiz',
        '/group-study',
        '/custom-auth/sign-in',
        '/custom-auth/sign-up'
      ];

      for (const path of pages) {
        await page.goto(`http://localhost:3000${path}`);
        await page.waitForLoadState('networkidle');
        
        // All pages should have the Manetho title
        await expect(page).toHaveTitle('Manetho');
        
        // Check that the page loaded without major errors
        const errorElements = page.locator('text=Error, text=404, text=Not Found');
        await expect(errorElements).toHaveCount(0);
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Check that page loads on mobile
      await expect(page).toHaveTitle('Manetho');
      await expect(page.locator('h1:has-text("Manetho")')).toBeVisible();
      
      // Check that buttons are still accessible
      await expect(page.locator('button:has-text("Log in")')).toBeVisible();
      await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Check that page loads on tablet
      await expect(page).toHaveTitle('Manetho');
      await expect(page.locator('h1:has-text("Manetho")')).toBeVisible();
    });
  });
}); 