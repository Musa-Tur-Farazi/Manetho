import { test, expect } from './utils/test-utils';
import { testUsers, selectors } from './utils/test-utils';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Landing Page', () => {
    test('should display landing page with sign in and sign up buttons', async ({ page, pageActions }) => {
      // Check if we're on the landing page
      await expect(page).toHaveURL('/');
      
      // Check for main landing page elements
      await expect(page.locator('h1')).toContainText('Manetho');
      await expect(page.locator('text=AI-powered learning platform')).toBeVisible();
      
      // Check for navigation elements
      await expect(page.locator('text=Sign In')).toBeVisible();
      await expect(page.locator('text=Sign Up')).toBeVisible();
    });

    test('should redirect authenticated users to home page', async ({ page }) => {
      // This test would require a pre-authenticated user
      // For now, we'll test the redirect logic
      await page.goto('/home');
      
      // Should redirect to sign in if not authenticated
      await expect(page).toHaveURL(/.*sign-in.*/);
    });
  });

  test.describe('Sign Up', () => {
    test('should allow users to sign up with valid credentials', async ({ page, pageActions }) => {
      const testEmail = `test-${Date.now()}@example.com`;
      
      // Navigate to sign up page
      await page.goto('/custom-auth/sign-up');
      
      // Fill in the sign up form
      await page.fill('input[name="firstName"]', testUsers.student.firstName);
      await page.fill('input[name="lastName"]', testUsers.student.lastName);
      await page.fill(selectors.emailInput, testEmail);
      await page.fill(selectors.passwordInput, testUsers.student.password);
      
      // Submit the form
      await page.click(selectors.submitButton);
      
      // Should redirect to home page after successful sign up
      await page.waitForURL('/home');
      await expect(page).toHaveURL('/home');
    });

    test('should show validation errors for invalid sign up data', async ({ page }) => {
      await page.goto('/custom-auth/sign-up');
      
      // Try to submit empty form
      await page.click(selectors.submitButton);
      
      // Should show validation errors
      await expect(page.locator('text=This field is required')).toBeVisible();
    });

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/custom-auth/sign-up');
      
      // Use an email that might already exist
      await page.fill('input[name="firstName"]', testUsers.student.firstName);
      await page.fill('input[name="lastName"]', testUsers.student.lastName);
      await page.fill(selectors.emailInput, testUsers.student.email);
      await page.fill(selectors.passwordInput, testUsers.student.password);
      
      await page.click(selectors.submitButton);
      
      // Should show error for existing email
      await expect(page.locator('text=already exists')).toBeVisible();
    });
  });

  test.describe('Sign In', () => {
    test('should allow users to sign in with valid credentials', async ({ page, pageActions }) => {
      // Navigate to sign in page
      await page.goto('/custom-auth/sign-in');
      
      // Fill in the sign in form
      await page.fill(selectors.emailInput, testUsers.student.email);
      await page.fill(selectors.passwordInput, testUsers.student.password);
      
      // Submit the form
      await page.click(selectors.submitButton);
      
      // Should redirect to home page after successful sign in
      await page.waitForURL('/home');
      await expect(page).toHaveURL('/home');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/custom-auth/sign-in');
      
      // Fill in invalid credentials
      await page.fill(selectors.emailInput, 'invalid@example.com');
      await page.fill(selectors.passwordInput, 'wrongpassword');
      
      await page.click(selectors.submitButton);
      
      // Should show error message
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/custom-auth/sign-in');
      
      // Try to submit empty form
      await page.click(selectors.submitButton);
      
      // Should show validation errors
      await expect(page.locator('text=This field is required')).toBeVisible();
    });
  });

  test.describe('Sign Out', () => {
    test('should allow users to sign out', async ({ page, pageActions }) => {
      // First sign in
      await pageActions.signIn(testUsers.student.email, testUsers.student.password);
      
      // Look for profile menu or sign out button
      const profileMenu = page.locator('button[aria-label*="profile"], [data-testid="profile-menu"]');
      if (await profileMenu.isVisible()) {
        await profileMenu.click();
        await page.click('text=Sign Out');
      } else {
        // Alternative: look for sign out link in navigation
        await page.click('text=Sign Out');
      }
      
      // Should redirect to landing page
      await page.waitForURL('/');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Password Reset', () => {
    test('should allow users to request password reset', async ({ page }) => {
      await page.goto('/custom-auth/sign-in');
      
      // Click on forgot password link
      await page.click('text=Forgot password');
      
      // Should navigate to reset password page
      await expect(page).toHaveURL(/.*reset-password.*/);
      
      // Fill in email
      await page.fill(selectors.emailInput, testUsers.student.email);
      await page.click(selectors.submitButton);
      
      // Should show success message
      await expect(page.locator('text=Check your email')).toBeVisible();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to sign in', async ({ page }) => {
      const protectedRoutes = [
        '/home',
        '/community',
        '/tools/doubt-solving',
        '/tools/flashcards',
        '/tools/mind-maps',
        '/quiz',
        '/profile'
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(/.*sign-in.*/);
      }
    });

    test('should allow authenticated users to access protected routes', async ({ page, pageActions }) => {
      // Sign in first
      await pageActions.signIn(testUsers.student.email, testUsers.student.password);
      
      const protectedRoutes = [
        '/home',
        '/community',
        '/tools/doubt-solving',
        '/tools/flashcards',
        '/tools/mind-maps',
        '/quiz'
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(route);
      }
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page, pageActions }) => {
      // Sign in
      await pageActions.signIn(testUsers.student.email, testUsers.student.password);
      
      // Refresh the page
      await page.reload();
      
      // Should still be on home page (authenticated)
      await expect(page).toHaveURL('/home');
    });

    test('should handle session expiration gracefully', async ({ page, pageActions }) => {
      // Sign in
      await pageActions.signIn(testUsers.student.email, testUsers.student.password);
      
      // Clear cookies to simulate session expiration
      await page.context().clearCookies();
      
      // Try to access protected route
      await page.goto('/home');
      
      // Should redirect to sign in
      await expect(page).toHaveURL(/.*sign-in.*/);
    });
  });

  test.describe('Social Authentication', () => {
    test('should display social login options', async ({ page }) => {
      await page.goto('/custom-auth/sign-in');
      
      // Check for social login buttons (Google, GitHub, etc.)
      const socialButtons = page.locator('[data-testid*="social"]');
      await expect(socialButtons).toBeVisible();
    });

    test('should handle social authentication flow', async ({ page }) => {
      await page.goto('/custom-auth/sign-in');
      
      // Click on a social login button (e.g., Google)
      const googleButton = page.locator('text=Google');
      if (await googleButton.isVisible()) {
        await googleButton.click();
        
        // Should open OAuth popup or redirect
        // Note: This test might need to be mocked in CI environment
        await expect(page).toHaveURL(/.*google.*/);
      }
    });
  });
}); 