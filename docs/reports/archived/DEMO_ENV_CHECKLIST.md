# Demo Environment Checklist

Use these settings for the capstone defense/demo environment.

## Required

- Set `APP_DEBUG=false` before the demo.
- Keep API credentials and database credentials out of screenshots.
- Run `php artisan optimize:clear` after any `.env` change.
- Run `php artisan route:list` after clearing caches.
- Confirm the frontend points to the intended backend API URL.

## Recommended

- Use `APP_ENV=production` for a deployed defense environment, or keep `APP_ENV=local` only for laptop-local rehearsal.
- Rehearse with the exact demo credential sheet.
- Admin demo credential currently verified: `admin@example.com / password`.
- Other role demo credentials currently verified: `Password123!` for manager, receptionist, cashier, inventory, vet, and customer.

## Final Smoke Checks

- Login as each role.
- Confirm `/api/veterinary/inventory-items` returns 200 for the veterinarian.
- Confirm secure file URLs return 401 without a token.
- Confirm security headers are present on `/api/health`.
