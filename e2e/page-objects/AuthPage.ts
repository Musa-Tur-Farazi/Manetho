import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Clerk-specific selectors
  get clerkContainer() {
    return this.page.locator('.cl-rootBox, .cl-card, .cl-signIn-root, .cl-signUp-root');
  }

  get emailInput() {
    return this.page.locator(
      'input[name="identifier"], ' +
      'input[name="emailAddress"], ' +
      'input[type="email"], ' +
      'input[autocomplete="username"], ' +
      'input[autocomplete="email"], ' +
      '.cl-formField input'
    ).first();
  }

  get passwordInput() {
    return this.page.locator(
      'input[type="password"], ' +
      'input[name="password"], ' +
      '.cl-formField input[type="password"]'
    ).first();
  }

  get firstNameInput() {
    return this.page.locator(
      'input[name="firstName"], ' +
      'input[placeholder*="first name" i], ' +
      '.cl-formField input'
    ).first();
  }

  get lastNameInput() {
    return this.page.locator(
      'input[name="lastName"], ' +
      'input[placeholder*="last name" i], ' +
      '.cl-formField input'
    ).first();
  }

  get continueButton() {
    return this.page.locator('button').filter({ hasText: /continue|next/i }).first();
  }

  get signInButton() {
    return this.page.locator('button').filter({ hasText: /sign in|log in|submit/i }).first();
  }

  get signUpButton() {
    return this.page.locator('button').filter({ hasText: /sign up|create account|register/i }).first();
  }

  get signOutButton() {
    return this.page.locator('button').filter({ hasText: /sign out|logout/i }).first();
  }

  get errorMessage() {
    return this.page.locator('.cl-formFieldError, .cl-error, [role="alert"], .error-message');
  }

  get successMessage() {
    return this.page.locator('.cl-success, .success-message, [data-testid="success-message"]');
  }

  get userProfile() {
    return this.page.locator('[data-testid="user-profile"], .user-button, .cl-userButton');
  }

  get signUpLink() {
    return this.page.locator('a').filter({ hasText: /sign up|create account|register/i }).first();
  }

  get signInLink() {
    return this.page.locator('a').filter({ hasText: /sign in|log in/i }).first();
  }

  // Actions
  async visitSignIn() {
    await this.goto('/sign-in');
    await this.waitForClerkToLoad();
  }

  async visitSignUp() {
    await this.goto('/sign-up');
    await this.waitForClerkToLoad();
  }

  async waitForClerkToLoad() {
    // Wait for Clerk to initialize
    await this.page.waitForSelector('.cl-rootBox, .cl-card, [data-clerk-element]', { 
      timeout: 15000 
    });
    await this.page.waitForTimeout(2000); // Additional wait for full initialization
  }

  async signIn(email: string, password: string) {
    console.log(`🔐 Attempting to sign in with email: ${email}`);
    
    // Fill email
    await this.emailInput.waitFor({ timeout: 10000 });
    await this.emailInput.fill(email);
    console.log('✅ Email filled');
    
    // Click continue to proceed to password (Clerk often uses multi-step)
    if (await this.continueButton.isVisible()) {
      await this.continueButton.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Continued to password step');
    }
    
    // Fill password
    await this.passwordInput.waitFor({ timeout: 10000 });
    await this.passwordInput.fill(password);
    console.log('✅ Password filled');
    
    // Submit
    await this.signInButton.click();
    console.log('✅ Sign in button clicked');
    
    // Wait for either success or error
    await this.page.waitForTimeout(3000);
  }

  async signUp(firstName: string, lastName: string, email: string, password: string) {
    console.log(`📝 Attempting to sign up: ${firstName} ${lastName} - ${email}`);
    
    // Check if we're on sign-up page, if not navigate there
    if (!this.page.url().includes('/sign-up')) {
      if (await this.signUpLink.isVisible()) {
        await this.signUpLink.click();
        await this.waitForClerkToLoad();
      }
    }
    
    // Fill form fields as they appear (Clerk may use multi-step)
    if (await this.firstNameInput.isVisible()) {
      await this.firstNameInput.fill(firstName);
      console.log('✅ First name filled');
    }
    
    if (await this.lastNameInput.isVisible()) {
      await this.lastNameInput.fill(lastName);
      console.log('✅ Last name filled');
    }
    
    await this.emailInput.fill(email);
    console.log('✅ Email filled');
    
    if (await this.passwordInput.isVisible()) {
      await this.passwordInput.fill(password);
      console.log('✅ Password filled');
    }
    
    // Submit
    await this.signUpButton.click();
    console.log('✅ Sign up button clicked');
    
    await this.page.waitForTimeout(3000);
  }

  async signOut() {
    console.log('🚪 Attempting to sign out');
    
    // Look for user profile button first
    if (await this.userProfile.isVisible()) {
      await this.userProfile.click();
      await this.page.waitForTimeout(1000);
    }
    
    // Then look for sign out button
    await this.signOutButton.waitFor({ timeout: 10000 });
    await this.signOutButton.click();
    
    // Wait for redirect
    await this.page.waitForTimeout(2000);
    console.log('✅ Signed out');
  }

  async waitForSignInRedirect() {
    // Wait for redirect after successful sign in
    await this.page.waitForURL(url => !url.includes('/sign-in'), { timeout: 15000 });
    console.log('✅ Redirected after sign in');
  }

  async waitForSignUpRedirect() {
    // Wait for redirect after successful sign up
    await this.page.waitForURL(url => !url.includes('/sign-up'), { timeout: 15000 });
    console.log('✅ Redirected after sign up');
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check if we can access a protected page
      await this.page.goto('/home', { timeout: 10000 });
      await this.page.waitForTimeout(3000);
      
      const currentUrl = this.page.url();
      const isAuth = !currentUrl.includes('/sign-in') && !currentUrl.includes('/sign-up');
      
      console.log(`🔍 Authentication check: ${isAuth ? 'Authenticated' : 'Not authenticated'}`);
      return isAuth;
    } catch (error) {
      console.log('🔍 Authentication check failed:', error.message);
      return false;
    }
  }

  // Assertions
  async expectSignInPageLoaded() {
    await expect(this.clerkContainer).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    console.log('✅ Sign-in page loaded correctly');
  }

  async expectSignUpPageLoaded() {
    await expect(this.clerkContainer).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    console.log('✅ Sign-up page loaded correctly');
  }

  async expectSignInSuccess() {
    // Check that we're no longer on auth pages
    const currentUrl = this.page.url();
    expect(currentUrl).not.toContain('/sign-in');
    expect(currentUrl).not.toContain('/sign-up');
    console.log('✅ Sign-in successful');
  }

  async expectSignInError() {
    await expect(this.errorMessage).toBeVisible();
    console.log('✅ Sign-in error displayed correctly');
  }

  async expectSignUpSuccess() {
    // Check that we're redirected or see success
    const currentUrl = this.page.url();
    const hasSuccess = await this.successMessage.isVisible() || !currentUrl.includes('/sign-up');
    expect(hasSuccess).toBeTruthy();
    console.log('✅ Sign-up successful');
  }

  async expectSignedOut() {
    // Should be able to see sign-in elements again
    await this.visitSignIn();
    await expect(this.emailInput).toBeVisible();
    console.log('✅ Successfully signed out');
  }

  async expectProtectedPageRedirect() {
    // Should be redirected to sign-in when accessing protected page
    const currentUrl = this.page.url();
    const isRedirected = currentUrl.includes('/sign-in') || 
                        currentUrl.includes('/sign-up') ||
                        currentUrl.includes('clerk');
    expect(isRedirected).toBeTruthy();
    console.log('✅ Protected page properly redirected to auth');
  }
} 