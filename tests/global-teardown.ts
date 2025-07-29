import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Clean up test data if needed
  // This could include deleting test accounts, cleaning up test files, etc.
  
  console.log('🧹 Cleaning up test data...');

  await browser.close();
}

export default globalTeardown; 