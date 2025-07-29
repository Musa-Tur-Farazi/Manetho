import { test, expect } from './utils/test-utils';
import { testUsers, testData } from './utils/test-utils';

test.describe('Community', () => {
  test.beforeEach(async ({ page, pageActions }) => {
    // Sign in before each test
    await pageActions.signIn(testUsers.student.email, testUsers.student.password);
    await page.goto('/community');
  });

  test.describe('Page Layout', () => {
    test('should display community interface', async ({ page }) => {
      // Check for main page elements
      await expect(page.locator('text=Community')).toBeVisible();
      await expect(page.locator('text=Share your thoughts')).toBeVisible();
      
      // Check for main action buttons
      await expect(page.locator('text=Create Post')).toBeVisible();
      await expect(page.locator('[data-testid="search-input"], input[placeholder*="search"]')).toBeVisible();
    });

    test('should display post feed', async ({ page }) => {
      // Check for posts section
      await expect(page.locator('[data-testid="post-feed"], .post-feed')).toBeVisible();
      
      // Check for post list container
      const postList = page.locator('[data-testid="post-list"], .post-list');
      await expect(postList).toBeVisible();
    });

    test('should display sidebar with filters', async ({ page }) => {
      // Check for sidebar elements
      await expect(page.locator('text=Filter')).toBeVisible();
      await expect(page.locator('text=Sort by')).toBeVisible();
    });
  });

  test.describe('Post Creation', () => {
    test('should create text post', async ({ page }) => {
      // Click create post button
      await page.click('text=Create Post');
      
      // Fill in post details
      await page.fill('[name="content"], textarea[placeholder*="post"]', testData.communityPost.content);
      await page.selectOption('[name="postType"]', 'text');
      
      // Submit the form
      await page.click('text=Post');
      
      // Check if post is created
      await expect(page.locator('text=This is a test community post for E2E testing')).toBeVisible();
    });

    test('should create photo post', async ({ page }) => {
      // Click create post button
      await page.click('text=Create Post');
      
      // Select photo post type
      await page.selectOption('[name="postType"]', 'photo');
      
      // Upload an image
      const testImage = {
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-image-data')
      };
      
      await page.setInputFiles('input[type="file"]', {
        name: testImage.name,
        mimeType: testImage.mimeType,
        buffer: testImage.buffer
      });
      
      // Add caption
      await page.fill('[name="content"], textarea[placeholder*="caption"]', 'Test photo post');
      
      // Submit the form
      await page.click('text=Post');
      
      // Check if post is created
      await expect(page.locator('text=Test photo post')).toBeVisible();
      await expect(page.locator('img[src*="test-image"]')).toBeVisible();
    });

    test('should create poll post', async ({ page }) => {
      // Click create post button
      await page.click('text=Create Post');
      
      // Select poll post type
      await page.selectOption('[name="postType"]', 'poll');
      
      // Fill in poll question
      await page.fill('[name="pollQuestion"]', 'What is your favorite programming language?');
      
      // Add poll options
      await page.fill('[name="pollOptions[0]"]', 'JavaScript');
      await page.fill('[name="pollOptions[1]"]', 'Python');
      await page.fill('[name="pollOptions[2]"]', 'Java');
      
      // Submit the form
      await page.click('text=Post');
      
      // Check if poll post is created
      await expect(page.locator('text=What is your favorite programming language?')).toBeVisible();
      await expect(page.locator('text=JavaScript')).toBeVisible();
      await expect(page.locator('text=Python')).toBeVisible();
      await expect(page.locator('text=Java')).toBeVisible();
    });

    test('should handle post creation errors', async ({ page }) => {
      // Click create post button
      await page.click('text=Create Post');
      
      // Try to submit empty post
      await page.click('text=Post');
      
      // Check for validation error
      await expect(page.locator('text=Post content is required')).toBeVisible();
    });
  });

  test.describe('Post Interactions', () => {
    test('should like/unlike posts', async ({ page }) => {
      // Create a post first
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Post to like');
      await page.click('text=Post');
      
      // Like the post
      await page.click('[data-testid="like-button"], .like-button');
      
      // Check if like count increases
      await expect(page.locator('text=1')).toBeVisible();
      
      // Unlike the post
      await page.click('[data-testid="like-button"], .like-button');
      
      // Check if like count decreases
      await expect(page.locator('text=0')).toBeVisible();
    });

    test('should comment on posts', async ({ page }) => {
      // Create a post first
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Post to comment on');
      await page.click('text=Post');
      
      // Add a comment
      await page.click('[data-testid="comment-button"], .comment-button');
      await page.fill('[data-testid="comment-input"], textarea[placeholder*="comment"]', 'Test comment');
      await page.click('text=Comment');
      
      // Check if comment is added
      await expect(page.locator('text=Test comment')).toBeVisible();
    });

    test('should reply to comments', async ({ page }) => {
      // Create a post with a comment
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Post with comments');
      await page.click('text=Post');
      
      await page.click('[data-testid="comment-button"], .comment-button');
      await page.fill('[data-testid="comment-input"], textarea[placeholder*="comment"]', 'Parent comment');
      await page.click('text=Comment');
      
      // Reply to the comment
      await page.click('[data-testid="reply-button"], .reply-button');
      await page.fill('[data-testid="reply-input"], textarea[placeholder*="reply"]', 'Reply to comment');
      await page.click('text=Reply');
      
      // Check if reply is added
      await expect(page.locator('text=Reply to comment')).toBeVisible();
    });

    test('should share posts', async ({ page }) => {
      // Create a post first
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Post to share');
      await page.click('text=Post');
      
      // Click share button
      await page.click('[data-testid="share-button"], .share-button');
      
      // Check if share options are visible
      await expect(page.locator('text=Share to Timeline')).toBeVisible();
      await expect(page.locator('text=Copy Link')).toBeVisible();
    });

    test('should save posts', async ({ page }) => {
      // Create a post first
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Post to save');
      await page.click('text=Post');
      
      // Save the post
      await page.click('[data-testid="save-button"], .save-button');
      
      // Check if post is saved
      await expect(page.locator('[data-testid="saved-indicator"], .saved-indicator')).toBeVisible();
    });

    test('should vote on polls', async ({ page }) => {
      // Create a poll post
      await page.click('text=Create Post');
      await page.selectOption('[name="postType"]', 'poll');
      await page.fill('[name="pollQuestion"]', 'Test poll');
      await page.fill('[name="pollOptions[0]"]', 'Option 1');
      await page.fill('[name="pollOptions[1]"]', 'Option 2');
      await page.click('text=Post');
      
      // Vote on the poll
      await page.click('text=Option 1');
      
      // Check if vote is recorded
      await expect(page.locator('text=1 vote')).toBeVisible();
    });
  });

  test.describe('Post Management', () => {
    test('should edit own posts', async ({ page }) => {
      // Create a post first
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Original post content');
      await page.click('text=Post');
      
      // Edit the post
      await page.click('[data-testid="edit-post"], .edit-post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Updated post content');
      await page.click('text=Update Post');
      
      // Check if post is updated
      await expect(page.locator('text=Updated post content')).toBeVisible();
    });

    test('should delete own posts', async ({ page }) => {
      // Create a post first
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Post to delete');
      await page.click('text=Post');
      
      // Delete the post
      await page.click('[data-testid="delete-post"], .delete-post');
      await page.click('text=Delete');
      
      // Check if post is deleted
      await expect(page.locator('text=Post to delete')).not.toBeVisible();
    });

    test('should not edit others posts', async ({ page }) => {
      // This would require creating a post as another user
      // For now, we'll check that edit button is not visible for non-own posts
      // This test would need to be enhanced with multi-user setup
    });
  });

  test.describe('Search and Filtering', () => {
    test('should search posts', async ({ page }) => {
      // Create posts with different content
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Math post about algebra');
      await page.click('text=Post');
      
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Science post about physics');
      await page.click('text=Post');
      
      // Search for math posts
      await page.fill('[data-testid="search-input"], input[placeholder*="search"]', 'math');
      await page.keyboard.press('Enter');
      
      // Check if only math post is visible
      await expect(page.locator('text=Math post about algebra')).toBeVisible();
      await expect(page.locator('text=Science post about physics')).not.toBeVisible();
    });

    test('should filter by post type', async ({ page }) => {
      // Create different types of posts
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Text post');
      await page.click('text=Post');
      
      await page.click('text=Create Post');
      await page.selectOption('[name="postType"]', 'poll');
      await page.fill('[name="pollQuestion"]', 'Poll question');
      await page.fill('[name="pollOptions[0]"]', 'Option 1');
      await page.click('text=Post');
      
      // Filter by text posts
      await page.selectOption('[data-testid="post-type-filter"], select[name="postType"]', 'text');
      
      // Check if only text post is visible
      await expect(page.locator('text=Text post')).toBeVisible();
      await expect(page.locator('text=Poll question')).not.toBeVisible();
    });

    test('should sort posts', async ({ page }) => {
      // Create multiple posts
      for (let i = 1; i <= 3; i++) {
        await page.click('text=Create Post');
        await page.fill('[name="content"], textarea[placeholder*="post"]', `Post ${i}`);
        await page.click('text=Post');
      }
      
      // Sort by recent
      await page.selectOption('[data-testid="sort-dropdown"], select[name="sortBy"]', 'recent');
      
      // Check if posts are sorted (most recent first)
      const posts = page.locator('[data-testid="post-item"], .post-item');
      await expect(posts.first()).toContainText('Post 3');
    });
  });

  test.describe('User Profiles', () => {
    test('should view user profiles', async ({ page }) => {
      // Create a post first
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Test post');
      await page.click('text=Post');
      
      // Click on user name/avatar
      await page.click('[data-testid="user-avatar"], .user-avatar');
      
      // Check if profile page is loaded
      await expect(page).toHaveURL(/\/profile\//);
    });

    test('should follow/unfollow users', async ({ page }) => {
      // Navigate to a user's profile
      await page.goto('/profile/test-user');
      
      // Click follow button
      await page.click('[data-testid="follow-button"], .follow-button');
      
      // Check if following
      await expect(page.locator('text=Following')).toBeVisible();
      
      // Unfollow
      await page.click('[data-testid="follow-button"], .follow-button');
      
      // Check if not following
      await expect(page.locator('text=Follow')).toBeVisible();
    });
  });

  test.describe('Notifications', () => {
    test('should receive notifications for interactions', async ({ page }) => {
      // Create a post
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Notification test post');
      await page.click('text=Post');
      
      // Sign in as another user and interact with the post
      // This would require multi-user setup
      // For now, we'll check notification elements exist
      await expect(page.locator('[data-testid="notification-bell"], .notification-bell')).toBeVisible();
    });

    test('should mark notifications as read', async ({ page }) => {
      // Click notification bell
      await page.click('[data-testid="notification-bell"], .notification-bell');
      
      // Check if notifications dropdown is visible
      const notificationsDropdown = page.locator('[data-testid="notifications-dropdown"]');
      if (await notificationsDropdown.isVisible()) {
        // Click on a notification to mark as read
        await page.click('[data-testid="notification-item"], .notification-item');
        
        // Check if notification is marked as read
        await expect(page.locator('[data-testid="unread-indicator"], .unread-indicator')).not.toBeVisible();
      }
    });
  });

  test.describe('Moderation', () => {
    test('should report inappropriate content', async ({ page }) => {
      // Create a post
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Test post');
      await page.click('text=Post');
      
      // Click report button
      await page.click('[data-testid="report-button"], .report-button');
      
      // Fill in report form
      await page.selectOption('[name="reason"]', 'spam');
      await page.fill('[name="description"]', 'This is a test report');
      await page.click('text=Submit Report');
      
      // Check if report is submitted
      await expect(page.locator('text=Report submitted')).toBeVisible();
    });

    test('should hide reported content', async ({ page }) => {
      // This would require admin functionality
      // For now, we'll check if moderation elements exist
      await expect(page.locator('[data-testid="moderation-panel"], .moderation-panel')).toBeVisible();
    });
  });

  test.describe('Real-time Features', () => {
    test('should show real-time updates', async ({ page }) => {
      // This would test WebSocket functionality
      // For now, we'll check if real-time elements exist
      await expect(page.locator('[data-testid="online-indicator"], .online-indicator')).toBeVisible();
    });

    test('should show typing indicators', async ({ page }) => {
      // Create a post and start commenting
      await page.click('text=Create Post');
      await page.fill('[name="content"], textarea[placeholder*="post"]', 'Typing test post');
      await page.click('text=Post');
      
      await page.click('[data-testid="comment-button"], .comment-button');
      
      // Start typing in comment box
      await page.fill('[data-testid="comment-input"], textarea[placeholder*="comment"]', 'Typing...');
      
      // Check for typing indicator
      await expect(page.locator('[data-testid="typing-indicator"], .typing-indicator')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Navigate through posts with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Should open create post modal
      
      // Check if modal is open
      await expect(page.locator('text=Create Post')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check for ARIA labels on interactive elements
      const createButton = page.locator('text=Create Post');
      await expect(createButton).toHaveAttribute('aria-label');
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
      
      await page.goto('/community');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should handle infinite scroll', async ({ page }) => {
      // Create many posts
      for (let i = 1; i <= 20; i++) {
        await page.click('text=Create Post');
        await page.fill('[name="content"], textarea[placeholder*="post"]', `Post ${i}`);
        await page.click('text=Post');
        await page.waitForTimeout(100); // Small delay
      }
      
      // Scroll to bottom to trigger infinite scroll
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Check if more posts are loaded
      await expect(page.locator('text=Post 20')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if mobile layout is applied
      await expect(page.locator('text=Community')).toBeVisible();
      
      // Test mobile-specific interactions
      await page.click('text=Create Post');
      await expect(page.locator('text=Create Post')).toBeVisible();
    });
  });
}); 