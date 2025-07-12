import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  get sidebar() {
    return this.page.locator('[data-testid="sidebar"]');
  }

  get chatLink() {
    return this.page.getByRole('link', { name: /chat/i });
  }

  get communityLink() {
    return this.page.getByRole('link', { name: /community/i });
  }

  get studyGroupsLink() {
    return this.page.getByRole('link', { name: /group study/i });
  }

  get mindMapLink() {
    return this.page.getByRole('link', { name: /mind map/i });
  }

  get doubtSolvingLink() {
    return this.page.getByRole('link', { name: /doubt solving/i });
  }

  get flashcardsLink() {
    return this.page.getByRole('link', { name: /flashcards/i });
  }

  get profileLink() {
    return this.page.getByRole('link', { name: /profile/i });
  }

  get welcomeMessage() {
    return this.page.locator('[data-testid="welcome-message"]');
  }

  get quickActions() {
    return this.page.locator('[data-testid="quick-actions"]');
  }

  // Actions
  async visitDashboard() {
    await this.goto('/home');
    await this.waitForPageLoad();
  }

  async navigateToChat() {
    await this.chatLink.click();
  }

  async navigateToCommunity() {
    await this.communityLink.click();
  }

  async navigateToStudyGroups() {
    await this.studyGroupsLink.click();
  }

  async navigateToMindMap() {
    await this.mindMapLink.click();
  }

  async navigateToDoubtSolving() {
    await this.doubtSolvingLink.click();
  }

  async navigateToFlashcards() {
    await this.flashcardsLink.click();
  }

  async navigateToProfile() {
    await this.profileLink.click();
  }

  // Assertions
  async expectDashboardLoaded() {
    await expect(this.sidebar).toBeVisible();
    await expect(this.welcomeMessage).toBeVisible();
  }

  async expectNavigationVisible() {
    await expect(this.chatLink).toBeVisible();
    await expect(this.communityLink).toBeVisible();
    await expect(this.studyGroupsLink).toBeVisible();
  }

  async expectQuickActionsVisible() {
    await expect(this.quickActions).toBeVisible();
  }
} 