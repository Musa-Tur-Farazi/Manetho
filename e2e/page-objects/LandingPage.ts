import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LandingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  get heroSection() {
    return this.page.locator('[data-testid="hero-section"]');
  }

  get getStartedButton() {
    return this.page.getByRole('button', { name: /get started/i });
  }

  get signInButton() {
    return this.page.getByRole('button', { name: /sign in/i });
  }

  get featuresSection() {
    return this.page.locator('[data-testid="features-section"]');
  }

  get statisticsSection() {
    return this.page.locator('[data-testid="statistics-section"]');
  }

  get testimonialsSection() {
    return this.page.locator('[data-testid="testimonials-section"]');
  }

  get navbar() {
    return this.page.locator('nav');
  }

  get footer() {
    return this.page.locator('footer');
  }

  // Actions
  async visitLandingPage() {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  async clickGetStarted() {
    await this.getStartedButton.click();
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async navigateToSection(section: 'features' | 'pricing' | 'about') {
    await this.page.getByRole('link', { name: section }).click();
  }

  // Assertions
  async expectLandingPageToLoad() {
    await expect(this.heroSection).toBeVisible();
    await expect(this.navbar).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  async expectHeroContent() {
    await expect(this.heroSection).toContainText('Manetho');
    await expect(this.getStartedButton).toBeVisible();
  }

  async expectFeaturesVisible() {
    await expect(this.featuresSection).toBeVisible();
  }

  async expectStatisticsVisible() {
    await expect(this.statisticsSection).toBeVisible();
  }

  async expectTestimonialsVisible() {
    await expect(this.testimonialsSection).toBeVisible();
  }
} 