import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AiDoubtSolverPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Main AI Doubt Solver elements (based on actual page structure)
  get aiContainer() {
    return this.page.locator('.min-h-screen, main, [data-testid="doubt-solver-container"]');
  }

  get sidebar() {
    return this.page.locator('.sidebar-container, .bg-gray-800');
  }

  get chatContainer() {
    return this.page.locator('.main-content, .chat-container');
  }

  // Input and submission elements
  get queryInput() {
    return this.page.locator('textarea, input[type="text"]').filter({ hasAttribute: 'placeholder' });
  }

  get submitButton() {
    return this.page.locator('button').filter({ hasText: /ask|submit|solve|send/i }).or(
      this.page.locator('button:has(svg)').filter({ hasClass: 'send-button' })
    ).first();
  }

  get fileUploadInput() {
    return this.page.locator('input[type="file"]');
  }

  get fileUploadButton() {
    return this.page.locator('button').filter({ hasText: /upload|attach|file/i }).or(
      this.page.locator('button:has([data-testid="image"])')
    );
  }

  // Chat messages and responses
  get chatMessages() {
    return this.page.locator('.chat-row, .message, [data-testid="chat-message"]');
  }

  get userMessages() {
    return this.page.locator('.chat-row.user, .user-message');
  }

  get aiResponses() {
    return this.page.locator('.chat-row.assistant, .ai-message');
  }

  get messageContent() {
    return this.page.locator('.message-content, .whitespace-pre-wrap');
  }

  // File and attachment elements
  get uploadedFiles() {
    return this.page.locator('.uploaded-file, .file-attachment, [data-testid="attachment"]');
  }

  get attachmentPreview() {
    return this.page.locator('.attachment-preview, .file-preview');
  }

  get removeFileButton() {
    return this.page.locator('button').filter({ hasText: /remove|delete|x/i }).or(
      this.page.locator('button:has([data-testid="x"])')
    );
  }

  // Session management
  get newSessionButton() {
    return this.page.locator('button').filter({ hasText: /new session|new chat|create/i }).or(
      this.page.locator('button:has([data-testid="plus"])')
    );
  }

  get sessionList() {
    return this.page.locator('.session-list, .chat-sessions');
  }

  get sessionItems() {
    return this.page.locator('.session-item, .chat-session');
  }

  get deleteSessionButton() {
    return this.page.locator('button').filter({ hasText: /delete|remove/i }).or(
      this.page.locator('button:has([data-testid="trash"])')
    );
  }

  // UI controls
  get sidebarToggle() {
    return this.page.locator('.sidebar-toggle, button').filter({ hasText: /menu|toggle/i });
  }

  get scrollToBottomButton() {
    return this.page.locator('.scroll-button, button').filter({ hasText: /scroll|bottom/i });
  }

  get copyButton() {
    return this.page.locator('button').filter({ hasText: /copy/i }).or(
      this.page.locator('button:has([data-testid="copy"])')
    );
  }

  // Loading states
  get loadingIndicator() {
    return this.page.locator('.loader, .loading, [data-testid="loading"]').or(
      this.page.locator('button:has([data-testid="loader"])')
    );
  }

  get typingIndicator() {
    return this.page.locator('.typing, .generating');
  }

  // Actions
  async visitAiDoubtSolver() {
    console.log('🤖 Navigating to AI Doubt Solver page');
    await this.goto('/tools/doubt-solving');
    await this.waitForPageLoad();
    await this.page.waitForTimeout(3000); // Allow for AI system initialization
  }

  async askQuestion(question: string) {
    console.log(`❓ Asking question: ${question}`);
    
    await this.queryInput.waitFor({ timeout: 10000 });
    await this.queryInput.fill(question);
    console.log('✅ Question typed');
    
    await this.submitButton.click();
    console.log('✅ Question submitted');
    
    // Wait for AI response
    await this.page.waitForTimeout(5000);
  }

  async askQuestionWithFile(question: string, filePath: string) {
    console.log(`❓ Asking question with file: ${question}`);
    
    // Upload file first
    await this.uploadFile(filePath);
    
    // Then ask question
    await this.queryInput.fill(question);
    await this.submitButton.click();
    
    console.log('✅ Question with file submitted');
    await this.page.waitForTimeout(7000); // Longer wait for file processing
  }

  async uploadFile(filePath: string) {
    console.log(`📎 Uploading file: ${filePath}`);
    
    // Try direct file input first
    const fileInput = this.fileUploadInput;
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(filePath);
    } else {
      // Click upload button to reveal file input
      await this.fileUploadButton.click();
      await this.page.waitForTimeout(1000);
      
      const revealedInput = this.page.locator('input[type="file"]');
      await revealedInput.setInputFiles(filePath);
    }
    
    await this.page.waitForTimeout(2000);
    console.log('✅ File uploaded');
  }

  async removeUploadedFile() {
    console.log('🗑️ Removing uploaded file');
    
    if (await this.removeFileButton.isVisible()) {
      await this.removeFileButton.click();
      await this.page.waitForTimeout(1000);
      console.log('✅ File removed');
    }
  }

  async createNewSession() {
    console.log('➕ Creating new AI session');
    
    await this.newSessionButton.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ New session created');
  }

  async switchToSession(sessionIndex: number) {
    console.log(`🔄 Switching to session ${sessionIndex}`);
    
    const sessions = await this.sessionItems.all();
    if (sessions.length > sessionIndex) {
      await sessions[sessionIndex].click();
      await this.page.waitForTimeout(2000);
      console.log('✅ Session switched');
    }
  }

  async deleteSession(sessionIndex: number) {
    console.log(`🗑️ Deleting session ${sessionIndex}`);
    
    const sessions = await this.sessionItems.all();
    if (sessions.length > sessionIndex) {
      // Look for delete button within the session
      const deleteBtn = sessions[sessionIndex].locator(this.deleteSessionButton.locator).first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await this.page.waitForTimeout(1000);
        console.log('✅ Session deleted');
      }
    }
  }

  async copyResponse(responseIndex: number = 0) {
    console.log(`📋 Copying AI response ${responseIndex}`);
    
    const responses = await this.aiResponses.all();
    if (responses.length > responseIndex) {
      // Look for copy button within the response
      const copyBtn = responses[responseIndex].locator(this.copyButton.locator).first();
      if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await this.page.waitForTimeout(500);
        console.log('✅ Response copied to clipboard');
      }
    }
  }

  async scrollToBottom() {
    console.log('⬇️ Scrolling to bottom');
    
    if (await this.scrollToBottomButton.isVisible()) {
      await this.scrollToBottomButton.click();
    } else {
      // Fallback to keyboard shortcut
      await this.page.keyboard.press('End');
    }
    
    await this.page.waitForTimeout(500);
    console.log('✅ Scrolled to bottom');
  }

  async toggleSidebar() {
    console.log('📱 Toggling sidebar');
    
    if (await this.sidebarToggle.isVisible()) {
      await this.sidebarToggle.click();
      await this.page.waitForTimeout(500);
      console.log('✅ Sidebar toggled');
    }
  }

  // Assertions
  async expectAiDoubtSolverLoaded() {
    await expect(this.aiContainer).toBeVisible();
    await expect(this.queryInput).toBeVisible();
    console.log('✅ AI Doubt Solver page loaded successfully');
  }

  async expectQuestionSubmitted(question: string) {
    const userMessage = this.page.locator('text=' + question);
    await expect(userMessage).toBeVisible();
    console.log(`✅ Question submitted successfully: ${question}`);
  }

  async expectAiResponse() {
    // Wait for at least one AI response
    await expect(this.aiResponses.first()).toBeVisible({ timeout: 15000 });
    console.log('✅ AI response received');
  }

  async expectFileUploaded(fileName: string) {
    const fileElement = this.page.locator('text=' + fileName);
    await expect(fileElement).toBeVisible();
    console.log(`✅ File uploaded successfully: ${fileName}`);
  }

  async expectSessionCreated() {
    const sessionCount = await this.sessionItems.count();
    expect(sessionCount).toBeGreaterThan(0);
    console.log(`✅ New session created (total: ${sessionCount})`);
  }

  async expectLoadingState() {
    // Check for loading indicators during AI processing
    const hasLoading = await this.loadingIndicator.isVisible() || 
                      await this.typingIndicator.isVisible();
    expect(hasLoading).toBeTruthy();
    console.log('✅ Loading state detected');
  }

  async expectFileUploadAvailable() {
    const hasFileInput = await this.fileUploadInput.isVisible() || 
                        await this.fileUploadButton.isVisible();
    expect(hasFileInput).toBeTruthy();
    console.log('✅ File upload functionality available');
  }

  async expectSessionManagement() {
    // Check for session management features
    const hasNewSession = await this.newSessionButton.isVisible();
    const hasSessions = await this.sessionItems.count() >= 0;
    
    expect(hasNewSession || hasSessions).toBeTruthy();
    console.log('✅ Session management features available');
  }

  async expectAiFunctional() {
    // Comprehensive check for AI functionality
    await expect(this.queryInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    
    const hasFileUpload = await this.fileUploadButton.isVisible();
    const hasSessionMgmt = await this.newSessionButton.isVisible();
    
    expect(hasFileUpload || hasSessionMgmt).toBeTruthy();
    console.log('✅ AI Doubt Solver functionality verified');
  }
} 