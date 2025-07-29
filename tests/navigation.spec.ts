import { test, expect } from './utils/test-utils';
import { testUsers, selectors } from './utils/test-utils';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page, pageActions }) => {
    // Sign in before each test
    await pageActions.signIn(testUsers.student.email, testUsers.student.password);
  });

  test.describe('Home Page', () => {
    test('should display home page with main features', async ({ page }) => {
      await page.goto('/home');
      
      // Check for welcome message
      await expect(page.locator('text=Welcome back')).toBeVisible();
      
      // Check for main feature cards
      await expect(page.locator('text=AI Doubt Solver')).toBeVisible();
      await expect(page.locator('text=Community')).toBeVisible();
      await expect(page.locator('text=Smart Flashcards')).toBeVisible();
      await expect(page.locator('text=Mind Maps')).toBeVisible();
      
      // Check for quick stats section
      await expect(page.locator('text=Your Learning Journey')).toBeVisible();
      
      // Check for AI Quiz Generator section
      await expect(page.locator('text=AI Quiz Generator')).toBeVisible();
    });

    test('should navigate to different features from home page', async ({ page }) => {
      await page.goto('/home');
      
      // Test navigation to AI Doubt Solver
      await page.click('text=Start Solving');
      await expect(page).toHaveURL('/tools/doubt-solving');
      
      // Go back to home
      await page.goto('/home');
      
      // Test navigation to Community
      await page.click('text=Join Community');
      await expect(page).toHaveURL('/community');
      
      // Go back to home
      await page.goto('/home');
      
      // Test navigation to Flashcards
      await page.click('text=Study Now');
      await expect(page).toHaveURL('/tools/flashcards');
      
      // Go back to home
      await page.goto('/home');
      
      // Test navigation to Mind Maps
      await page.click('text=Create Mind Map');
      await expect(page).toHaveURL('/tools/mind-maps');
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('should toggle sidebar visibility', async ({ page }) => {
      await page.goto('/home');
      
      // Check if sidebar toggle button is visible
      const sidebarToggle = page.locator('button[aria-label="Toggle sidebar"]');
      await expect(sidebarToggle).toBeVisible();
      
      // Click to open sidebar
      await sidebarToggle.click();
      
      // Check if sidebar is visible
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();
      
      // Click close button to close sidebar
      const closeButton = sidebar.locator('button[aria-label="Close sidebar"]');
      await closeButton.click();
      
      // Check if sidebar is hidden
      await expect(sidebar).toBeHidden();
    });

    test('should navigate through sidebar menu items', async ({ page }) => {
      await page.goto('/home');
      
      // Open sidebar
      await page.click('button[aria-label="Toggle sidebar"]');
      
      // Test navigation to Home
      await page.click('text=Home');
      await expect(page).toHaveURL('/home');
      
      // Test navigation to Community
      await page.click('text=Community');
      await expect(page).toHaveURL('/community');
      
      // Test navigation to Group Study
      await page.click('text=Group Study');
      await expect(page).toHaveURL('/group-study');
      
      // Test navigation to AI Doubt Solver
      await page.click('text=AI Doubt Solver');
      await expect(page).toHaveURL('/tools/doubt-solving');
      
      // Test navigation to Flashcards
      await page.click('text=Flashcards');
      await expect(page).toHaveURL('/tools/flashcards');
      
      // Test navigation to Mind Maps
      await page.click('text=Mind Maps');
      await expect(page).toHaveURL('/tools/mind-maps');
      
      // Test navigation to Profile
      await page.click('text=Profile');
      await expect(page).toHaveURL(/\/profile/);
      
      // Test navigation to Messages
      await page.click('text=Messages');
      await expect(page).toHaveURL('/chat');
    });

    test('should highlight active page in sidebar', async ({ page }) => {
      await page.goto('/home');
      
      // Open sidebar
      await page.click('button[aria-label="Toggle sidebar"]');
      
      // Check if Home is highlighted as active
      const homeLink = page.locator('text=Home').locator('..');
      await expect(homeLink).toHaveClass(/bg-gray-100/);
      
      // Navigate to Community
      await page.click('text=Community');
      await expect(page).toHaveURL('/community');
      
      // Check if Community is highlighted as active
      const communityLink = page.locator('text=Community').locator('..');
      await expect(communityLink).toHaveClass(/bg-gray-100/);
    });
  });

  test.describe('Navbar Navigation', () => {
    test('should display authenticated navbar', async ({ page }) => {
      await page.goto('/home');
      
      // Check for navbar elements
      await expect(page.locator('text=Manetho')).toBeVisible();
      
      // Check for user profile elements
      const profileAvatar = page.locator('[data-testid="profile-avatar"], img[alt*="profile"]');
      await expect(profileAvatar).toBeVisible();
    });

    test('should handle profile menu interactions', async ({ page }) => {
      await page.goto('/home');
      
      // Click on profile avatar/menu
      const profileMenu = page.locator('[data-testid="profile-menu"], button[aria-label*="profile"]');
      await profileMenu.click();
      
      // Check if profile menu dropdown is visible
      const dropdown = page.locator('[role="menu"], [data-testid="profile-dropdown"]');
      await expect(dropdown).toBeVisible();
      
      // Check for menu items
      await expect(page.locator('text=Profile')).toBeVisible();
      await expect(page.locator('text=Settings')).toBeVisible();
      await expect(page.locator('text=Sign Out')).toBeVisible();
    });

    test('should handle theme toggle', async ({ page }) => {
      await page.goto('/home');
      
      // Find theme toggle button
      const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        
        // Check if theme changed (this might be hard to test visually)
        // We can check if the button state changed
        await expect(themeToggle).toBeVisible();
      }
    });

    test('should handle notification bell', async ({ page }) => {
      await page.goto('/home');
      
      // Find notification bell
      const notificationBell = page.locator('[data-testid="notification-bell"], button[aria-label*="notification"]');
      if (await notificationBell.isVisible()) {
        await notificationBell.click();
        
        // Check if notifications dropdown is visible
        const notificationsDropdown = page.locator('[data-testid="notifications-dropdown"]');
        await expect(notificationsDropdown).toBeVisible();
      }
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should display breadcrumbs on nested pages', async ({ page }) => {
      // Navigate to a nested page
      await page.goto('/tools/flashcards');
      
      // Check for breadcrumb navigation
      const breadcrumbs = page.locator('[data-testid="breadcrumbs"], nav[aria-label="breadcrumb"]');
      if (await breadcrumbs.isVisible()) {
        await expect(breadcrumbs).toContainText('Tools');
        await expect(breadcrumbs).toContainText('Flashcards');
      }
    });

    test('should allow navigation through breadcrumbs', async ({ page }) => {
      await page.goto('/tools/flashcards');
      
      const breadcrumbs = page.locator('[data-testid="breadcrumbs"], nav[aria-label="breadcrumb"]');
      if (await breadcrumbs.isVisible()) {
        // Click on "Tools" breadcrumb
        await page.click('text=Tools');
        await expect(page).toHaveURL('/tools');
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    test('should handle mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/home');
      
      // Check if mobile menu button is visible
      const mobileMenuButton = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        
        // Check if mobile menu is visible
        const mobileMenu = page.locator('[data-testid="mobile-menu-dropdown"]');
        await expect(mobileMenu).toBeVisible();
        
        // Test navigation through mobile menu
        await page.click('text=Community');
        await expect(page).toHaveURL('/community');
      }
    });

    test('should handle mobile sidebar', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/home');
      
      // Open sidebar on mobile
      await page.click('button[aria-label="Toggle sidebar"]');
      
      // Check if overlay is visible on mobile
      const overlay = page.locator('.fixed.inset-0.bg-black\\/20');
      await expect(overlay).toBeVisible();
      
      // Click overlay to close sidebar
      await overlay.click();
      
      // Check if sidebar is hidden
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeHidden();
    });
  });

  test.describe('URL Navigation', () => {
    test('should handle direct URL navigation', async ({ page }) => {
      const routes = [
        '/home',
        '/community',
        '/group-study',
        '/tools/doubt-solving',
        '/tools/flashcards',
        '/tools/mind-maps',
        '/quiz',
        '/chat'
      ];

      for (const route of routes) {
        await page.goto(route);
        await expect(page).toHaveURL(route);
        
        // Check if page loads without errors
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle 404 pages', async ({ page }) => {
      await page.goto('/non-existent-page');
      
      // Should show 404 page
      await expect(page.locator('text=404')).toBeVisible();
      await expect(page.locator('text=Page not found')).toBeVisible();
    });

    test('should handle back and forward navigation', async ({ page }) => {
      await page.goto('/home');
      await page.goto('/community');
      await page.goto('/tools/flashcards');
      
      // Go back
      await page.goBack();
      await expect(page).toHaveURL('/community');
      
      // Go forward
      await page.goForward();
      await expect(page).toHaveURL('/tools/flashcards');
    });
  });

  test.describe('Search Navigation', () => {
    test('should handle global search', async ({ page }) => {
      await page.goto('/home');
      
      // Find search input
      const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test query');
        await searchInput.press('Enter');
        
        // Should navigate to search results page
        await expect(page).toHaveURL(/.*search.*/);
      }
    });

    test('should handle search suggestions', async ({ page }) => {
      await page.goto('/home');
      
      const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('flash');
        
        // Check if suggestions appear
        const suggestions = page.locator('[data-testid="search-suggestions"]');
        if (await suggestions.isVisible()) {
          await expect(suggestions).toContainText('flashcards');
        }
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should handle keyboard shortcuts', async ({ page }) => {
      await page.goto('/home');
      
      // Test Ctrl/Cmd + K for search
      await page.keyboard.press('Control+k');
      const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="search"]');
      await expect(searchInput).toBeFocused();
      
      // Test Escape to close modals/dropdowns
      await page.keyboard.press('Escape');
      await expect(searchInput).not.toBeFocused();
    });

    test('should handle tab navigation', async ({ page }) => {
      await page.goto('/home');
      
      // Test tab navigation through interactive elements
      await page.keyboard.press('Tab');
      
      // Should focus on first interactive element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });
}); 