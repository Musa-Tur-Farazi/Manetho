import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set up test users if needed
  // This could include creating test accounts, setting up test data, etc.
  
  // For now, we'll just ensure the application is accessible
  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ Application is accessible');
  } catch (error) {
    console.error('❌ Application is not accessible:', error);
    throw error;
  }

  await browser.close();
}

export default globalSetup; 