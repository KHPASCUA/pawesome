# E2E Test Guide

Running modes
- Mock mode (default): tests intercept backend APIs and use local mocks. Fast and safe for CI.
- Live mode: tests run against a running backend at `http://localhost:3000` and perform UI login.

Run tests (mock):
```bash
# from frontend/ folder
npx playwright test
```

Run tests (live):
```bash
# set credentials and enable live mode
export E2E_LIVE=true
export E2E_USER_EMAIL=admin@example.com
export E2E_USER_PASSWORD=secret
npx playwright test
```

Notes for live runs
- Ensure the backend API and frontend are running locally (vite/dev server + Laravel backend).
- The tests perform a UI login by navigating to `/login` and submitting credentials from `E2E_USER_EMAIL` and `E2E_USER_PASSWORD`.
- To avoid polluting production data, run tests against a local or disposable staging database. You can seed test data with Laravel seeders, for example:

```bash
# from backend/ folder
php artisan db:seed --class=E2ESeeder
```

If you want, I can scaffold an `E2ESeeder` and the `php artisan` seeder class to create minimal test accounts and data. Say the word and I'll add it.

Seeding / teardown commands (backend):

```bash
# create e2e data
cd backend
php artisan db:seed --class=Database\\Seeders\\E2ESeeder

# remove e2e data
php artisan db:seed --class=Database\\Seeders\\E2ETeardownSeeder
```

Run teardown after live tests to keep the local DB clean.
