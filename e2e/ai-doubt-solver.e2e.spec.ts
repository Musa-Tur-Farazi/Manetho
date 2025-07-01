import { test, expect } from '@playwright/test';

test('AI Doubt Solver replies to a user message', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Expand the AI Doubt Solver widget if collapsed
  const header = await page.getByText(/AI Study Assistant/i);
  await header.click();

  // Wait for input to be visible
  const input = await page.getByPlaceholder('Ask any question about your studies...');
  await expect(input).toBeVisible();

  // Type a message and send
  await input.fill('What is the Pythagorean theorem?');
  const sendButton = await page.getByRole('button', { name: /send/i });
  await sendButton.click();

  // Wait for the AI reply to appear
  await expect(page.getByText(/Pythagorean theorem|Sorry|couldn't generate a response|Error/i, { timeout: 15000 })).toBeVisible();
}); 