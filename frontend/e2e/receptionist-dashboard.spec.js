const { test, expect } = require('@playwright/test');

test.describe('Receptionist Dashboard end-to-end', () => {
  const { loginAs } = require('./test-utils');

  test.beforeEach(async ({ page }) => {
    if (process.env.E2E_LIVE) {
      await loginAs(page);
    } else {
      await page.addInitScript(() => {
        window.localStorage.setItem('token', 'TEST_API_TOKEN');
        window.localStorage.setItem('name', 'E2E Receptionist');
      });
    }
  });

  test('loads receptionist appointments list', async ({ page }) => {
    const mockAppointments = [{ id: 1, scheduled_at: new Date().toISOString(), status: 'scheduled' }];
    if (!process.env.E2E_LIVE) {
      await page.route('**/api/receptionist/appointments', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAppointments) }));
    }
    await page.goto('http://localhost:3000/receptionist');
    await expect(page.locator('.appointment-list, .overview-card').first()).toBeVisible();
    await expect(page.locator('text=Appointments')).toBeVisible();
  });
});
