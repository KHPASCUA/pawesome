const { test, expect } = require('@playwright/test');

test.describe('Manager Dashboard end-to-end', () => {
  const { loginAs } = require('./test-utils');

  test.beforeEach(async ({ page }) => {
    if (process.env.E2E_LIVE) {
      await loginAs(page);
    } else {
      await page.addInitScript(() => {
        window.localStorage.setItem('token', 'TEST_API_TOKEN');
        window.localStorage.setItem('name', 'E2E Manager');
      });
    }
  });

  test('loads manager dashboard and shows team metrics', async ({ page }) => {
    const dashMock = { total_staff: 8, today_appointments: 4, completed_appointments: 3, today_revenue: 800 };
    const staffMock = { staff: [{ id: 1, name: 'Alice', is_active: true }] };

    if (!process.env.E2E_LIVE) {
      await page.route('**/api/manager/dashboard', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(dashMock) }));
      await page.route('**/api/manager/staff', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(staffMock) }));
    }
    await page.goto('http://localhost:3000/manager');
    await expect(page.locator('.overview-card').first()).toBeVisible();
    await expect(page.locator('text=Team Members')).toBeVisible();
    await expect(page.locator('h3', { hasText: '8' })).toBeVisible();
  });
});
