import { test, expect } from '@playwright/test';

test.describe('Debug - Check Application Structure', () => {
  test('should check landing page structure', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to see what's actually there
    await page.screenshot({ path: 'debug-landing-page.png' });
    
    // Check what's actually on the page
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    
    // Look for common elements
    const h1Elements = await page.locator('h1').allTextContents();
    console.log('H1 elements:', h1Elements);
    
    const buttons = await page.locator('button').allTextContents();
    console.log('Button texts:', buttons);
    
    const links = await page.locator('a').allTextContents();
    console.log('Link texts:', links);
    
    // Check if there are any forms
    const forms = await page.locator('form').count();
    console.log('Number of forms:', forms);
    
    // Check for specific elements that might exist
    const signInButton = page.locator('text=Sign In, text=Sign in, text=Login, text=Log in').first();
    if (await signInButton.isVisible()) {
      console.log('Found sign in button');
    }
    
    const signUpButton = page.locator('text=Sign Up, text=Sign up, text=Register, text=Create Account').first();
    if (await signUpButton.isVisible()) {
      console.log('Found sign up button');
    }
    
    // Check for navigation elements
    const navElements = await page.locator('nav, [role="navigation"]').count();
    console.log('Navigation elements:', navElements);
    
    // Check for sidebar
    const sidebarElements = await page.locator('[data-testid*="sidebar"], .sidebar, [class*="sidebar"]').count();
    console.log('Sidebar elements:', sidebarElements);
  });

  test('should check home page structure', async ({ page }) => {
    await page.goto('http://localhost:3000/home');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-home-page.png' });
    
    console.log('Home page title:', await page.title());
    console.log('Home page URL:', page.url());
    
    // Check what's on the home page
    const h1Elements = await page.locator('h1').allTextContents();
    console.log('Home page H1 elements:', h1Elements);
    
    const buttons = await page.locator('button').allTextContents();
    console.log('Home page button texts:', buttons);
  });

  test('should check group study page structure', async ({ page }) => {
    await page.goto('http://localhost:3000/group-study');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-group-study-page.png' });
    
    console.log('Group study page title:', await page.title());
    console.log('Group study page URL:', page.url());
    
    // Check what's on the group study page
    const h1Elements = await page.locator('h1').allTextContents();
    console.log('Group study H1 elements:', h1Elements);
    
    const buttons = await page.locator('button').allTextContents();
    console.log('Group study button texts:', buttons);
  });

  test('should check profile page structure', async ({ page }) => {
    await page.goto('http://localhost:3000/profile/test-user');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-profile-page.png' });
    
    console.log('Profile page title:', await page.title());
    console.log('Profile page URL:', page.url());
    
    // Check what's on the profile page
    const h1Elements = await page.locator('h1').allTextContents();
    console.log('Profile H1 elements:', h1Elements);
    
    const buttons = await page.locator('button').allTextContents();
    console.log('Profile button texts:', buttons);
  });
}); 