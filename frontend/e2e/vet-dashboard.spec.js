const { test, expect } = require('@playwright/test');

test.describe('Vet Dashboard end-to-end', () => {
  const { loginAs } = require('./test-utils');

  test.beforeEach(async ({ page }) => {
    if (process.env.E2E_LIVE) {
      await loginAs(page);
    } else {
      await page.addInitScript(() => {
        window.localStorage.setItem('token', 'TEST_API_TOKEN');
        window.localStorage.setItem('name', 'E2E Vet');
      });
    }
  });

  test('loads vet dashboard and shows appointments', async ({ page }) => {
    const mock = {
      today_appointments: 5,
      total_patients: 20,
      completed_appointments: 15,
      upcoming_appointments: []
    };

    if (!process.env.E2E_LIVE) {
      await page.route('**/api/veterinary/dashboard', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mock) }));
      await page.route('**/api/veterinary/boardings/current-boarders', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
    }
    await page.goto('http://localhost:3000/veterinary');
    await expect(page.locator('.overview-card').first()).toBeVisible();
    await expect(page.locator('text=Today\'s Appointments')).toBeVisible();
    await expect(page.locator('h3', { hasText: '5' })).toBeVisible();
  });
});
