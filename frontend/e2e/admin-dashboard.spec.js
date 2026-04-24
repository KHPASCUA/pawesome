const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard end-to-end', () => {
  const { loginAs } = require('./test-utils');

  test.beforeEach(async ({ page }) => {
    if (process.env.E2E_LIVE) {
      await loginAs(page);
    } else {
      // Set a logged-in user session (mocked)
      await page.addInitScript(() => {
        window.localStorage.setItem('token', 'TEST_API_TOKEN');
        window.localStorage.setItem('name', 'E2E Admin');
      });
    }
  });

  test('loads dashboard and displays summary cards', async ({ page }) => {
    // Intercept the dashboard API and assert the UI matches response
    const mockData = {
      total_users: 12,
      active_users: 10,
      total_customers: 42,
      today_appointments: 3,
      total_revenue: 12345.67,
      low_stock_items: 2,
      recent_appointments: [],
      recent_users: []
    };

    if (!process.env.E2E_LIVE) {
      await page.route('**/api/admin/dashboard', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockData)
        });
      });
    }

    await page.goto('http://localhost:3000/admin');

    // Wait for the dashboard cards to render
    await expect(page.locator('.overview-card').first()).toBeVisible();

    // Check for one summary number presence
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('h3', { hasText: '12' })).toBeVisible();
  });
});
