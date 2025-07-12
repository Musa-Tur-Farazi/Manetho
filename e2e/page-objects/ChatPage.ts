import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ChatPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Main chat elements (based on actual chat page structure)
  get chatContainer() {
    return this.page.locator('.h-screen, main, [data-testid="chat-container"]');
  }

  get sidebar() {
    return this.page.locator('.bg-white.dark\\:bg-gray-900, .sidebar');
  }

  get chatArea() {
    return this.page.locator('.flex-1, .chat-area');
  }

  // Message elements
  get messageInput() {
    return this.page.locator('textarea, input[type="text"]').filter({ hasAttribute: 'placeholder' });
  }

  get sendButton() {
    return this.page.locator('button').filter({ hasText: /send/i }).or(
      this.page.locator('button:has(svg)')
    ).first();
  }

  get messages() {
    return this.page.locator('.message, .chat-message, [data-testid="message"]');
  }

  get messageText() {
    return this.page.locator('.message-content, .whitespace-pre-wrap');
  }

  // Video/Audio call elements (matching actual component)
  get videoCallButton() {
    return this.page.locator('button').filter({ hasText: /video/i }).or(
      this.page.locator('button:has([data-testid="video"])')
    );
  }

  get audioCallButton() {
    return this.page.locator('button').filter({ hasText: /audio|call/i }).or(
      this.page.locator('button:has([data-testid="phone"])')
    );
  }

  get endCallButton() {
    return this.page.locator('button').filter({ hasText: /end call|hang up/i });
  }

  // Call notification elements
  get incomingCallNotification() {
    return this.page.locator('.incoming-call, [data-testid="incoming-call"]');
  }

  get acceptCallButton() {
    return this.page.locator('button').filter({ hasText: /accept/i });
  }

  get declineCallButton() {
    return this.page.locator('button').filter({ hasText: /decline|reject/i });
  }

  // User list and selection
  get userList() {
    return this.page.locator('.user-list, .contact-list');
  }

  get onlineUsers() {
    return this.page.locator('.online-user, .user-online, [data-testid="online-user"]');
  }

  get userProfiles() {
    return this.page.locator('a[href*="/profile/"], .user-profile, .contact-item');
  }

  // File upload elements
  get fileUploadButton() {
    return this.page.locator('button:has([data-testid="paperclip"]), input[type="file"]');
  }

  get uploadedFiles() {
    return this.page.locator('.uploaded-file, .file-attachment');
  }

  // Search functionality
  get searchInput() {
    return this.page.locator('input[placeholder*="search" i]');
  }

  // Actions
  async visitChat() {
    console.log('💬 Navigating to Chat page');
    await this.goto('/chat');
    await this.waitForPageLoad();
    await this.page.waitForTimeout(3000); // Allow for real-time connections
  }

  async selectUser(userIndex: number) {
    console.log(`👤 Selecting user ${userIndex} for chat`);
    
    const users = await this.userProfiles.all();
    if (users.length > userIndex) {
      await users[userIndex].click();
      await this.page.waitForTimeout(2000);
      console.log('✅ User selected for chat');
    }
  }

  async sendMessage(message: string) {
    console.log(`📤 Sending message: ${message}`);
    
    await this.messageInput.waitFor({ timeout: 10000 });
    await this.messageInput.fill(message);
    console.log('✅ Message typed');
    
    await this.sendButton.click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Message sent');
  }

  async sendMessageWithEnter(message: string) {
    console.log(`📤 Sending message with Enter: ${message}`);
    
    await this.messageInput.fill(message);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
    console.log('✅ Message sent with Enter');
  }

  async startVideoCall() {
    console.log('📹 Starting video call');
    
    await this.videoCallButton.waitFor({ timeout: 10000 });
    await this.videoCallButton.click();
    await this.page.waitForTimeout(3000);
    console.log('✅ Video call initiated');
  }

  async startAudioCall() {
    console.log('📞 Starting audio call');
    
    await this.audioCallButton.waitFor({ timeout: 10000 });
    await this.audioCallButton.click();
    await this.page.waitForTimeout(3000);
    console.log('✅ Audio call initiated');
  }

  async endCall() {
    console.log('📵 Ending call');
    
    if (await this.endCallButton.isVisible()) {
      await this.endCallButton.click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Call ended');
    }
  }

  async acceptIncomingCall() {
    console.log('✅ Accepting incoming call');
    
    await this.acceptCallButton.waitFor({ timeout: 10000 });
    await this.acceptCallButton.click();
    await this.page.waitForTimeout(3000);
    console.log('✅ Incoming call accepted');
  }

  async declineIncomingCall() {
    console.log('❌ Declining incoming call');
    
    await this.declineCallButton.click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Incoming call declined');
  }

  async uploadFile(filePath: string) {
    console.log(`📎 Uploading file: ${filePath}`);
    
    // Handle file input
    const fileInput = this.page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(filePath);
      await this.page.waitForTimeout(2000);
      console.log('✅ File uploaded');
    } else {
      // Click upload button first
      await this.fileUploadButton.click();
      await this.page.waitForTimeout(1000);
      
      await this.page.locator('input[type="file"]').setInputFiles(filePath);
      await this.page.waitForTimeout(2000);
      console.log('✅ File uploaded via button');
    }
  }

  async searchUsers(searchTerm: string) {
    console.log(`🔍 Searching for users: ${searchTerm}`);
    
    if (await this.searchInput.isVisible()) {
      await this.searchInput.fill(searchTerm);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(2000);
      console.log('✅ User search performed');
    }
  }

  // Assertions
  async expectChatPageLoaded() {
    await expect(this.chatContainer).toBeVisible();
    console.log('✅ Chat page loaded successfully');
  }

  async expectMessageInputVisible() {
    await expect(this.messageInput).toBeVisible();
    console.log('✅ Message input is visible');
  }

  async expectVideoCallAvailable() {
    await expect(this.videoCallButton).toBeVisible();
    console.log('✅ Video call functionality available');
  }

  async expectAudioCallAvailable() {
    await expect(this.audioCallButton).toBeVisible();
    console.log('✅ Audio call functionality available');
  }

  async expectMessageSent(messageText: string) {
    const messageWithText = this.page.locator('text=' + messageText);
    await expect(messageWithText).toBeVisible();
    console.log(`✅ Message sent successfully: ${messageText}`);
  }

  async expectIncomingCallNotification() {
    await expect(this.incomingCallNotification).toBeVisible();
    console.log('✅ Incoming call notification visible');
  }

  async expectCallInProgress() {
    // Check for call UI elements
    const hasEndButton = await this.endCallButton.isVisible();
    const hasCallIndicator = await this.page.locator('.call-active, .in-call').isVisible();
    
    expect(hasEndButton || hasCallIndicator).toBeTruthy();
    console.log('✅ Call in progress detected');
  }

  async expectOnlineUsersVisible() {
    const onlineUserCount = await this.onlineUsers.count();
    expect(onlineUserCount).toBeGreaterThan(0);
    console.log(`✅ Found ${onlineUserCount} online users`);
  }

  async expectChatFunctional() {
    // Comprehensive check for chat functionality
    await expect(this.messageInput).toBeVisible();
    await expect(this.sendButton).toBeVisible();
    
    const hasCallButtons = await this.videoCallButton.isVisible() || await this.audioCallButton.isVisible();
    expect(hasCallButtons).toBeTruthy();
    
    console.log('✅ Chat functionality verified');
  }
} 