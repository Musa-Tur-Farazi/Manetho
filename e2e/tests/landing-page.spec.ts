import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/LandingPage';

test.describe('Landing Page', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
  });

  test('should load landing page with all main sections', async () => {
    await landingPage.visitLandingPage();
    
    // Check that the main sections are visible
    await landingPage.expectLandingPageToLoad();
    await landingPage.expectHeroContent();
  });

  test('should display navigation menu', async () => {
    await landingPage.visitLandingPage();
    
    // Check that navbar is visible and functional
    await expect(landingPage.navbar).toBeVisible();
    
    // Check for key navigation items (adjust based on your actual navbar)
    await expect(landingPage.page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(landingPage.page.getByRole('link', { name: /features/i })).toBeVisible();
    await expect(landingPage.page.getByRole('link', { name: /pricing/i })).toBeVisible();
  });

  test('should show features section when scrolled', async () => {
    await landingPage.visitLandingPage();
    
    // Scroll to features section
    await landingPage.featuresSection.scrollIntoViewIfNeeded();
    await landingPage.expectFeaturesVisible();
  });

  test('should show statistics section', async () => {
    await landingPage.visitLandingPage();
    
    // Scroll to statistics section
    await landingPage.statisticsSection.scrollIntoViewIfNeeded();
    await landingPage.expectStatisticsVisible();
  });

  test('should show testimonials section', async () => {
    await landingPage.visitLandingPage();
    
    // Scroll to testimonials section
    await landingPage.testimonialsSection.scrollIntoViewIfNeeded();
    await landingPage.expectTestimonialsVisible();
  });

  test('should have working Get Started button', async () => {
    await landingPage.visitLandingPage();
    
    // Check if Get Started button is clickable and redirects
    await expect(landingPage.getStartedButton).toBeVisible();
    await landingPage.clickGetStarted();
    
    // Should redirect to sign-up or onboarding
    await expect(landingPage.page).toHaveURL(/.*\/(sign-up|onboarding|auth).*/);
  });

  test('should have working Sign In button', async () => {
    await landingPage.visitLandingPage();
    
    // Check if Sign In button is clickable and redirects
    await expect(landingPage.signInButton).toBeVisible();
    await landingPage.clickSignIn();
    
    // Should redirect to sign-in page
    await expect(landingPage.page).toHaveURL(/.*\/sign-in.*/);
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test is only for mobile');
    
    await landingPage.visitLandingPage();
    
    // Check that main elements are visible on mobile
    await landingPage.expectHeroContent();
    
    // Check mobile navigation (hamburger menu, etc.)
    const mobileMenuButton = page.getByRole('button', { name: /menu/i });
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(landingPage.navbar).toBeVisible();
    }
  });

  test('should have proper meta tags and SEO elements', async () => {
    await landingPage.visitLandingPage();
    
    // Check page title
    await expect(landingPage.page).toHaveTitle(/Manetho/);
    
    // Check meta description exists
    const metaDescription = landingPage.page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });

  test('should load without accessibility violations', async () => {
    await landingPage.visitLandingPage();
    
    // Basic accessibility checks
    await expect(landingPage.heroSection).toBeVisible();
    
    // Check that main interactive elements are keyboard accessible
    await landingPage.getStartedButton.focus();
    await expect(landingPage.getStartedButton).toBeFocused();
    
    await landingPage.signInButton.focus();
    await expect(landingPage.signInButton).toBeFocused();
  });
}); 