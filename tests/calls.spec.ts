import { test, expect } from '@playwright/test';
import { testUsers, selectors, testData, PageActions } from './utils/test-utils';

test.describe('Calls and Group Study', () => {
  let pageActions: PageActions;

  test.beforeEach(async ({ page }) => {
    pageActions = new PageActions(page);
    await pageActions.navigateTo('/group-study');
  });

  test.describe('Group Study Page Layout', () => {
    test('should display group study page correctly', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Study Groups');
      await expect(page.locator('text=Collaborate with peers and join study sessions')).toBeVisible();
      
      // Check for main navigation tabs
      await expect(page.locator('text=My Groups')).toBeVisible();
      await expect(page.locator('text=Explore Groups')).toBeVisible();
      await expect(page.locator('text=Create Group')).toBeVisible();
      await expect(page.locator('text=Invite Friend')).toBeVisible();
    });

    test('should show loading state initially', async ({ page }) => {
      // Navigate to a fresh page to see loading state
      await page.goto('/group-study');
      await expect(page.locator('.animate-spin')).toBeVisible();
    });

    test('should display empty state when no groups exist', async ({ page }) => {
      // This test assumes user has no groups initially
      await expect(page.locator('text=No Study Groups Yet')).toBeVisible();
      await expect(page.locator('text=Create your first study group')).toBeVisible();
    });
  });

  test.describe('Group Creation', () => {
    test('should open create group form', async ({ page }) => {
      await page.click('text=Create Group');
      await expect(page.locator('text=Create New Study Group')).toBeVisible();
      
      // Check form fields
      await expect(page.locator('input[placeholder="Enter group name"]')).toBeVisible();
      await expect(page.locator('textarea[placeholder="Describe your study group"]')).toBeVisible();
      await expect(page.locator('select')).toBeVisible(); // Meeting type
      await expect(page.locator('input[type="number"]')).toBeVisible(); // Max participants
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('text=Create Group');
      await page.click('text=Create Group'); // Submit without filling
      
      // Should show validation error
      await expect(page.locator('text=Please fill in all required fields')).toBeVisible();
    });

    test('should create a new study group', async ({ page }) => {
      await page.click('text=Create Group');
      
      // Fill form
      await page.fill('input[placeholder="Enter group name"]', testData.groupStudy.groupName);
      await page.fill('textarea[placeholder="Describe your study group"]', testData.groupStudy.description);
      await page.selectOption('select', 'online');
      await page.fill('input[type="number"]', '10');
      
      await page.click('text=Create Group');
      
      // Should redirect to group chat
      await expect(page).toHaveURL(/\/group-study\/chat\//);
    });

    test('should validate participant limits', async ({ page }) => {
      await page.click('text=Create Group');
      
      // Try invalid values
      await page.fill('input[type="number"]', '1'); // Too low
      await page.click('text=Create Group');
      await expect(page.locator('text=Max participants must be between 2 and 100')).toBeVisible();
      
      await page.fill('input[type="number"]', '101'); // Too high
      await page.click('text=Create Group');
      await expect(page.locator('text=Max participants must be between 2 and 100')).toBeVisible();
    });
  });

  test.describe('Group Management', () => {
    test('should display group cards with correct information', async ({ page }) => {
      // Assuming groups exist
      await expect(page.locator('.card')).toBeVisible();
      
      // Check for group information
      await expect(page.locator('text=Members')).toBeVisible();
      await expect(page.locator('text=Open Chat')).toBeVisible();
    });

    test('should join existing groups', async ({ page }) => {
      await page.click('text=Explore Groups');
      
      // Look for join buttons
      const joinButton = page.locator('text=Join Group').first();
      if (await joinButton.isVisible()) {
        await joinButton.click();
        // Should redirect to group chat
        await expect(page).toHaveURL(/\/group-study\/chat\//);
      }
    });

    test('should leave groups', async ({ page }) => {
      // Navigate to a group the user is member of
      const leaveButton = page.locator('text=Leave').first();
      if (await leaveButton.isVisible()) {
        await leaveButton.click();
        
        // Should show confirmation modal
        await expect(page.locator('text=Leave Group')).toBeVisible();
        await expect(page.locator('text=Are you sure')).toBeVisible();
        
        await page.click('text=Leave Group');
        // Should be removed from group
      }
    });

    test('should delete groups (as organizer)', async ({ page }) => {
      // Look for delete button (only visible to organizers)
      const deleteButton = page.locator('[data-testid="delete-group"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Should show confirmation modal
        await expect(page.locator('text=Delete Group')).toBeVisible();
        await expect(page.locator('text=This action cannot be undone')).toBeVisible();
        
        await page.click('text=Delete Group');
      }
    });
  });

  test.describe('Group Chat Interface', () => {
    test('should navigate to group chat', async ({ page }) => {
      // Navigate to a specific group chat
      await page.goto('/group-study/chat/test-group-id');
      
      // Check chat interface elements
      await expect(page.locator('text=Members')).toBeVisible();
      await expect(page.locator('input[placeholder*="message"]')).toBeVisible();
      await expect(page.locator('button[title="Upload file"]')).toBeVisible();
    });

    test('should display group information in chat header', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Check header information
      await expect(page.locator('h1')).toBeVisible(); // Group name
      await expect(page.locator('text=members')).toBeVisible();
    });

    test('should show members sidebar', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Check members section
      await expect(page.locator('text=Members')).toBeVisible();
      // Should show member avatars and names
      await expect(page.locator('img[alt*="profile"]')).toBeVisible();
    });

    test('should send text messages', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      const messageInput = page.locator('input[placeholder*="message"]');
      await messageInput.fill('Hello, this is a test message');
      await page.click('button[type="submit"]');
      
      // Message should appear in chat
      await expect(page.locator('text=Hello, this is a test message')).toBeVisible();
    });

    test('should upload and send files', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Click upload button
      await page.click('button[title="Upload file"]');
      
      // Upload a test file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testData.files.sampleImage);
      
      // File should be previewed
      await expect(page.locator('text=sample-image.jpg')).toBeVisible();
      
      // Send the file
      await page.click('button[type="submit"]');
      
      // File should appear in chat
      await expect(page.locator('text=sample-image.jpg')).toBeVisible();
    });

    test('should handle file download', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Look for file messages with download buttons
      const downloadButton = page.locator('[title="Download file"]').first();
      if (await downloadButton.isVisible()) {
        await downloadButton.click();
        // Should trigger download
      }
    });
  });

  test.describe('Video Meeting Integration', () => {
    test('should display meeting links section', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Check for meeting links section
      await expect(page.locator('text=Meeting Links')).toBeVisible();
      await expect(page.locator('text=Google Meet')).toBeVisible();
    });

    test('should create new Google Meet link', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Click on meeting options
      await page.click('button[title="Manage meeting links"]');
      
      // Click create Google Meet
      await page.click('text=Start Google Meet');
      
      // Should open Google Meet in new tab
      const newPage = await page.waitForEvent('popup');
      await expect(newPage).toHaveURL(/meet\.google\.com/);
    });

    test('should add existing meeting link', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      await page.click('button[title="Manage meeting links"]');
      
      // Add existing link
      await page.fill('input[placeholder*="meet.google.com"]', 'https://meet.google.com/test-link');
      await page.click('text=Add');
      
      // Link should be added to the list
      await expect(page.locator('text=test-link')).toBeVisible();
    });

    test('should copy meeting links', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Look for copy button
      const copyButton = page.locator('[title="Copy link"]').first();
      if (await copyButton.isVisible()) {
        await copyButton.click();
        
        // Should show copied feedback
        await expect(page.locator('.text-green-500')).toBeVisible();
      }
    });

    test('should join meeting links', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Look for join button
      const joinButton = page.locator('text=Join').first();
      if (await joinButton.isVisible()) {
        await joinButton.click();
        
        // Should open meeting in new tab
        const newPage = await page.waitForEvent('popup');
        await expect(newPage).toHaveURL(/meet\.google\.com/);
      }
    });

    test('should delete meeting links (as organizer)', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      await page.click('button[title="Manage meeting links"]');
      
      // Look for delete button
      const deleteButton = page.locator('[title="Delete link"]').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Link should be removed
        await expect(page.locator('text=No meeting links yet')).toBeVisible();
      }
    });
  });

  test.describe('Real-time Features', () => {
    test('should show online status indicators', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Check for online indicators
      await expect(page.locator('.bg-green-500')).toBeVisible();
    });

    test('should display typing indicators', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Start typing
      await page.fill('input[placeholder*="message"]', 'typing...');
      
      // Should show typing indicator (if implemented)
      // This depends on the specific implementation
    });

    test('should show real-time message updates', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Send a message
      await page.fill('input[placeholder*="message"]', 'Real-time test');
      await page.click('button[type="submit"]');
      
      // Message should appear immediately
      await expect(page.locator('text=Real-time test')).toBeVisible();
    });
  });

  test.describe('Member Management', () => {
    test('should invite friends to groups', async ({ page }) => {
      await page.click('text=Invite Friend');
      
      // Check invite modal
      await expect(page.locator('text=Invite Friend to Study Group')).toBeVisible();
      await expect(page.locator('select')).toBeVisible(); // Friend selection
      await expect(page.locator('textarea')).toBeVisible(); // Message
      
      // Fill invite form
      await page.selectOption('select', 'test-friend-id');
      await page.fill('textarea', 'Join our study group!');
      await page.click('text=Send Invitation');
      
      // Should show success message
      await expect(page.locator('text=Invitation sent successfully')).toBeVisible();
    });

    test('should display member roles correctly', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Check for role indicators
      await expect(page.locator('text=Organizer')).toBeVisible();
      await expect(page.locator('text=Member')).toBeVisible();
    });

    test('should show member profiles on click', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Click on member avatar
      await page.click('img[alt*="profile"]').first();
      
      // Should navigate to profile page
      await expect(page).toHaveURL(/\/profile\//);
    });
  });

  test.describe('Search and Filtering', () => {
    test('should search groups', async ({ page }) => {
      await page.click('text=Explore Groups');
      
      // Use search functionality
      await page.fill('input[placeholder="Search groups..."]', 'math');
      
      // Should filter results
      await expect(page.locator('text=math')).toBeVisible();
    });

    test('should filter by meeting type', async ({ page }) => {
      await page.click('text=Explore Groups');
      
      // Check for meeting type indicators
      await expect(page.locator('text=Online')).toBeVisible();
      await expect(page.locator('text=In-person')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline state
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('/group-study');
      
      // Should show error state
      await expect(page.locator('text=Error')).toBeVisible();
    });

    test('should handle invalid group access', async ({ page }) => {
      await page.goto('/group-study/chat/invalid-group-id');
      
      // Should show error or redirect
      await expect(page.locator('text=Group Not Found')).toBeVisible();
    });

    test('should handle file upload errors', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Try to upload invalid file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testData.files.invalidFile);
      
      // Should show error message
      await expect(page.locator('text=not supported')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/group-study');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/group-study');
      
      // Check for ARIA labels
      await expect(page.locator('[aria-label]')).toBeVisible();
      await expect(page.locator('[role]')).toBeVisible();
    });

    test('should support screen readers', async ({ page }) => {
      await page.goto('/group-study');
      
      // Check for screen reader friendly elements
      await expect(page.locator('[aria-describedby]')).toBeVisible();
      await expect(page.locator('[aria-live]')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/group-study');
      
      // Check mobile layout
      await expect(page.locator('text=Study Groups')).toBeVisible();
      
      // Test mobile navigation
      await page.click('text=Create Group');
      await expect(page.locator('text=Create New Study Group')).toBeVisible();
    });

    test('should handle mobile chat interface', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/group-study/chat/test-group-id');
      
      // Check mobile chat layout
      await expect(page.locator('input[placeholder*="message"]')).toBeVisible();
      
      // Test mobile file upload
      await page.click('button[title="Upload file"]');
      await expect(page.locator('text=Upload File')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load groups quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/group-study');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should handle large message history', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Scroll through messages
      await page.evaluate(() => {
        const container = document.querySelector('.messages-container');
        if (container) container.scrollTop = container.scrollHeight;
      });
      
      // Should not crash or freeze
      await expect(page.locator('input[placeholder*="message"]')).toBeVisible();
    });

    test('should handle multiple file uploads', async ({ page }) => {
      await page.goto('/group-study/chat/test-group-id');
      
      // Upload multiple files
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles([
        testData.files.sampleImage,
        testData.files.sampleDocument
      ]);
      
      // Should handle multiple files gracefully
      await expect(page.locator('text=sample-image.jpg')).toBeVisible();
      await expect(page.locator('text=sample-document.pdf')).toBeVisible();
    });
  });
}); 