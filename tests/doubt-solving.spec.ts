import { test, expect } from './utils/test-utils';
import { testUsers, testData } from './utils/test-utils';

test.describe('AI Doubt Solver', () => {
  test.beforeEach(async ({ page, pageActions }) => {
    // Sign in before each test
    await pageActions.signIn(testUsers.student.email, testUsers.student.password);
    await page.goto('/tools/doubt-solving');
  });

  test.describe('Page Layout', () => {
    test('should display doubt solving interface', async ({ page }) => {
      // Check for main page elements
      await expect(page.locator('text=AI Doubt Solver')).toBeVisible();
      await expect(page.locator('text=Ask me anything')).toBeVisible();
      
      // Check for chat interface
      await expect(page.locator('textarea[placeholder*="question"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check for sidebar
      const sidebar = page.locator('aside, [data-testid="chat-sidebar"]');
      await expect(sidebar).toBeVisible();
    });

    test('should display session management sidebar', async ({ page }) => {
      // Check for session list
      await expect(page.locator('text=Chat Sessions')).toBeVisible();
      
      // Check for new session button
      await expect(page.locator('text=New Session')).toBeVisible();
    });
  });

  test.describe('Chat Functionality', () => {
    test('should send and receive messages', async ({ page }) => {
      const question = 'What is the capital of France?';
      
      // Type a question
      await page.fill('textarea[placeholder*="question"]', question);
      
      // Send the message
      await page.click('button[type="submit"]');
      
      // Wait for AI response
      await page.waitForSelector('text=Paris', { timeout: 30000 });
      
      // Check if the response is displayed
      await expect(page.locator('text=Paris')).toBeVisible();
    });

    test('should handle empty messages', async ({ page }) => {
      // Try to send empty message
      await page.click('button[type="submit"]');
      
      // Should not send empty messages
      const messages = page.locator('[data-testid="message"], .message');
      const messageCount = await messages.count();
      expect(messageCount).toBe(0);
    });

    test('should display loading state while waiting for response', async ({ page }) => {
      const question = 'Explain quantum physics in simple terms';
      
      // Type a question
      await page.fill('textarea[placeholder*="question"]', question);
      
      // Send the message
      await page.click('button[type="submit"]');
      
      // Check for loading indicator
      await expect(page.locator('[data-testid="loading"], .loading')).toBeVisible();
      
      // Wait for response
      await page.waitForSelector('[data-testid="loading"], .loading', { state: 'hidden', timeout: 30000 });
    });

    test('should handle long questions', async ({ page }) => {
      const longQuestion = 'A'.repeat(1000);
      
      // Type a long question
      await page.fill('textarea[placeholder*="question"]', longQuestion);
      
      // Send the message
      await page.click('button[type="submit"]');
      
      // Should handle long questions without errors
      await page.waitForLoadState('networkidle');
      
      // Check if message was sent
      await expect(page.locator('text=A'.repeat(100))).toBeVisible();
    });

    test('should support markdown formatting in responses', async ({ page }) => {
      const question = 'Write a code example in JavaScript';
      
      // Type a question
      await page.fill('textarea[placeholder*="question"]', question);
      
      // Send the message
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForSelector('code, pre', { timeout: 30000 });
      
      // Check for code formatting
      await expect(page.locator('code, pre')).toBeVisible();
    });

    test('should support LaTeX rendering', async ({ page }) => {
      const question = 'What is the quadratic formula?';
      
      // Type a question
      await page.fill('textarea[placeholder*="question"]', question);
      
      // Send the message
      await page.click('button[type="submit"]');
      
      // Wait for response with LaTeX
      await page.waitForSelector('.katex, [data-latex]', { timeout: 30000 });
      
      // Check for LaTeX rendering
      await expect(page.locator('.katex, [data-latex]')).toBeVisible();
    });
  });

  test.describe('File Upload', () => {
    test('should upload and process files', async ({ page }) => {
      // Create a test file
      const testFile = {
        name: 'test-document.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('This is a test document for AI analysis.')
      };
      
      // Upload file
      await page.setInputFiles('input[type="file"]', {
        name: testFile.name,
        mimeType: testFile.mimeType,
        buffer: testFile.buffer
      });
      
      // Check if file is uploaded
      await expect(page.locator('text=test-document.txt')).toBeVisible();
      
      // Ask question about the file
      await page.fill('textarea[placeholder*="question"]', 'What is this document about?');
      await page.click('button[type="submit"]');
      
      // Wait for AI response about the file
      await page.waitForSelector('text=test document', { timeout: 30000 });
    });

    test('should handle image uploads', async ({ page }) => {
      // Create a test image
      const testImage = {
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-image-data')
      };
      
      // Upload image
      await page.setInputFiles('input[type="file"]', {
        name: testImage.name,
        mimeType: testImage.mimeType,
        buffer: testImage.buffer
      });
      
      // Check if image is uploaded
      await expect(page.locator('text=test-image.png')).toBeVisible();
      
      // Check for image preview
      await expect(page.locator('img[src*="test-image"]')).toBeVisible();
    });

    test('should handle file removal', async ({ page }) => {
      // Upload a file first
      const testFile = {
        name: 'test-file.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Test content')
      };
      
      await page.setInputFiles('input[type="file"]', {
        name: testFile.name,
        mimeType: testFile.mimeType,
        buffer: testFile.buffer
      });
      
      // Check if file is uploaded
      await expect(page.locator('text=test-file.txt')).toBeVisible();
      
      // Remove the file
      await page.click('[data-testid="remove-file"], .remove-file');
      
      // Check if file is removed
      await expect(page.locator('text=test-file.txt')).not.toBeVisible();
    });

    test('should validate file types', async ({ page }) => {
      // Try to upload an unsupported file type
      const unsupportedFile = {
        name: 'test.exe',
        mimeType: 'application/x-executable',
        buffer: Buffer.from('fake-executable')
      };
      
      await page.setInputFiles('input[type="file"]', {
        name: unsupportedFile.name,
        mimeType: unsupportedFile.mimeType,
        buffer: unsupportedFile.buffer
      });
      
      // Should show error for unsupported file type
      await expect(page.locator('text=Unsupported file type')).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should create new chat session', async ({ page }) => {
      // Click new session button
      await page.click('text=New Session');
      
      // Check if new session is created
      await expect(page.locator('[data-testid="session-item"]')).toBeVisible();
      
      // Check if session title is editable
      const sessionTitle = page.locator('[data-testid="session-title"], .session-title');
      await expect(sessionTitle).toBeVisible();
    });

    test('should switch between sessions', async ({ page }) => {
      // Create first session
      await page.click('text=New Session');
      await page.fill('textarea[placeholder*="question"]', 'First session question');
      await page.click('button[type="submit"]');
      
      // Create second session
      await page.click('text=New Session');
      await page.fill('textarea[placeholder*="question"]', 'Second session question');
      await page.click('button[type="submit"]');
      
      // Switch back to first session
      await page.click('[data-testid="session-item"]:first-child');
      
      // Check if first session content is displayed
      await expect(page.locator('text=First session question')).toBeVisible();
    });

    test('should delete chat session', async ({ page }) => {
      // Create a session
      await page.click('text=New Session');
      await page.fill('textarea[placeholder*="question"]', 'Test question');
      await page.click('button[type="submit"]');
      
      // Wait for session to be created
      await page.waitForSelector('[data-testid="session-item"]');
      
      // Delete the session
      await page.click('[data-testid="delete-session"], .delete-session');
      
      // Confirm deletion
      await page.click('text=Delete, text=Confirm');
      
      // Check if session is deleted
      await expect(page.locator('[data-testid="session-item"]')).not.toBeVisible();
    });

    test('should rename session', async ({ page }) => {
      // Create a session
      await page.click('text=New Session');
      
      // Click on session title to edit
      const sessionTitle = page.locator('[data-testid="session-title"], .session-title');
      await sessionTitle.click();
      
      // Edit the title
      await page.fill('[data-testid="session-title-input"], .session-title-input', 'My Custom Session');
      await page.keyboard.press('Enter');
      
      // Check if title is updated
      await expect(page.locator('text=My Custom Session')).toBeVisible();
    });
  });

  test.describe('Chat History', () => {
    test('should persist chat history', async ({ page }) => {
      // Create a session and send a message
      await page.click('text=New Session');
      await page.fill('textarea[placeholder*="question"]', 'Persistent question');
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForLoadState('networkidle');
      
      // Refresh the page
      await page.reload();
      
      // Check if chat history is preserved
      await expect(page.locator('text=Persistent question')).toBeVisible();
    });

    test('should display message timestamps', async ({ page }) => {
      // Send a message
      await page.fill('textarea[placeholder*="question"]', 'Timestamp test');
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForLoadState('networkidle');
      
      // Check for timestamp
      const timestamp = page.locator('[data-testid="message-timestamp"], .message-timestamp');
      await expect(timestamp).toBeVisible();
    });
  });

  test.describe('AI Features', () => {
    test('should provide contextual responses', async ({ page }) => {
      // Send first message
      await page.fill('textarea[placeholder*="question"]', 'What is 2+2?');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      // Send follow-up question
      await page.fill('textarea[placeholder*="question"]', 'What about 2+3?');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      // Check if AI provides contextual response
      await expect(page.locator('text=5')).toBeVisible();
    });

    test('should handle mathematical questions', async ({ page }) => {
      await page.fill('textarea[placeholder*="question"]', 'Solve: 15 * 23');
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForLoadState('networkidle');
      
      // Check for mathematical answer
      await expect(page.locator('text=345')).toBeVisible();
    });

    test('should handle code-related questions', async ({ page }) => {
      await page.fill('textarea[placeholder*="question"]', 'Write a function to calculate factorial');
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForLoadState('networkidle');
      
      // Check for code block
      await expect(page.locator('code, pre')).toBeVisible();
    });

    test('should provide explanations', async ({ page }) => {
      await page.fill('textarea[placeholder*="question"]', 'Explain photosynthesis');
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForLoadState('networkidle');
      
      // Check for detailed explanation
      await expect(page.locator('text=photosynthesis')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network error
      await page.route('**/api/doubt-solving/**', route => {
        route.abort('failed');
      });
      
      // Send a message
      await page.fill('textarea[placeholder*="question"]', 'Test question');
      await page.click('button[type="submit"]');
      
      // Check for error message
      await expect(page.locator('text=Error, text=Failed')).toBeVisible();
    });

    test('should handle AI service errors', async ({ page }) => {
      // Mock AI service error
      await page.route('**/api/doubt-solving/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'AI service unavailable' })
        });
      });
      
      // Send a message
      await page.fill('textarea[placeholder*="question"]', 'Test question');
      await page.click('button[type="submit"]');
      
      // Check for error message
      await expect(page.locator('text=AI service unavailable')).toBeVisible();
    });

    test('should retry failed requests', async ({ page }) => {
      // Mock initial failure then success
      let requestCount = 0;
      await page.route('**/api/doubt-solving/**', route => {
        requestCount++;
        if (requestCount === 1) {
          route.abort('failed');
        } else {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ response: 'Success response' })
          });
        }
      });
      
      // Send a message
      await page.fill('textarea[placeholder*="question"]', 'Test question');
      await page.click('button[type="submit"]');
      
      // Click retry button
      await page.click('[data-testid="retry-button"], .retry-button');
      
      // Check for success response
      await expect(page.locator('text=Success response')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Navigate to textarea
      await page.keyboard.press('Tab');
      
      // Type question
      await page.keyboard.type('Keyboard navigation test');
      
      // Submit with Enter
      await page.keyboard.press('Enter');
      
      // Wait for response
      await page.waitForLoadState('networkidle');
      
      // Check if message was sent
      await expect(page.locator('text=Keyboard navigation test')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check for ARIA labels on interactive elements
      const textarea = page.locator('textarea[placeholder*="question"]');
      await expect(textarea).toHaveAttribute('aria-label');
      
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toHaveAttribute('aria-label');
    });

    test('should support screen readers', async ({ page }) => {
      // Check for screen reader friendly elements
      await expect(page.locator('[role="main"]')).toBeVisible();
      await expect(page.locator('[role="complementary"]')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/tools/doubt-solving');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should handle multiple rapid messages', async ({ page }) => {
      // Send multiple messages quickly
      for (let i = 0; i < 3; i++) {
        await page.fill('textarea[placeholder*="question"]', `Quick message ${i + 1}`);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(100); // Small delay
      }
      
      // Check if all messages are displayed
      await expect(page.locator('text=Quick message 1')).toBeVisible();
      await expect(page.locator('text=Quick message 2')).toBeVisible();
      await expect(page.locator('text=Quick message 3')).toBeVisible();
    });
  });
}); 