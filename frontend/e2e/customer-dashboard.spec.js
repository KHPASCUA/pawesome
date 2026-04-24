const { test, expect } = require('@playwright/test');

test.describe('Customer Dashboard end-to-end', () => {
  const { loginAs } = require('./test-utils');

  test.beforeEach(async ({ page }) => {
    if (process.env.E2E_LIVE) {
      await loginAs(page);
    } else {
      await page.addInitScript(() => {
        window.localStorage.setItem('token', 'TEST_API_TOKEN');
        window.localStorage.setItem('name', 'E2E Customer');
      });
    }
  });

  test('loads customer dashboard and shows bookings', async ({ page }) => {
    const mock = { active_bookings: 2, total_pets: 3, recent_bookings: [] };
    if (!process.env.E2E_LIVE) {
      await page.route('**/api/customer/overview', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mock) }));
    }
    await page.goto('http://localhost:3000/customer');
    await expect(page.locator('.overview-card').first()).toBeVisible();
    await expect(page.locator('text=Active Bookings')).toBeVisible();
    await expect(page.locator('h3', { hasText: '2' })).toBeVisible();
  });
});
