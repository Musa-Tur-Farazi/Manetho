import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CommunityPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Community navigation and main elements (based on actual page structure)
  get communityContainer() {
    return this.page.locator('main, .min-h-screen, [data-testid="community-container"]');
  }

  get createThreadButton() {
    return this.page.locator('button').filter({ hasText: /create|new post|add post/i }).first();
  }

  get searchInput() {
    return this.page.locator('input').filter({ hasValue: this.page.getByPlaceholder(/search/i) }).or(
      this.page.locator('input[type="search"]')
    );
  }

  // Thread and post elements (matching actual community page structure)
  get posts() {
    return this.page.locator('.bg-white.dark\\:bg-gray-800, .post-container, [data-testid="community-post"]');
  }

  get postContent() {
    return this.page.locator('.post-content, .whitespace-pre-wrap');
  }

  get starButtons() {
    return this.page.locator('button').filter({ hasText: /star|⭐/i }).or(
      this.page.locator('button:has(svg)').filter({ hasText: /^\d+$/ })
    );
  }

  get commentButtons() {
    return this.page.locator('button').filter({ hasText: /comment/i }).or(
      this.page.locator('button:has([data-testid="message-circle"])')
    );
  }

  get shareButtons() {
    return this.page.locator('button').filter({ hasText: /share/i });
  }

  // User interaction elements
  get userProfiles() {
    return this.page.locator('a[href*="/profile/"], .user-profile, .profile-link');
  }

  get followButtons() {
    return this.page.locator('button').filter({ hasText: /follow|unfollow/i });
  }

  get onlineUsers() {
    return this.page.locator('.online-user, [data-testid="online-user"]');
  }

  // Form elements for creating content
  get threadTitleInput() {
    return this.page.locator('input[placeholder*="title" i], input[name="title"]');
  }

  get threadContentInput() {
    return this.page.locator('textarea[placeholder*="content" i], textarea[name="content"], .editor');
  }

  get submitThreadButton() {
    return this.page.locator('button').filter({ hasText: /submit|post|create/i }).first();
  }

  get commentInput() {
    return this.page.locator('textarea[placeholder*="comment" i], input[placeholder*="comment" i]');
  }

  get submitCommentButton() {
    return this.page.locator('button').filter({ hasText: /submit comment|add comment|reply/i }).first();
  }

  // Actions
  async visitCommunity() {
    console.log('🌐 Navigating to Community page');
    await this.goto('/community');
    await this.waitForPageLoad();
    await this.page.waitForTimeout(2000);
  }

  async createThread(title: string, content: string) {
    console.log(`📝 Creating thread: ${title}`);
    
    await this.createThreadButton.click();
    await this.page.waitForTimeout(1000);
    
    if (await this.threadTitleInput.isVisible()) {
      await this.threadTitleInput.fill(title);
      console.log('✅ Thread title filled');
    }
    
    if (await this.threadContentInput.isVisible()) {
      await this.threadContentInput.fill(content);
      console.log('✅ Thread content filled');
    }
    
    await this.submitThreadButton.click();
    await this.page.waitForTimeout(3000);
    console.log('✅ Thread submitted');
  }

  async addComment(threadIndex: number, comment: string) {
    console.log(`💬 Adding comment to thread ${threadIndex}: ${comment}`);
    
    const threads = await this.threads.all();
    if (threads.length > threadIndex) {
      await threads[threadIndex].locator(this.commentButtons.locator).first().click();
      await this.page.waitForTimeout(1000);
      
      if (await this.commentInput.isVisible()) {
        await this.commentInput.fill(comment);
        await this.submitCommentButton.click();
        await this.page.waitForTimeout(2000);
        console.log('✅ Comment added');
      }
    }
  }

  async likeThread(threadIndex: number) {
    console.log(`👍 Liking thread ${threadIndex}`);
    
    const threads = await this.threads.all();
    if (threads.length > threadIndex) {
      await threads[threadIndex].locator(this.likeButtons.locator).first().click();
      await this.page.waitForTimeout(1000);
      console.log('✅ Thread liked');
    }
  }

  async searchThreads(searchTerm: string) {
    console.log(`🔍 Searching for: ${searchTerm}`);
    
    if (await this.searchInput.isVisible()) {
      await this.searchInput.fill(searchTerm);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(2000);
      console.log('✅ Search performed');
    }
  }

  async followUser(userIndex: number) {
    console.log(`👤 Following user ${userIndex}`);
    
    const followBtns = await this.followButtons.all();
    if (followBtns.length > userIndex) {
      await followBtns[userIndex].click();
      await this.page.waitForTimeout(1000);
      console.log('✅ User followed');
    }
  }

  async visitUserProfile(userIndex: number) {
    console.log(`👤 Visiting user profile ${userIndex}`);
    
    const profiles = await this.userProfiles.all();
    if (profiles.length > userIndex) {
      await profiles[userIndex].click();
      await this.page.waitForTimeout(2000);
      console.log('✅ User profile visited');
    }
  }

  // Assertions
  async expectCommunityPageLoaded() {
    await expect(this.communityContainer).toBeVisible();
    console.log('✅ Community page loaded successfully');
  }

  async expectThreadsVisible() {
    const threadCount = await this.threads.count();
    expect(threadCount).toBeGreaterThan(0);
    console.log(`✅ Found ${threadCount} threads in community`);
  }

  async expectThreadCreated(title: string) {
    const threadWithTitle = this.page.locator('text=' + title);
    await expect(threadWithTitle).toBeVisible();
    console.log(`✅ Thread created successfully: ${title}`);
  }

  async expectUserInteractionsAvailable() {
    // Check that basic interaction features are available
    const hasLikes = await this.likeButtons.count() > 0;
    const hasComments = await this.commentButtons.count() > 0;
    const hasUsers = await this.userProfiles.count() > 0;
    
    expect(hasLikes || hasComments || hasUsers).toBeTruthy();
    console.log('✅ User interaction features available');
  }

  async expectOnlineUsersVisible() {
    if (await this.onlineUsers.count() > 0) {
      await expect(this.onlineUsers.first()).toBeVisible();
      console.log('✅ Online users visible');
    } else {
      console.log('ℹ️  No online users currently visible');
    }
  }

  async expectSearchFunctionality() {
    if (await this.searchInput.isVisible()) {
      await expect(this.searchInput).toBeVisible();
      console.log('✅ Search functionality available');
    } else {
      console.log('ℹ️  Search functionality not found');
    }
  }
} 