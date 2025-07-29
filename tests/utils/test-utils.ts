import { test as base, expect, Page } from '@playwright/test';

// Test data for different user types
export const testUsers = {
  student: {
    email: 'test-student@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Student'
  },
  teacher: {
    email: 'test-teacher@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Teacher'
  }
};

// Common selectors used across tests - updated to match actual app
export const selectors = {
  // Navigation
  sidebar: '[data-testid="sidebar"], .sidebar, [class*="sidebar"]',
  sidebarToggle: '[data-testid="sidebar-toggle"], button[aria-label*="menu"], button[aria-label*="sidebar"]',
  navbar: 'nav, [role="navigation"], header',
  
  // Auth - updated to match actual app
  signInButton: 'button:has-text("Log in"), button:has-text("Sign In"), button:has-text("Login")',
  signUpButton: 'button:has-text("Sign Up"), button:has-text("Register"), button:has-text("Create Account")',
  emailInput: 'input[type="email"], input[name="email"]',
  passwordInput: 'input[type="password"], input[name="password"]',
  submitButton: 'button[type="submit"]',
  
  // Common UI
  loadingSpinner: '[data-testid="loading-spinner"], .loading, .spinner',
  errorMessage: '[data-testid="error-message"], .error, .alert-error',
  successMessage: '[data-testid="success-message"], .success, .alert-success',
  modal: '[data-testid="modal"], .modal, [role="dialog"]',
  modalClose: '[data-testid="modal-close"], .modal-close, button[aria-label*="close"]',
  
  // Forms
  form: 'form',
  input: 'input',
  textarea: 'textarea',
  select: 'select',
  button: 'button',
  
  // Cards and lists
  card: '[data-testid="card"], .card, [class*="card"]',
  cardTitle: '[data-testid="card-title"], .card-title, h3, h4',
  cardContent: '[data-testid="card-content"], .card-content, .card-body',
  listItem: '[data-testid="list-item"], li, .list-item',
  
  // Actions
  addButton: '[data-testid="add-button"], button:has-text("Add"), button:has-text("Create"), button:has-text("New")',
  editButton: '[data-testid="edit-button"], button:has-text("Edit"), button[aria-label*="edit"]',
  deleteButton: '[data-testid="delete-button"], button:has-text("Delete"), button[aria-label*="delete"]',
  saveButton: '[data-testid="save-button"], button:has-text("Save"), button:has-text("Submit")',
  cancelButton: '[data-testid="cancel-button"], button:has-text("Cancel"), button:has-text("Close")',
  
  // Search and filters
  searchInput: '[data-testid="search-input"], input[placeholder*="search"], input[type="search"]',
  filterDropdown: '[data-testid="filter-dropdown"], select, [role="combobox"]',
  sortDropdown: '[data-testid="sort-dropdown"], select[name*="sort"]',
  
  // Pagination
  pagination: '[data-testid="pagination"], .pagination',
  nextPage: '[data-testid="next-page"], button:has-text("Next"), a:has-text("Next")',
  prevPage: '[data-testid="prev-page"], button:has-text("Previous"), a:has-text("Previous")',
  
  // Theme
  themeToggle: '[data-testid="theme-toggle"], button[aria-label*="theme"], button[aria-label*="dark"]',
  
  // Notifications
  notificationBell: '[data-testid="notification-bell"], button[aria-label*="notification"], button[aria-label*="bell"]',
  notificationItem: '[data-testid="notification-item"], .notification, .alert',
  
  // Profile
  profileMenu: '[data-testid="profile-menu"], button[aria-label*="profile"], button[aria-label*="user"]',
  profileAvatar: '[data-testid="profile-avatar"], img[alt*="profile"], img[alt*="avatar"]',
  logoutButton: '[data-testid="logout-button"], button:has-text("Logout"), button:has-text("Sign Out")',
};

// Common test data
export const testData = {
  // Flashcard data
  flashcard: {
    question: 'What is the capital of France?',
    answer: 'Paris',
    hint: 'City of Light',
    explanation: 'Paris is the capital and largest city of France.',
    difficulty: 'beginner' as const
  },
  
  // Mind map data
  mindMap: {
    title: 'Test Mind Map',
    description: 'A test mind map for E2E testing',
    topic: 'Test Topic',
    maxNodes: 10
  },
  
  // Quiz data
  quiz: {
    topic: 'General Knowledge',
    difficulty: 'beginner' as const,
    questionCount: 5,
    questionType: 'multiple_choice' as const,
    additionalContext: 'Basic general knowledge questions'
  },
  
  // Community post data
  communityPost: {
    content: 'This is a test community post for E2E testing',
    postType: 'text' as const
  },
  
  // Group study data
  groupStudy: {
    groupName: 'Test Study Group',
    description: 'A test study group for collaborative learning',
    meetingType: 'online' as const,
    maxParticipants: 10,
    meetingLink: 'https://meet.google.com/test-group-link',
    subject: 'Mathematics',
    tags: ['math', 'algebra', 'calculus']
  },
  
  // Profile data
  profile: {
    fullName: 'Test User',
    bio: 'This is a test user profile for E2E testing',
    grade: '12th Grade',
    school: 'Test High School',
    country: 'United States'
  },
  
  // File upload data
  files: {
    sampleImage: {
      name: 'sample-image.jpg',
      type: 'image/jpeg',
      size: 1024 * 1024 // 1MB
    },
    sampleDocument: {
      name: 'sample-document.pdf',
      type: 'application/pdf',
      size: 1024 * 1024 // 1MB
    },
    invalidFile: {
      name: 'invalid-file.exe',
      type: 'application/x-executable',
      size: 1024 * 1024 // 1MB
    }
  }
};

// Common page actions - updated to work with actual app
export class PageActions {
  constructor(private page: Page) {}

  // Navigation helpers
  async navigateTo(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // Authentication helpers - updated to work with actual app
  async signIn(email: string, password: string) {
    await this.page.goto('/custom-auth/sign-in');
    await this.page.waitForLoadState('networkidle');
    
    // Fill the form
    await this.page.fill(selectors.emailInput, email);
    await this.page.fill(selectors.passwordInput, password);
    
    // Wait for submit button to be enabled
    const submitButton = this.page.locator(selectors.submitButton);
    await submitButton.waitFor({ state: 'visible' });
    
    // Check if button is disabled and wait for it to be enabled
    if (await submitButton.isDisabled()) {
      // Wait for the button to become enabled by polling
      await this.page.waitForFunction(
        () => {
          const button = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          return button && !button.disabled;
        },
        { timeout: 10000 }
      );
    }
    
    await submitButton.click();
    
    // Wait for navigation (might redirect to home or show error)
    try {
      await this.page.waitForURL('/home', { timeout: 5000 });
    } catch {
      // If not redirected to home, check if we're still on sign-in page
      const currentUrl = this.page.url();
      if (currentUrl.includes('/sign-in')) {
        // Check for error messages
        const errorElement = this.page.locator(selectors.errorMessage);
        if (await errorElement.isVisible()) {
          throw new Error(`Sign in failed: ${await errorElement.textContent()}`);
        }
      }
    }
  }

  async signUp(email: string, password: string, firstName: string, lastName: string) {
    await this.page.goto('/custom-auth/sign-up');
    await this.page.waitForLoadState('networkidle');
    
    // Fill the form
    await this.page.fill('input[name="firstName"]', firstName);
    await this.page.fill('input[name="lastName"]', lastName);
    await this.page.fill(selectors.emailInput, email);
    await this.page.fill(selectors.passwordInput, password);
    
    // Wait for submit button to be enabled
    const submitButton = this.page.locator(selectors.submitButton);
    await submitButton.waitFor({ state: 'visible' });
    
    // Check if button is disabled and wait for it to be enabled
    if (await submitButton.isDisabled()) {
      // Wait for the button to become enabled by polling
      await this.page.waitForFunction(
        () => {
          const button = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          return button && !button.disabled;
        },
        { timeout: 10000 }
      );
    }
    
    await submitButton.click();
    
    // Wait for navigation
    try {
      await this.page.waitForURL('/home', { timeout: 5000 });
    } catch {
      // If not redirected to home, check if we're still on sign-up page
      const currentUrl = this.page.url();
      if (currentUrl.includes('/sign-up')) {
        // Check for error messages
        const errorElement = this.page.locator(selectors.errorMessage);
        if (await errorElement.isVisible()) {
          throw new Error(`Sign up failed: ${await errorElement.textContent()}`);
        }
      }
    }
  }

  async signOut() {
    // Look for profile menu or logout button
    const profileMenu = this.page.locator(selectors.profileMenu);
    const logoutButton = this.page.locator(selectors.logoutButton);
    
    if (await profileMenu.isVisible()) {
      await profileMenu.click();
      await this.page.waitForTimeout(500);
      
      // Look for logout option in dropdown
      const logoutOption = this.page.locator('text=Logout, text=Sign Out, text=Log out').first();
      if (await logoutOption.isVisible()) {
        await logoutOption.click();
      }
    } else if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }
    
    // Wait for redirect to landing page
    await this.page.waitForURL('/', { timeout: 5000 });
  }

  // Form helpers
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      const input = this.page.locator(`[name="${field}"]`);
      if (await input.isVisible()) {
        await input.fill(value);
      }
    }
  }

  async submitForm() {
    const submitButton = this.page.locator(selectors.submitButton);
    await submitButton.waitFor({ state: 'visible' });
    
    if (await submitButton.isDisabled()) {
      // Wait for the button to become enabled by polling
      await this.page.waitForFunction(
        () => {
          const button = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          return button && !button.disabled;
        },
        { timeout: 10000 }
      );
    }
    
    await submitButton.click();
  }

  // Modal helpers
  async openModal(triggerSelector: string) {
    await this.page.click(triggerSelector);
    await this.page.waitForSelector(selectors.modal);
  }

  async closeModal() {
    await this.page.click(selectors.modalClose);
    await this.page.waitForSelector(selectors.modal, { state: 'hidden' });
  }

  // Search helpers
  async search(query: string) {
    const searchInput = this.page.locator(selectors.searchInput);
    if (await searchInput.isVisible()) {
      await searchInput.fill(query);
      await this.page.keyboard.press('Enter');
      await this.page.waitForLoadState('networkidle');
    }
  }

  // File upload helpers
  async uploadFile(filePath: string, inputSelector: string) {
    await this.page.setInputFiles(inputSelector, filePath);
  }

  // Theme helpers
  async toggleTheme() {
    const themeToggle = this.page.locator(selectors.themeToggle);
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
    }
  }

  // Sidebar helpers
  async toggleSidebar() {
    const sidebarToggle = this.page.locator(selectors.sidebarToggle);
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();
    }
  }

  // Wait helpers
  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForElementHidden(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  // Assertion helpers
  async expectToBeVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectToBeHidden(selector: string) {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  async expectToHaveText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toHaveText(text);
  }

  async expectToContainText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  // URL helpers
  async expectURL(path: string) {
    await expect(this.page).toHaveURL(path);
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}

// Custom test fixture with common utilities
export const test = base.extend<{ pageActions: PageActions }>({
  pageActions: async ({ page }, use) => {
    await use(new PageActions(page));
  },
});

export { expect } from '@playwright/test'; 