import { test, expect } from '@playwright/test';

test.describe('Simple Application Tests', () => {
  test('should display landing page correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle('Manetho');
    
    // Check main heading
    await expect(page.locator('h1:has-text("Manetho")')).toBeVisible();
    await expect(page.locator('h1:has-text("Your AI-PoweredLearning Partner")')).toBeVisible();
    
    // Check main buttons
    await expect(page.locator('button:has-text("Log in")')).toBeVisible();
    await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
    
    // Check navigation links
    await expect(page.locator('a:has-text("About Us")')).toBeVisible();
    await expect(page.locator('a:has-text("Privacy Policy")')).toBeVisible();
  });

  test('should navigate to home page', async ({ page }) => {
    await page.goto('http://localhost:3000/home');
    await page.waitForLoadState('networkidle');
    
    // Check home page content
    await expect(page.locator('h1:has-text("Welcome back, there!")')).toBeVisible();
    
    // Check feature buttons
    await expect(page.locator('button:has-text("Start Solving")')).toBeVisible();
    await expect(page.locator('button:has-text("Join Community")')).toBeVisible();
    await expect(page.locator('button:has-text("Study Now")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Mind Map")')).toBeVisible();
    await expect(page.locator('button:has-text("Generate Quiz")')).toBeVisible();
  });

  test('should navigate to doubt solving page', async ({ page }) => {
    await page.goto('http://localhost:3000/tools/doubt-solving');
    await page.waitForLoadState('networkidle');
    
    // Check if page loads (even if it might redirect or show auth)
    await expect(page).toHaveTitle('Manetho');
  });

  test('should navigate to community page', async ({ page }) => {
    await page.goto('http://localhost:3000/community');
    await page.waitForLoadState('networkidle');
    
    // Check if page loads
    await expect(page).toHaveTitle('Manetho');
  });

  test('should navigate to flashcards page', async ({ page }) => {
    await page.goto('http://localhost:3000/tools/flashcards');
    await page.waitForLoadState('networkidle');
    
    // Check if page loads
    await expect(page).toHaveTitle('Manetho');
  });

  test('should navigate to mind maps page', async ({ page }) => {
    await page.goto('http://localhost:3000/tools/mind-maps');
    await page.waitForLoadState('networkidle');
    
    // Check if page loads
    await expect(page).toHaveTitle('Manetho');
  });

  test('should navigate to quiz page', async ({ page }) => {
    await page.goto('http://localhost:3000/quiz');
    await page.waitForLoadState('networkidle');
    
    // Check if page loads
    await expect(page).toHaveTitle('Manetho');
  });

  test('should check sign in page', async ({ page }) => {
    await page.goto('http://localhost:3000/custom-auth/sign-in');
    await page.waitForLoadState('networkidle');
    
    // Check if sign in page loads
    await expect(page).toHaveTitle('Manetho');
    
    // Look for form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Check if form elements exist
    if (await emailInput.isVisible()) {
      console.log('Email input found');
    }
    if (await passwordInput.isVisible()) {
      console.log('Password input found');
    }
    if (await submitButton.isVisible()) {
      console.log('Submit button found');
      console.log('Submit button disabled:', await submitButton.isDisabled());
    }
  });

  test('should check sign up page', async ({ page }) => {
    await page.goto('http://localhost:3000/custom-auth/sign-up');
    await page.waitForLoadState('networkidle');
    
    // Check if sign up page loads
    await expect(page).toHaveTitle('Manetho');
    
    // Look for form elements
    const firstNameInput = page.locator('input[name="firstName"]');
    const lastNameInput = page.locator('input[name="lastName"]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // Check if form elements exist
    if (await firstNameInput.isVisible()) {
      console.log('First name input found');
    }
    if (await lastNameInput.isVisible()) {
      console.log('Last name input found');
    }
    if (await emailInput.isVisible()) {
      console.log('Email input found');
    }
    if (await passwordInput.isVisible()) {
      console.log('Password input found');
    }
    if (await submitButton.isVisible()) {
      console.log('Submit button found');
      console.log('Submit button disabled:', await submitButton.isDisabled());
    }
  });
}); 