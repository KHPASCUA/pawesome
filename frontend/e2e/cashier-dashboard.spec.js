const { test, expect } = require('@playwright/test');

test.describe('Cashier Dashboard end-to-end', () => {
  const { loginAs } = require('./test-utils');

  test.beforeEach(async ({ page }) => {
    if (process.env.E2E_LIVE) {
      await loginAs(page);
    } else {
      await page.addInitScript(() => {
        window.localStorage.setItem('token', 'TEST_API_TOKEN');
        window.localStorage.setItem('name', 'E2E Cashier');
      });
    }
  });

  test('loads cashier dashboard and displays sales', async ({ page }) => {
    const mock = {
      today_sales: 1200.5,
      today_transactions: 12,
      monthly_sales: 15000,
      pending_payments: 2
    };

    if (!process.env.E2E_LIVE) {
      await page.route('**/api/cashier/dashboard', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mock) }));
    }
    await page.goto('http://localhost:3000/cashier');
    await expect(page.locator('.overview-card').first()).toBeVisible();
    await expect(page.locator('text=Today\'s Sales')).toBeVisible();
    await expect(page.locator('h3', { hasText: '1200' })).toBeVisible();
  });
});
