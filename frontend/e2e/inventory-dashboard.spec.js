const { test, expect } = require('@playwright/test');

test.describe('Inventory Dashboard end-to-end', () => {
  const { loginAs } = require('./test-utils');

  test.beforeEach(async ({ page }) => {
    if (process.env.E2E_LIVE) {
      await loginAs(page);
    } else {
      await page.addInitScript(() => {
        window.localStorage.setItem('token', 'TEST_API_TOKEN');
        window.localStorage.setItem('name', 'E2E Inventory');
      });
    }
  });

  test('loads inventory dashboard and shows stock metrics', async ({ page }) => {
    const mock = {
      total_items: 50,
      low_stock_items: 3,
      out_of_stock_items: 1,
      total_stock_value: 5000
    };

    if (!process.env.E2E_LIVE) {
      await page.route('**/api/inventory/dashboard', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mock) }));
    }
    await page.goto('http://localhost:3000/inventory');
    await expect(page.locator('.overview-card').first()).toBeVisible();
    await expect(page.locator('text=Total Products')).toBeVisible();
    await expect(page.locator('h3', { hasText: '50' })).toBeVisible();
  });
});
