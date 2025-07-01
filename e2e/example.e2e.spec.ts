import { test, expect } from '@playwright/test';

test('homepage should have correct title', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Manetho|Next\.js|React/i);
}); 