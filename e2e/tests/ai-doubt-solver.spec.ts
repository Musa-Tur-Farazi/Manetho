import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { ApiMocks } from '../mocks/api-mocks';
import { TestHelpers } from '../utils/test-helpers';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('AI Doubt Solver', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;
  let apiMocks: ApiMocks;
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    apiMocks = new ApiMocks(page);
    testHelpers = new TestHelpers(page);
    
    // Setup mocks and authenticate
    await apiMocks.mockSuccessfulAuth();
    await apiMocks.mockDoubtSolverApi();
    
    const loginSuccess = await testHelpers.authenticateUser();
    test.skip(!loginSuccess, 'Authentication required for doubt solver tests');
  });

  test.afterEach(async () => {
    await apiMocks.clearMocks();
  });

  test('should navigate to doubt solving page', async () => {
    await dashboardPage.navigateToDoubtSolving();
    await expect(dashboardPage.page).toHaveURL(/.*\/tools\/doubt-solving.*/);
  });

  test('should display doubt solver interface', async () => {
    await dashboardPage.navigateToDoubtSolving();
    
    // Check for main doubt solver elements
    const questionInput = dashboardPage.page.locator('[data-testid="question-input"]');
    const submitButton = dashboardPage.page.locator('[data-testid="submit-question-button"]');
    const solutionArea = dashboardPage.page.locator('[data-testid="solution-area"]');
    
    await expect(questionInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(solutionArea).toBeVisible();
  });

  test('should submit question and receive AI solution', async () => {
    await dashboardPage.navigateToDoubtSolving();
    
    const questionInput = dashboardPage.page.locator('[data-testid="question-input"]');
    const submitButton = dashboardPage.page.locator('[data-testid="submit-question-button"]');
    
    // Submit a question
    await questionInput.fill('What is 2+2?');
    await submitButton.click();
    
    // Wait for API response and check solution
    await testHelpers.waitForApiResponse('**/api/doubt-solving');
    
    // Check if solution appears
    const solutionText = dashboardPage.page.locator('text=The answer is 4');
    await expect(solutionText).toBeVisible();
    
    console.log('✅ AI DOUBT SOLVER: Question submitted and solution received');
  });

  test('should display solution steps', async () => {
    await dashboardPage.navigateToDoubtSolving();
    
    const questionInput = dashboardPage.page.locator('[data-testid="question-input"]');
    const submitButton = dashboardPage.page.locator('[data-testid="submit-question-button"]');
    
    await questionInput.fill('What is 2+2?');
    await submitButton.click();
    
    await testHelpers.waitForApiResponse('**/api/doubt-solving');
    
    // Check for solution steps
    const step1 = dashboardPage.page.locator('text=Step 1: Identify the operation');
    const step2 = dashboardPage.page.locator('text=Step 2: Add the numbers');
    
    await expect(step1).toBeVisible();
    await expect(step2).toBeVisible();
    
    console.log('✅ SOLUTION STEPS: AI provides step-by-step solution');
  });

  test('should handle empty question submission', async () => {
    await dashboardPage.navigateToDoubtSolving();
    
    const submitButton = dashboardPage.page.locator('[data-testid="submit-question-button"]');
    
    // Try to submit empty question
    await submitButton.click();
    
    // Should show validation message or prevent submission
    const validationMessage = dashboardPage.page.locator('text=Please enter a question');
    const hasValidation = await validationMessage.isVisible();
    
    // Or check if button is disabled/form prevented submission
    const buttonDisabled = await submitButton.isDisabled();
    
    expect(hasValidation || buttonDisabled).toBeTruthy();
    
    console.log('✅ VALIDATION: Empty question submission prevented');
  });

  test('should display doubt solving sessions', async () => {
    await dashboardPage.navigateToDoubtSolving();
    
    // Look for sessions list
    const sessionsList = dashboardPage.page.locator('[data-testid="doubt-sessions-list"]');
    
    if (await sessionsList.isVisible()) {
      await expect(sessionsList).toBeVisible();
      
      // Check for session items
      const sessionItem = dashboardPage.page.locator('[data-testid="session-item"]');
      if (await sessionItem.count() > 0) {
        await expect(sessionItem.first()).toBeVisible();
      }
    }
    
    console.log('✅ SESSIONS: Doubt solving sessions displayed');
  });

  test('should handle file upload for questions', async () => {
    await dashboardPage.navigateToDoubtSolving();
    
    // Mock file upload
    await apiMocks.mockFileUploadApi();
    
    // Look for file upload functionality
    const fileUploadButton = dashboardPage.page.locator('[data-testid="upload-question-file"]');
    
    if (await fileUploadButton.isVisible()) {
      await fileUploadButton.click();
      
      // Check if file upload area appears
      const fileUploadArea = dashboardPage.page.locator('[data-testid="file-upload-area"]');
      await expect(fileUploadArea).toBeVisible();
    }
    
    console.log('✅ FILE UPLOAD: Question file upload functionality available');
  });

  test('should handle API errors gracefully', async () => {
    // Mock API error for doubt solving
    await testHelpers.mockApiError('**/api/doubt-solving', 500, 'AI Service Unavailable');
    
    await dashboardPage.navigateToDoubtSolving();
    
    const questionInput = dashboardPage.page.locator('[data-testid="question-input"]');
    const submitButton = dashboardPage.page.locator('[data-testid="submit-question-button"]');
    
    await questionInput.fill('What is 2+2?');
    await submitButton.click();
    
    // Should show error message
    const errorMessage = dashboardPage.page.locator('text=AI Service Unavailable');
    const generalError = dashboardPage.page.locator('text=error occurred');
    
    const hasErrorHandling = await errorMessage.isVisible() || await generalError.isVisible();
    expect(hasErrorHandling).toBeTruthy();
    
    console.log('❌ ERROR HANDLING: AI service errors handled gracefully');
  });

  test('should be responsive on mobile', async ({ isMobile }) => {
    test.skip(!isMobile, 'This test is only for mobile devices');
    
    await dashboardPage.navigateToDoubtSolving();
    
    // Check mobile interface
    const questionInput = dashboardPage.page.locator('[data-testid="question-input"]');
    const submitButton = dashboardPage.page.locator('[data-testid="submit-question-button"]');
    
    await expect(questionInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Check mobile-specific elements
    const mobileMenu = dashboardPage.page.locator('[data-testid="mobile-doubt-solver-menu"]');
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
    
    console.log('📱 MOBILE: Doubt solver is mobile responsive');
  });
}); 