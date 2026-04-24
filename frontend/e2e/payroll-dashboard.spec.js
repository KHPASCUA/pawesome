const { test, expect } = require('@playwright/test');

test.describe('Payroll Dashboard end-to-end', () => {
  const { loginAs } = require('./test-utils');

  test.beforeEach(async ({ page }) => {
    if (process.env.E2E_LIVE) {
      await loginAs(page);
    } else {
      await page.addInitScript(() => {
        window.localStorage.setItem('token', 'TEST_API_TOKEN');
        window.localStorage.setItem('name', 'E2E Payroll');
      });
    }
  });

  test('loads payroll module and shows payroll metrics', async ({ page }) => {
    const mock = { payrolls: [], monthly_total: 50000 };
    if (!process.env.E2E_LIVE) {
      await page.route('**/api/payroll*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mock) }));
    }
    await page.goto('http://localhost:3000/payroll');
    await expect(page.locator('.overview-card').first()).toBeVisible();
    await expect(page.locator('text=Payroll')).toBeVisible();
  });
});
