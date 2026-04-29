// Helper utilities for E2E tests

// Default credentials for test accounts (matching E2ESeeder.php)
const DEFAULT_CREDENTIALS = {
  admin: { email: 'admin@test.com', password: 'password123' },
  manager: { email: 'manager@test.com', password: 'password123' },
  veterinary: { email: 'veterinary@test.com', password: 'password123' },
  cashier: { email: 'cashier@test.com', password: 'password123' },
  inventory: { email: 'inventory@test.com', password: 'password123' },
  receptionist: { email: 'receptionist@test.com', password: 'password123' },
  payroll: { email: 'payroll@test.com', password: 'password123' },
  customer: { email: 'customer@test.com', password: 'password123' },
};

// Dashboard URLs per role
const ROLE_DASHBOARDS = {
  admin: '/admin',
  manager: '/manager',
  veterinary: '/veterinary',
  cashier: '/cashier',
  inventory: '/inventory',
  receptionist: '/receptionist',
  payroll: '/payroll',
  customer: '/customer',
};

/**
 * Login as a specific role using live backend
 * Uses env vars: E2E_{ROLE}_EMAIL and E2E_{ROLE}_PASSWORD
 * Falls back to default credentials from E2ESeeder
 */
async function loginAs(page, role = 'admin') {
  const roleUpper = role.toUpperCase();
  const defaults = DEFAULT_CREDENTIALS[role] || DEFAULT_CREDENTIALS.admin;
  
  const email = process.env[`E2E_${roleUpper}_EMAIL`] || defaults.email;
  const password = process.env[`E2E_${roleUpper}_PASSWORD`] || defaults.password;
  
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to role-specific dashboard
  const expectedPath = ROLE_DASHBOARDS[role] || '/dashboard';
  await page.waitForURL(`**${expectedPath}`, { timeout: 10000 }).catch(() => {});
}

/**
 * Mock login for isolated tests (no backend required)
 */
async function mockLoginAs(page, role, name = `E2E ${role}`) {
  await page.addInitScript(({ role, name }) => {
    window.localStorage.setItem('token', 'TEST_API_TOKEN');
    window.localStorage.setItem('name', name);
    window.localStorage.setItem('role', role);
  }, { role, name });
}

/**
 * Get expected dashboard path for a role
 */
function getDashboardPath(role) {
  return ROLE_DASHBOARDS[role] || '/dashboard';
}

/**
 * Check if user is on correct dashboard after login
 */
async function expectDashboardRedirect(page, role) {
  const expectedPath = getDashboardPath(role);
  await page.waitForURL(`**${expectedPath}`, { timeout: 10000 });
}

module.exports = { 
  loginAs, 
  mockLoginAs, 
  getDashboardPath, 
  expectDashboardRedirect,
  DEFAULT_CREDENTIALS,
  ROLE_DASHBOARDS 
};
