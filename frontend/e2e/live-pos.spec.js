const { test, expect } = require('@playwright/test');

test('live POS reachable and shows login', async ({ page }) => {
  const url = 'https://pawesomezapote.vercel.app/cashier/pos';
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });

  // Check for login submit button and form fields
  await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible({ timeout: 10000 });

  // Check for common username/email and password fields
  await expect(page.locator('input[name="email"], input[name="username"], input[type="email"], input[type="text"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});
