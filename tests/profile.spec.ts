import { test, expect } from '@playwright/test';
import { testUsers, selectors, testData, PageActions } from './utils/test-utils';

test.describe('Profile Features', () => {
  let pageActions: PageActions;

  test.beforeEach(async ({ page }) => {
    pageActions = new PageActions(page);
  });

  test.describe('Profile Page Layout', () => {
    test('should display profile page correctly', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check main profile elements
      await expect(page.locator('h1')).toContainText('Learning Partner Profile');
      await expect(page.locator('img[alt*="profile"]')).toBeVisible();
      await expect(page.locator('h2')).toBeVisible(); // User name
      
      // Check navigation
      await expect(page.locator('text=Back')).toBeVisible();
      await expect(page.locator('text=Manetho')).toBeVisible();
    });

    test('should show loading state initially', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Should show loading spinner
      await expect(page.locator('.animate-pulse')).toBeVisible();
    });

    test('should handle non-existent profiles', async ({ page }) => {
      await page.goto('/profile/non-existent-user');
      
      // Should show error state
      await expect(page.locator('text=User not found')).toBeVisible();
      await expect(page.locator('text=The profile you\'re looking for doesn\'t exist')).toBeVisible();
      await expect(page.locator('text=Go Back')).toBeVisible();
    });
  });

  test.describe('Profile Information Display', () => {
    test('should display user basic information', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check user details
      await expect(page.locator('h2')).toBeVisible(); // Full name
      await expect(page.locator('text=Active now')).toBeVisible(); // Online status
      await expect(page.locator('text=📍')).toBeVisible(); // Location
    });

    test('should display educational information', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check education details
      await expect(page.locator('text=Grade')).toBeVisible();
      await expect(page.locator('text=School')).toBeVisible();
    });

    test('should display user bio', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check bio section
      await expect(page.locator('text=About')).toBeVisible();
      await expect(page.locator('text=Joined Manetho')).toBeVisible();
    });

    test('should display last active time', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check last active information
      await expect(page.locator('text=Last Active')).toBeVisible();
      await expect(page.locator('text=Active')).toBeVisible();
    });
  });

  test.describe('Profile Statistics', () => {
    test('should display user statistics', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check stats grid
      await expect(page.locator('text=Learning Partners')).toBeVisible();
      await expect(page.locator('text=Following')).toBeVisible();
      await expect(page.locator('text=Groups Joined')).toBeVisible();
      await expect(page.locator('text=Flashcard Decks')).toBeVisible();
      await expect(page.locator('text=Mind Maps')).toBeVisible();
    });

    test('should show correct stat numbers', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check that stats are numeric
      const statElements = page.locator('.text-2xl.font-bold');
      await expect(statElements).toHaveCount(5); // 5 stat cards
      
      // Verify they contain numbers
      for (let i = 0; i < 5; i++) {
        const text = await statElements.nth(i).textContent();
        expect(parseInt(text || '0')).toBeGreaterThanOrEqual(0);
      }
    });

    test('should display stat icons correctly', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check for stat icons
      await expect(page.locator('.text-blue-400')).toBeVisible(); // Learning Partners icon
      await expect(page.locator('.text-green-400')).toBeVisible(); // Following icon
      await expect(page.locator('.text-orange-400')).toBeVisible(); // Groups icon
      await expect(page.locator('.text-cyan-400')).toBeVisible(); // Flashcards icon
      await expect(page.locator('.text-pink-400')).toBeVisible(); // Mind Maps icon
    });
  });

  test.describe('Profile Actions', () => {
    test('should show follow/unfollow button for other users', async ({ page }) => {
      await page.goto('/profile/other-user-id');
      
      // Check for follow button
      await expect(page.locator('text=Add Learning Partner')).toBeVisible();
      await expect(page.locator('text=Message')).toBeVisible();
    });

    test('should handle follow action', async ({ page }) => {
      await page.goto('/profile/other-user-id');
      
      // Click follow button
      await page.click('text=Add Learning Partner');
      
      // Should change to unfollow
      await expect(page.locator('text=Unfollow')).toBeVisible();
      
      // Check that follower count increased
      const followerCount = page.locator('text=Learning Partners').locator('..').locator('.text-2xl');
      const count = await followerCount.textContent();
      expect(parseInt(count || '0')).toBeGreaterThan(0);
    });

    test('should handle unfollow action', async ({ page }) => {
      await page.goto('/profile/other-user-id');
      
      // First follow, then unfollow
      await page.click('text=Add Learning Partner');
      await page.click('text=Unfollow');
      
      // Should change back to follow
      await expect(page.locator('text=Add Learning Partner')).toBeVisible();
    });

    test('should navigate to messaging', async ({ page }) => {
      await page.goto('/profile/other-user-id');
      
      // Click message button
      await page.click('text=Message');
      
      // Should navigate to chat
      await expect(page).toHaveURL(/\/chat/);
    });

    test('should not show follow button for own profile', async ({ page }) => {
      await page.goto('/profile/current-user-id');
      
      // Should not show follow/unfollow buttons
      await expect(page.locator('text=Add Learning Partner')).not.toBeVisible();
      await expect(page.locator('text=Message')).not.toBeVisible();
    });
  });

  test.describe('Profile Posts Section', () => {
    test('should display posts and shared tabs', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check tab navigation
      await expect(page.locator('text=Posts')).toBeVisible();
      await expect(page.locator('text=Shared')).toBeVisible();
    });

    test('should show posts count in tabs', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check that tabs show counts
      await expect(page.locator('text=Posts (')).toBeVisible();
      await expect(page.locator('text=Shared (')).toBeVisible();
    });

    test('should switch between posts and shared tabs', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Click on Shared tab
      await page.click('text=Shared');
      
      // Should show shared posts
      await expect(page.locator('text=Shared').locator('..')).toHaveClass(/bg-blue-500/);
    });

    test('should display user posts correctly', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check post elements
      await expect(page.locator('.card')).toBeVisible();
      await expect(page.locator('img[alt*="profile"]')).toBeVisible(); // Author avatar
      await expect(page.locator('h3')).toBeVisible(); // Post title
    });

    test('should show post interactions', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check interaction buttons
      await expect(page.locator('text=❤')).toBeVisible(); // Like button
      await expect(page.locator('text=💬')).toBeVisible(); // Comment button
      await expect(page.locator('text=📤')).toBeVisible(); // Share button
      await expect(page.locator('text=🔖')).toBeVisible(); // Bookmark button
    });

    test('should handle post interactions', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Like a post
      const likeButton = page.locator('text=❤').first();
      await likeButton.click();
      
      // Should show liked state
      await expect(likeButton).toHaveClass(/bg-red-500/);
    });

    test('should show empty state when no posts', async ({ page }) => {
      await page.goto('/profile/user-with-no-posts');
      
      // Should show empty state
      await expect(page.locator('text=No posts yet')).toBeVisible();
      await expect(page.locator('text=This user hasn\'t created any posts yet')).toBeVisible();
    });

    test('should display shared posts correctly', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Switch to shared tab
      await page.click('text=Shared');
      
      // Check for shared indicator
      await expect(page.locator('text=Shared')).toBeVisible();
    });
  });

  test.describe('Post Content Display', () => {
    test('should display post images correctly', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Look for post with images
      const imagePost = page.locator('img[src*="post"]').first();
      if (await imagePost.isVisible()) {
        await expect(imagePost).toBeVisible();
        
        // Click image to view full size
        await imagePost.click();
        // Should open in new tab or modal
      }
    });

    test('should display polls correctly', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Look for poll posts
      const pollPost = page.locator('text=Poll').first();
      if (await pollPost.isVisible()) {
        await expect(pollPost).toBeVisible();
        
        // Check poll options
        await expect(page.locator('text=A)')).toBeVisible();
        await expect(page.locator('text=B)')).toBeVisible();
      }
    });

    test('should handle poll voting', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Look for poll option to vote
      const pollOption = page.locator('text=A)').first();
      if (await pollOption.isVisible()) {
        await pollOption.click();
        
        // Should show voted state
        await expect(pollOption.locator('..')).toHaveClass(/bg-purple-500/);
      }
    });

    test('should display post timestamps', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check for time indicators
      await expect(page.locator('text=ago')).toBeVisible();
      await expect(page.locator('text=Today')).toBeVisible();
      await expect(page.locator('text=Yesterday')).toBeVisible();
    });
  });

  test.describe('Profile Navigation', () => {
    test('should navigate back from profile', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Click back button
      await page.click('text=Back');
      
      // Should go back to previous page
      await expect(page).not.toHaveURL(/\/profile\/test-user-id/);
    });

    test('should navigate to home from profile', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Click Manetho logo
      await page.click('text=Manetho');
      
      // Should navigate to home
      await expect(page).toHaveURL(/\/home/);
    });

    test('should navigate to community from profile', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Click user menu and select community
      await page.click('img[alt="Profile"]');
      await page.click('text=Community');
      
      // Should navigate to community
      await expect(page).toHaveURL(/\/community/);
    });

    test('should navigate to own profile from menu', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Click user menu and select profile
      await page.click('img[alt="Profile"]');
      await page.click('text=Profile');
      
      // Should navigate to own profile
      await expect(page).toHaveURL(/\/profile\/current-user-id/);
    });
  });

  test.describe('Theme and UI', () => {
    test('should toggle theme on profile page', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Click theme toggle
      await page.click('button[title*="Switch"]');
      
      // Should change theme
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    });

    test('should display profile in dark mode', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Enable dark mode
      await page.click('button[title*="Switch"]');
      
      // Check dark mode classes
      await expect(page.locator('.dark\\:bg-slate-900')).toBeVisible();
      await expect(page.locator('.dark\\:text-slate-100')).toBeVisible();
    });

    test('should have proper hover effects', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Hover over interactive elements
      await page.hover('text=Add Learning Partner');
      await page.hover('text=Message');
      
      // Should show hover states
      await expect(page.locator('text=Add Learning Partner')).toHaveClass(/hover:/);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/profile/test-user-id');
      
      // Check mobile layout
      await expect(page.locator('h1')).toContainText('Learning Partner Profile');
      await expect(page.locator('img[alt*="profile"]')).toBeVisible();
    });

    test('should handle mobile navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/profile/test-user-id');
      
      // Test mobile menu
      await page.click('img[alt="Profile"]');
      await expect(page.locator('text=Profile')).toBeVisible();
      await expect(page.locator('text=Community')).toBeVisible();
    });

    test('should display stats properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/profile/test-user-id');
      
      // Check mobile stats layout
      await expect(page.locator('text=Learning Partners')).toBeVisible();
      await expect(page.locator('text=Following')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check for ARIA labels
      await expect(page.locator('[aria-label]')).toBeVisible();
      await expect(page.locator('[role]')).toBeVisible();
    });

    test('should support screen readers', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check for screen reader friendly elements
      await expect(page.locator('[aria-describedby]')).toBeVisible();
      await expect(page.locator('[aria-live]')).toBeVisible();
    });

    test('should have proper alt text for images', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check image alt attributes
      const images = page.locator('img');
      for (let i = 0; i < await images.count(); i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline state
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('/profile/test-user-id');
      
      // Should show error state
      await expect(page.locator('text=Error')).toBeVisible();
    });

    test('should handle invalid user IDs', async ({ page }) => {
      await page.goto('/profile/invalid-user-id');
      
      // Should show appropriate error
      await expect(page.locator('text=User not found')).toBeVisible();
    });

    test('should handle missing profile data', async ({ page }) => {
      await page.goto('/profile/user-with-missing-data');
      
      // Should handle missing fields gracefully
      await expect(page.locator('h2')).toBeVisible(); // Should still show name
    });
  });

  test.describe('Performance', () => {
    test('should load profile quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/profile/test-user-id');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should handle large post lists', async ({ page }) => {
      await page.goto('/profile/user-with-many-posts');
      
      // Scroll through posts
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // Should not crash or freeze
      await expect(page.locator('h2')).toBeVisible(); // Profile name should still be visible
    });

    test('should load images efficiently', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check image loading
      const images = page.locator('img');
      for (let i = 0; i < await images.count(); i++) {
        await expect(images.nth(i)).toBeVisible();
      }
    });
  });

  test.describe('Data Validation', () => {
    test('should validate profile data format', async ({ page }) => {
      await page.goto('/profile/test-user-id');
      
      // Check that stats are valid numbers
      const statNumbers = page.locator('.text-2xl.font-bold');
      for (let i = 0; i < await statNumbers.count(); i++) {
        const text = await statNumbers.nth(i).textContent();
        expect(parseInt(text || '0')).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle special characters in names', async ({ page }) => {
      await page.goto('/profile/user-with-special-chars');
      
      // Should display special characters correctly
      await expect(page.locator('h2')).toBeVisible();
    });

    test('should handle long text content', async ({ page }) => {
      await page.goto('/profile/user-with-long-content');
      
      // Should handle long bio and post content
      await expect(page.locator('h2')).toBeVisible();
    });
  });
}); 