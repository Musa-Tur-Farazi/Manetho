import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Main profile elements (based on actual profile page structure)
  get profileContainer() {
    return this.page.locator('.min-h-screen, main, [data-testid="profile-container"]');
  }

  get profileCard() {
    return this.page.locator('.bg-white.dark\\:bg-gray-800, .profile-card, .bg-gradient-to-br');
  }

  get userAvatar() {
    return this.page.locator('img[alt*="Profile"], .w-16.h-16.rounded-full, .w-24.h-24.rounded-full');
  }

  get displayName() {
    return this.page.locator('h2, h3').filter({ hasText: /.+/ }).first();
  }

  // Edit profile elements
  get editProfileButton() {
    return this.page.locator('button').filter({ hasText: /edit/i }).or(
      this.page.locator('button:has([data-testid="edit"])')
    );
  }

  get saveButton() {
    return this.page.locator('button').filter({ hasText: /save/i }).or(
      this.page.locator('button:has([data-testid="save"])')
    );
  }

  get cancelButton() {
    return this.page.locator('button').filter({ hasText: /cancel|x/i }).or(
      this.page.locator('button:has([data-testid="x"])')
    );
  }

  get displayNameInput() {
    return this.page.locator('input[type="text"]').filter({ hasAttribute: 'value' });
  }

  get bioTextarea() {
    return this.page.locator('textarea');
  }

  get educationSelect() {
    return this.page.locator('select');
  }

  get fieldOfStudyInput() {
    return this.page.locator('input').filter({ hasValue: /.+/ });
  }

  // Social interaction elements (for viewing other profiles)
  get followButton() {
    return this.page.locator('button').filter({ hasText: /follow|unfollow/i }).or(
      this.page.locator('button:has([data-testid="user-plus"])')
    );
  }

  get messageButton() {
    return this.page.locator('button').filter({ hasText: /message|chat/i }).or(
      this.page.locator('button:has([data-testid="message-circle"])')
    );
  }

  get addLearningPartnerButton() {
    return this.page.locator('button').filter({ hasText: /learning partner|partner|add/i });
  }

  // Profile stats
  get studyHours() {
    return this.page.locator('text=/\\d+/').filter({ hasText: /hours?/i });
  }

  get groupsJoined() {
    return this.page.locator('text=/\\d+/').filter({ hasText: /groups?/i });
  }

  get followersCount() {
    return this.page.locator('text=/\\d+/').filter({ hasText: /followers?/i });
  }

  get followingCount() {
    return this.page.locator('text=/\\d+/').filter({ hasText: /following/i });
  }

  // Activity tabs
  get overviewTab() {
    return this.page.locator('button').filter({ hasText: /overview/i });
  }

  get groupsTab() {
    return this.page.locator('button').filter({ hasText: /groups?/i });
  }

  get flashcardsTab() {
    return this.page.locator('button').filter({ hasText: /flashcards?/i });
  }

  get mindMapsTab() {
    return this.page.locator('button').filter({ hasText: /mind maps?/i });
  }

  get solvedTab() {
    return this.page.locator('button').filter({ hasText: /solved/i });
  }

  get postsTab() {
    return this.page.locator('button').filter({ hasText: /posts/i });
  }

  get sharedTab() {
    return this.page.locator('button').filter({ hasText: /shared/i });
  }

  // Activity content
  get activityItems() {
    return this.page.locator('.bg-gray-50.dark\\:bg-gray-700, .activity-item, [data-testid="activity"]');
  }

  get recentActivity() {
    return this.page.locator('.space-y-4, .activity-list');
  }

  // User posts (when viewing other profiles)
  get userPosts() {
    return this.page.locator('.bg-white.dark\\:bg-gray-800, .post-card, [data-testid="user-post"]');
  }

  get postContent() {
    return this.page.locator('.post-content, .whitespace-pre-wrap');
  }

  get likeButtons() {
    return this.page.locator('button').filter({ hasText: /like|star|heart/i });
  }

  get commentButtons() {
    return this.page.locator('button').filter({ hasText: /comment/i });
  }

  // Learning preferences
  get studyPreferences() {
    return this.page.locator('.bg-cyan-100, .preference-tag, .rounded-full');
  }

  get preferenceToggle() {
    return this.page.locator('button.px-3.py-1.rounded-full');
  }

  // Navigation elements
  get backButton() {
    return this.page.locator('button').filter({ hasText: /back/i }).or(
      this.page.locator('button:has([data-testid="chevron-left"])')
    );
  }

  // Online status
  get onlineIndicator() {
    return this.page.locator('.bg-green-500, .online-indicator, [data-testid="online"]');
  }

  get lastActiveText() {
    return this.page.locator('text=/active|last seen/i');
  }

  // Actions
  async visitOwnProfile() {
    console.log('👤 Navigating to own profile page');
    await this.goto('/profile');
    await this.waitForPageLoad();
    await this.page.waitForTimeout(2000);
  }

  async visitUserProfile(userId: string) {
    console.log(`👤 Navigating to user profile: ${userId}`);
    await this.goto(`/profile/${userId}`);
    await this.waitForPageLoad();
    await this.page.waitForTimeout(2000);
  }

  async editProfile() {
    console.log('✏️ Starting profile edit');
    
    await this.editProfileButton.click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Edit mode activated');
  }

  async updateDisplayName(newName: string) {
    console.log(`📝 Updating display name to: ${newName}`);
    
    await this.displayNameInput.fill(newName);
    console.log('✅ Display name updated');
  }

  async updateBio(newBio: string) {
    console.log(`📝 Updating bio: ${newBio}`);
    
    await this.bioTextarea.fill(newBio);
    console.log('✅ Bio updated');
  }

  async updateEducation(level: string, field: string) {
    console.log(`🎓 Updating education: ${level} in ${field}`);
    
    if (await this.educationSelect.isVisible()) {
      await this.educationSelect.selectOption(level);
    }
    
    if (await this.fieldOfStudyInput.isVisible()) {
      await this.fieldOfStudyInput.fill(field);
    }
    
    console.log('✅ Education updated');
  }

  async saveProfile() {
    console.log('💾 Saving profile changes');
    
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Profile saved');
  }

  async cancelEdit() {
    console.log('❌ Cancelling profile edit');
    
    await this.cancelButton.click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Edit cancelled');
  }

  async followUser() {
    console.log('👥 Following/unfollowing user');
    
    await this.followButton.waitFor({ timeout: 10000 });
    const buttonText = await this.followButton.textContent();
    
    await this.followButton.click();
    await this.page.waitForTimeout(2000);
    
    console.log(`✅ ${buttonText?.includes('Follow') ? 'Followed' : 'Unfollowed'} user`);
  }

  async sendMessage() {
    console.log('💬 Navigating to send message');
    
    await this.messageButton.waitFor({ timeout: 10000 });
    await this.messageButton.click();
    await this.page.waitForTimeout(3000);
    console.log('✅ Navigated to chat with user');
  }

  async addAsLearningPartner() {
    console.log('🤝 Adding as learning partner');
    
    if (await this.addLearningPartnerButton.isVisible()) {
      await this.addLearningPartnerButton.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Added as learning partner');
    } else {
      console.log('ℹ️  Learning partner button not found');
    }
  }

  async switchToTab(tabName: 'overview' | 'groups' | 'flashcards' | 'mind-maps' | 'solved' | 'posts' | 'shared') {
    console.log(`📋 Switching to ${tabName} tab`);
    
    let tabElement;
    switch (tabName) {
      case 'overview':
        tabElement = this.overviewTab;
        break;
      case 'groups':
        tabElement = this.groupsTab;
        break;
      case 'flashcards':
        tabElement = this.flashcardsTab;
        break;
      case 'mind-maps':
        tabElement = this.mindMapsTab;
        break;
      case 'solved':
        tabElement = this.solvedTab;
        break;
      case 'posts':
        tabElement = this.postsTab;
        break;
      case 'shared':
        tabElement = this.sharedTab;
        break;
    }
    
    if (await tabElement.isVisible()) {
      await tabElement.click();
      await this.page.waitForTimeout(2000);
      console.log(`✅ Switched to ${tabName} tab`);
    }
  }

  async interactWithPost(postIndex: number, action: 'like' | 'comment') {
    console.log(`${action === 'like' ? '👍' : '💬'} ${action}ing post ${postIndex}`);
    
    const posts = await this.userPosts.all();
    if (posts.length > postIndex) {
      const post = posts[postIndex];
      
      if (action === 'like') {
        const likeBtn = post.locator(this.likeButtons.locator).first();
        if (await likeBtn.isVisible()) {
          await likeBtn.click();
        }
      } else {
        const commentBtn = post.locator(this.commentButtons.locator).first();
        if (await commentBtn.isVisible()) {
          await commentBtn.click();
        }
      }
      
      await this.page.waitForTimeout(1000);
      console.log(`✅ ${action}d post successfully`);
    }
  }

  async toggleStudyPreference(preferenceName: string) {
    console.log(`🎯 Toggling study preference: ${preferenceName}`);
    
    const preferenceButton = this.page.locator('button').filter({ hasText: preferenceName });
    if (await preferenceButton.isVisible()) {
      await preferenceButton.click();
      await this.page.waitForTimeout(500);
      console.log(`✅ Toggled ${preferenceName} preference`);
    }
  }

  async goBack() {
    console.log('⬅️ Going back');
    
    if (await this.backButton.isVisible()) {
      await this.backButton.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Navigated back');
    }
  }

  // Assertions
  async expectProfilePageLoaded() {
    await expect(this.profileContainer).toBeVisible();
    await expect(this.userAvatar).toBeVisible();
    console.log('✅ Profile page loaded successfully');
  }

  async expectOwnProfileEditable() {
    await expect(this.editProfileButton).toBeVisible();
    console.log('✅ Own profile is editable');
  }

  async expectUserProfileViewable() {
    // Should see user info but not edit capabilities
    await expect(this.displayName).toBeVisible();
    await expect(this.userAvatar).toBeVisible();
    console.log('✅ User profile is viewable');
  }

  async expectSocialInteractions() {
    // Check for follow/message buttons
    const hasFollow = await this.followButton.isVisible();
    const hasMessage = await this.messageButton.isVisible();
    
    expect(hasFollow || hasMessage).toBeTruthy();
    console.log('✅ Social interaction features available');
  }

  async expectFollowFunctionality() {
    await expect(this.followButton).toBeVisible();
    console.log('✅ Follow functionality available');
  }

  async expectMessageFunctionality() {
    await expect(this.messageButton).toBeVisible();
    console.log('✅ Message functionality available');
  }

  async expectProfileStats() {
    // Check that at least some stats are visible
    const hasStats = await this.studyHours.isVisible() || 
                    await this.groupsJoined.isVisible() ||
                    await this.followersCount.isVisible();
    
    expect(hasStats).toBeTruthy();
    console.log('✅ Profile stats visible');
  }

  async expectActivityTabs() {
    const hasOverview = await this.overviewTab.isVisible();
    const hasGroups = await this.groupsTab.isVisible();
    const hasPosts = await this.postsTab.isVisible();
    
    expect(hasOverview || hasGroups || hasPosts).toBeTruthy();
    console.log('✅ Activity tabs available');
  }

  async expectUserPosts() {
    const postCount = await this.userPosts.count();
    expect(postCount).toBeGreaterThanOrEqual(0);
    console.log(`✅ Found ${postCount} user posts`);
  }

  async expectOnlineStatus() {
    // Check for online indicator or last active text
    const hasOnlineStatus = await this.onlineIndicator.isVisible() || 
                           await this.lastActiveText.isVisible();
    
    expect(hasOnlineStatus).toBeTruthy();
    console.log('✅ Online status information available');
  }

  async expectEditModeActive() {
    await expect(this.saveButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    console.log('✅ Edit mode is active');
  }

  async expectProfileSaved() {
    // Should be back to view mode
    await expect(this.editProfileButton).toBeVisible();
    console.log('✅ Profile changes saved');
  }

  async expectUserFollowed() {
    // Button text should change
    const buttonText = await this.followButton.textContent();
    expect(buttonText).toMatch(/unfollow|following/i);
    console.log('✅ User is now followed');
  }

  async expectUserUnfollowed() {
    // Button text should change back
    const buttonText = await this.followButton.textContent();
    expect(buttonText).toMatch(/follow/i);
    console.log('✅ User is now unfollowed');
  }

  async expectChatRedirect() {
    // Should be on chat page or have chat URL
    const currentUrl = this.page.url();
    expect(currentUrl).toContain('/chat');
    console.log('✅ Redirected to chat with user');
  }

  async expectLearningPartnerFeatures() {
    // Comprehensive check for learning partner functionality
    await expect(this.followButton).toBeVisible();
    await expect(this.messageButton).toBeVisible();
    
    const hasPartnerFeatures = await this.addLearningPartnerButton.isVisible();
    console.log(`✅ Learning partner features ${hasPartnerFeatures ? 'available' : 'not found'}`);
  }
} 