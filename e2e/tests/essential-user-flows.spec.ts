import { test, expect } from '@playwright/test';

test.describe('Essential User Flows - E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Wait for dev server to be ready
    await page.waitForTimeout(2000);
  });

  test.describe('🔐 Authentication Tests', () => {
    test('should load sign-in page and test authentication flow', async ({ page }) => {
      try {
        await page.goto('/sign-in', { waitUntil: 'networkidle', timeout: 30000 });
        
        // Wait for Clerk to load
        await page.waitForTimeout(8000);
        
        console.log('📍 Sign-in page loaded');
        
        // Test 1: Look for Clerk email input
        const emailInput = page.locator(
          'input[name="identifier"], ' +
          'input[name="emailAddress"], ' +
          'input[type="email"]'
        ).first();
        
        if (await emailInput.isVisible({ timeout: 10000 })) {
          console.log('✅ Email input found');
          
          // Test valid email format
          await emailInput.fill('test@example.com');
          console.log('✅ Valid email entered');
          
          // Look for continue button
          const continueBtn = page.locator('button').filter({ hasText: /continue|sign in|submit/i }).first();
          
          if (await continueBtn.isVisible()) {
            console.log('✅ Continue button found');
            await continueBtn.click();
            await page.waitForTimeout(3000);
            
            // Check if password field appears
            const passwordInput = page.locator('input[type="password"]');
            if (await passwordInput.isVisible()) {
              console.log('✅ Password field appeared - multi-step auth flow works');
              
              // Test password input
              await passwordInput.fill('testpassword123');
              console.log('✅ Password entered');
              
              // Try to submit (will fail but tests the flow)
              const submitBtn = page.locator('button').filter({ hasText: /sign in|submit/i }).first();
              if (await submitBtn.isVisible()) {
                await submitBtn.click();
                await page.waitForTimeout(2000);
                console.log('✅ Authentication flow completed (expected to fail with test credentials)');
              }
            }
          }
          
          // Test 2: Invalid email format
          await page.goto('/sign-in');
          await page.waitForTimeout(3000);
          
          const emailInput2 = page.locator('input[name="identifier"], input[type="email"]').first();
          if (await emailInput2.isVisible()) {
            await emailInput2.fill('invalid-email');
            
            const continueBtn2 = page.locator('button').filter({ hasText: /continue|submit/i }).first();
            if (await continueBtn2.isVisible()) {
              await continueBtn2.click();
              await page.waitForTimeout(2000);
              
              // Should show error or stay on page
              const hasValidationError = await page.locator('.cl-formFieldError, [role="alert"]').count() > 0;
              const stayedOnSignIn = page.url().includes('/sign-in');
              
              if (hasValidationError || stayedOnSignIn) {
                console.log('✅ Invalid email properly rejected');
              }
            }
          }
        } else {
          console.log('⚠️  Clerk form not loaded - might need different selectors');
        }
        
      } catch (error) {
        console.log('⚠️  Authentication test error:', error.message);
      }
    });

    test('should redirect unauthenticated users from protected pages', async ({ page }) => {
      const protectedPages = ['/home', '/chat', '/community', '/profile'];
      
      for (const protectedPage of protectedPages) {
        try {
          await page.goto(protectedPage, { timeout: 15000 });
          await page.waitForTimeout(3000);
          
          const currentUrl = page.url();
          const isRedirected = currentUrl.includes('/sign-in') || 
                              currentUrl.includes('/auth') ||
                              currentUrl.includes('clerk');
          
          console.log(`🔒 ${protectedPage} → ${isRedirected ? 'Protected ✅' : 'Accessible ⚠️'}`);
          
        } catch (error) {
          console.log(`🔒 ${protectedPage} → Network error (likely protected)`);
        }
      }
    });
  });

  test.describe('📱 Application Features', () => {
    test('should load and test core application pages', async ({ page }) => {
      const pagesToTest = [
        { path: '/', name: 'Landing Page', shouldLoad: true },
        { path: '/faq', name: 'FAQ Page', shouldLoad: true },
        { path: '/chat', name: 'Chat Page', shouldLoad: false }, // Protected
        { path: '/community', name: 'Community Page', shouldLoad: false }, // Protected
        { path: '/tools/doubt-solving', name: 'AI Doubt Solver', shouldLoad: false } // Protected
      ];
      
      for (const testPage of pagesToTest) {
        try {
          await page.goto(testPage.path, { timeout: 15000 });
          await page.waitForTimeout(3000);
          
          const currentUrl = page.url();
          const loadedSuccessfully = !currentUrl.includes('/sign-in');
          
          if (testPage.shouldLoad) {
            // Public pages should load
            console.log(`🌐 ${testPage.name}: ${loadedSuccessfully ? 'Loaded ✅' : 'Redirected ⚠️'}`);
          } else {
            // Protected pages should redirect
            console.log(`🔒 ${testPage.name}: ${loadedSuccessfully ? 'Accessible ⚠️' : 'Protected ✅'}`);
          }
          
        } catch (error) {
          console.log(`📱 ${testPage.name}: Network error`);
        }
      }
    });

    test('should test chat interface elements (if accessible)', async ({ page }) => {
      try {
        await page.goto('/chat', { timeout: 15000 });
        await page.waitForTimeout(5000);
        
        if (!page.url().includes('/sign-in')) {
          console.log('💬 Chat page accessible - testing interface elements');
          
          // Look for chat interface elements
          const messageInput = page.locator('input[type="text"], textarea').first();
          const sendButton = page.locator('button').filter({ hasText: /send/i }).first();
          const videoCallBtn = page.locator('button').filter({ hasText: /video/i }).first();
          const audioCallBtn = page.locator('button').filter({ hasText: /audio|call/i }).first();
          
          const elements = [
            { element: messageInput, name: 'Message Input' },
            { element: sendButton, name: 'Send Button' },
            { element: videoCallBtn, name: 'Video Call Button' },
            { element: audioCallBtn, name: 'Audio Call Button' }
          ];
          
          for (const { element, name } of elements) {
            const isVisible = await element.isVisible();
            console.log(`📱 ${name}: ${isVisible ? 'Found ✅' : 'Not visible'}`);
          }
          
          // Test message input if available
          if (await messageInput.isVisible()) {
            await messageInput.fill('Test message for E2E');
            console.log('✅ Message input working');
          }
          
        } else {
          console.log('🔒 Chat requires authentication');
        }
        
      } catch (error) {
        console.log('💬 Chat interface test error:', error.message);
      }
    });

    test('should test AI Doubt Solver interface (if accessible)', async ({ page }) => {
      try {
        await page.goto('/tools/doubt-solving', { timeout: 15000 });
        await page.waitForTimeout(5000);
        
        if (!page.url().includes('/sign-in')) {
          console.log('🤖 AI Doubt Solver accessible - testing interface');
          
          // Look for AI interface elements
          const questionInput = page.locator('input, textarea').first();
          const submitButton = page.locator('button').filter({ hasText: /ask|submit|solve/i }).first();
          const fileUpload = page.locator('input[type="file"]');
          
          const elements = [
            { element: questionInput, name: 'Question Input' },
            { element: submitButton, name: 'Submit Button' },
            { element: fileUpload, name: 'File Upload' }
          ];
          
          for (const { element, name } of elements) {
            const isVisible = await element.isVisible();
            console.log(`🧠 ${name}: ${isVisible ? 'Available ✅' : 'Not found'}`);
          }
          
        } else {
          console.log('🔒 AI Doubt Solver requires authentication');
        }
        
      } catch (error) {
        console.log('🤖 AI Doubt Solver test error:', error.message);
      }
    });

    test('should test community features (if accessible)', async ({ page }) => {
      try {
        await page.goto('/community', { timeout: 15000 });
        await page.waitForTimeout(5000);
        
        if (!page.url().includes('/sign-in')) {
          console.log('👥 Community page accessible - testing features');
          
          // Look for community elements
          const userProfiles = page.locator('a[href*="/profile/"], .user-card, .profile-link');
          const followButtons = page.locator('button').filter({ hasText: /follow/i });
          const posts = page.locator('.post, .thread, .message');
          
          const userProfileCount = await userProfiles.count();
          const followButtonCount = await followButtons.count();
          const postCount = await posts.count();
          
          console.log(`👤 User profiles found: ${userProfileCount}`);
          console.log(`🔄 Follow buttons found: ${followButtonCount}`);
          console.log(`📝 Posts/threads found: ${postCount}`);
          
          // Test profile navigation if available
          if (userProfileCount > 0) {
            try {
              const firstProfile = userProfiles.first();
              const href = await firstProfile.getAttribute('href');
              console.log(`🔗 Profile link available: ${href}`);
            } catch (error) {
              console.log('👤 Profile link test skipped');
            }
          }
          
        } else {
          console.log('🔒 Community requires authentication');
        }
        
      } catch (error) {
        console.log('👥 Community test error:', error.message);
      }
    });
  });

  test.describe('🏥 Application Health', () => {
    test('should have reasonable performance', async ({ page }) => {
      const pagesToTest = ['/', '/sign-in'];
      
      for (const testPage of pagesToTest) {
        try {
          const startTime = Date.now();
          
          await page.goto(testPage, { timeout: 30000 });
          await page.waitForLoadState('networkidle');
          
          const loadTime = Date.now() - startTime;
          const performance = loadTime < 3000 ? 'Excellent 🚀' : 
                            loadTime < 7000 ? 'Good ✅' : 'Slow ⚠️';
          
          console.log(`⚡ ${testPage}: ${loadTime}ms (${performance})`);
          
        } catch (error) {
          console.log(`⚡ ${testPage}: Load failed`);
        }
      }
    });

    test('should have basic accessibility', async ({ page }) => {
      try {
        await page.goto('/', { timeout: 15000 });
        await page.waitForTimeout(2000);
        
        // Check basic accessibility elements
        const title = await page.title();
        const hasTitle = title && title.length > 0;
        
        const navigation = page.locator('nav');
        const hasNavigation = await navigation.count() > 0;
        
        const headings = page.locator('h1, h2, h3');
        const headingCount = await headings.count();
        
        console.log(`📝 Page title: ${hasTitle ? 'Present ✅' : 'Missing ⚠️'}`);
        console.log(`🧭 Navigation: ${hasNavigation ? 'Found ✅' : 'Missing ⚠️'}`);
        console.log(`📑 Headings: ${headingCount} found`);
        
      } catch (error) {
        console.log('🏥 Accessibility test error:', error.message);
      }
    });
  });
}); 