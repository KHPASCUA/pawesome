// Helper utilities for E2E tests
async function loginAs(page) {
  // UI login used when running tests against a live backend.
  const email = process.env.E2E_USER_EMAIL || 'admin@example.com';
  const password = process.env.E2E_USER_PASSWORD || 'password';
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  // Wait until redirected to dashboard (may vary per role)
  await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
}

module.exports = { loginAs };
