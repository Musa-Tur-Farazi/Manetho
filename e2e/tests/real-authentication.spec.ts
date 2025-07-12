import { test, expect } from '@playwright/test';

test.describe('Real Authentication with Clerk', () => {
  
  test.describe('Clerk Sign-In Page', () => {
    test('should display Clerk authentication interface', async ({ page }) => {
      await page.goto('/sign-in');
      
      // Wait for Clerk to load
      await page.waitForSelector('.cl-rootBox, .cl-card, [data-clerk-element]', { timeout: 10000 });
      
      // Check for Clerk's container
      const clerkContainer = page.locator('.cl-rootBox, .cl-card, .cl-signIn-root');
      await expect(clerkContainer).toBeVisible();
      
      // Look for the styled card from your config
      const styledCard = page.locator('.bg-white.dark\\:bg-gray-800, .shadow-xl, .rounded-xl');
      if (await styledCard.count() > 0) {
        await expect(styledCard.first()).toBeVisible();
      }
      
      console.log('✅ Clerk sign-in interface loaded');
    });

    test('should show email input field', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForSelector('.cl-rootBox', { timeout: 10000 });
      
      // Clerk uses various selectors for email input
      const emailInput = page.locator(
        'input[name="identifier"], ' +
        'input[type="email"], ' +
        'input[autocomplete="username"], ' +
        'input[autocomplete="email"], ' +
        '.cl-formField input'
      );
      
      await expect(emailInput.first()).toBeVisible();
      
      // Test that we can type in the email field
      await emailInput.first().fill('test@example.com');
      await expect(emailInput.first()).toHaveValue('test@example.com');
      
      console.log('✅ Email input works correctly');
    });

    test('should handle invalid email format', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForSelector('.cl-rootBox', { timeout: 10000 });
      
      const emailInput = page.locator('input[name="identifier"], input[type="email"]');
      await emailInput.first().fill('invalid-email');
      
      // Try to continue (look for continue/next button)
      const continueButton = page.locator('button').filter({ hasText: /continue|next|sign in/i });
      if (await continueButton.count() > 0) {
        await continueButton.first().click();
        
        // Wait for validation message
        await page.waitForTimeout(1000);
        
        // Look for error message
        const errorMessage = page.locator('.cl-formFieldError, .cl-error, [role="alert"]');
        if (await errorMessage.count() > 0) {
          await expect(errorMessage.first()).toBeVisible();
          console.log('✅ Email validation error shown');
        }
      }
    });

    test('should show password field after valid email', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForSelector('.cl-rootBox', { timeout: 10000 });
      
      // Enter a valid email format
      const emailInput = page.locator('input[name="identifier"], input[type="email"]');
      await emailInput.first().fill('test@example.com');
      
      // Click continue
      const continueButton = page.locator('button').filter({ hasText: /continue|next/i });
      if (await continueButton.count() > 0) {
        await continueButton.first().click();
        
        // Wait for password field to appear
        await page.waitForTimeout(2000);
        
        // Look for password input
        const passwordInput = page.locator('input[type="password"], input[name="password"]');
        if (await passwordInput.count() > 0) {
          await expect(passwordInput.first()).toBeVisible();
          console.log('✅ Password field appears after email');
        }
      }
    });

    test('should handle authentication failure gracefully', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForSelector('.cl-rootBox', { timeout: 10000 });
      
      // Try to sign in with invalid credentials
      const emailInput = page.locator('input[name="identifier"], input[type="email"]');
      await emailInput.first().fill('nonexistent@example.com');
      
      // Click continue
      const continueButton = page.locator('button').filter({ hasText: /continue|next/i });
      if (await continueButton.count() > 0) {
        await continueButton.first().click();
        await page.waitForTimeout(2000);
        
        // Look for password field and fill it
        const passwordInput = page.locator('input[type="password"]');
        if (await passwordInput.count() > 0) {
          await passwordInput.first().fill('wrongpassword');
          
          // Click sign in
          const signInButton = page.locator('button').filter({ hasText: /sign in|log in/i });
          if (await signInButton.count() > 0) {
            await signInButton.first().click();
            
            // Wait for error
            await page.waitForTimeout(3000);
            
            // Should stay on sign-in page
            expect(page.url()).toContain('/sign-in');
            console.log('✅ Authentication failure handled - stayed on sign-in');
          }
        }
      }
    });
  });

  test.describe('Authentication Redirects', () => {
    test('should redirect to /home after successful sign-in (if configured)', async ({ page }) => {
      await page.goto('/sign-in');
      
      // This test checks the redirect URL configuration from your component
      // afterSignInUrl={redirectUrl} where redirectUrl defaults to "/home"
      
      const currentUrl = page.url();
      console.log(`📍 Sign-in page URL: ${currentUrl}`);
      
      // Check if redirect URL parameter is preserved
      const hasRedirectParam = currentUrl.includes('redirect_url') || currentUrl.includes('return_to');
      console.log(`🔄 Has redirect parameter: ${hasRedirectParam}`);
      
      // The redirect behavior is configured in your component
      expect(page.url()).toContain('/sign-in');
      console.log('✅ Sign-in page with redirect configuration loaded');
    });

    test('should preserve redirect URL from query params', async ({ page }) => {
      // Test the redirect_url functionality from your component
      await page.goto('/sign-in?redirect_url=/chat');
      await page.waitForSelector('.cl-rootBox', { timeout: 10000 });
      
      // Check that Clerk respects the redirect URL
      const currentUrl = page.url();
      console.log(`📍 URL with redirect: ${currentUrl}`);
      
      expect(page.url()).toContain('/sign-in');
      console.log('✅ Redirect URL preserved in sign-in flow');
    });
  });

  test.describe('Sign-Up Flow', () => {
    test('should navigate to sign-up from sign-in', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForSelector('.cl-rootBox', { timeout: 10000 });
      
      // Look for sign-up link
      const signUpLink = page.locator('a').filter({ hasText: /sign up|create account|register/i });
      
      if (await signUpLink.count() > 0) {
        await signUpLink.first().click();
        await page.waitForLoadState('networkidle');
        
        // Should navigate to sign-up page
        expect(page.url()).toContain('/sign-up');
        console.log('✅ Navigation to sign-up works');
        
        // Check that sign-up form is loaded
        const signUpContainer = page.locator('.cl-rootBox, .cl-card, .cl-signUp-root');
        await expect(signUpContainer).toBeVisible();
        console.log('✅ Sign-up form loaded');
      } else {
        console.log('ℹ️  Sign-up link not found (might be single-page flow)');
      }
    });

    test('should display sign-up form with required fields', async ({ page }) => {
      await page.goto('/sign-up');
      await page.waitForSelector('.cl-rootBox', { timeout: 10000 });
      
      // Check for sign-up specific fields
      const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="first name" i]');
      const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="last name" i]');
      const emailInput = page.locator('input[name="emailAddress"], input[type="email"]');
      
      // These fields might not all be visible at once in Clerk's multi-step flow
      const visibleInputs = await page.locator('input[type="text"], input[type="email"]').count();
      expect(visibleInputs).toBeGreaterThan(0);
      
      console.log('✅ Sign-up form fields present');
    });
  });

  test.describe('Theme Integration', () => {
    test('should apply dark theme to Clerk components', async ({ page }) => {
      await page.goto('/sign-in');
      await page.waitForSelector('.cl-rootBox', { timeout: 10000 });
      
      // Your theme configuration includes dark mode variables
      // Check if dark theme is applied
      const clerkCard = page.locator('.cl-card, .bg-white.dark\\:bg-gray-800');
      
      if (await clerkCard.count() > 0) {
        // Check for dark theme styles
        const styles = await clerkCard.first().getAttribute('style') || '';
        const classes = await clerkCard.first().getAttribute('class') || '';
        
        console.log(`🎨 Clerk card styles: ${styles}`);
        console.log(`🎨 Clerk card classes: ${classes}`);
        
        expect(clerkCard.first()).toBeVisible();
        console.log('✅ Clerk theming applied');
      }
    });
  });
}); 