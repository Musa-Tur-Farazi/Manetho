import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global E2E test setup...');
  
  // Start browser for auth setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Check if the app is running
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
    console.log(`📡 Checking if app is running at: ${baseURL}`);
    
    await page.goto(baseURL, { timeout: 30000 });
    console.log('✅ App is running and accessible');
    
    // You can add authentication setup here if needed
    // For example, creating test users or setting up auth tokens
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global E2E test setup completed');
}

export default globalSetup; 