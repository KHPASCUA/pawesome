# XAMPP Database Rebuild Audit

Date: 2026-05-08

## 1. XAMPP / MySQL Status

- XAMPP MySQL was reachable through `C:\xampp\mysql\bin\mysql.exe`.
- `pawesome_db` did not exist at first.
- Created only the database schema:
  - Database: `pawesome_db`
  - Character set: `utf8mb4`
  - Collation: `utf8mb4_general_ci`
- No XAMPP data folders or system files were edited.

## 2. Environment

`backend/.env` is correct for local development:

- `DB_CONNECTION=mysql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=pawesome_db`
- `DB_USERNAME=root`
- `DB_PASSWORD=`

Frontend local development uses `frontend/.env`:

- `REACT_APP_API_URL=http://localhost:8000/api`

Production code no longer hardcodes a localhost API fallback. `frontend/src/api/client.js` now falls back to `/api` when `REACT_APP_API_URL` is not set.

## 3. Migration Result

Result: passed.

Initial failure:

- File: `database/migrations/2025_01_15_000001_create_inventory_batches_table.php`
- Error: `Can't create table pawesome_db.inventory_batches (errno: 150 "Foreign key constraint is incorrectly formed")`
- Cause: the migration created `inventory_batches` before `inventory_items`, but tried to add the foreign key immediately.

Fix:

- Kept `inventory_batches.inventory_item_id`.
- Deferred the foreign key into `database/migrations/2026_05_08_000102_add_inventory_batches_foreign_key.php`, which runs after `inventory_items` exists.

Final `php artisan migrate:fresh --seed`: passed.
Final `php artisan migrate:status`: all migrations are `Ran`.

## 4. Seeder Result

Result: passed.

Changes:

- Updated seeded role account passwords to `Password123!`.
- Added `database/seeders/PawesomeLiveDemoSeeder.php`.
- Added it to `DatabaseSeeder`.

Seeder coverage added:

- Role users for admin, manager, receptionist, cashier, inventory, veterinary, customer, payroll.
- 5+ customers and linked pets.
- Customer product orders with pending, approved unpaid, payment pending, paid, completed, rejected, and cancelled/refunded examples.
- Service requests for veterinary, grooming, pet hotel, and medical confinement request types.
- POS sales and payment records with pending, completed, failed, and refunded statuses.
- Veterinary scheduled, in-progress, and completed appointments.
- Medical record with diagnosis, treatment plan, prescription-style treatment notes, and remarks.
- Boarding and medical confinement examples.
- Inventory logs for POS deduction, receptionist order deduction, stock restore, manual adjustment, and low-stock review.
- Notifications across customer, cashier, receptionist, inventory, and veterinary workflows.
- Payroll records and basic audit/login records for reports.

Seeder caveats:

- `payments` table is POS-sale based in the current schema. Order/service payment proof states are represented on `customer_orders`, `service_requests`, `boardings`, and `medical_confinements`.
- `payments.status` supports `pending`, `completed`, `failed`, and `refunded`; it does not support `rejected`.
- `service_requests.status` supports `pending`, `approved`, and `rejected`; it does not support `scheduled`, `in_progress`, `completed`, or `cancelled` directly.

## 5. Table Counts

Final count checks:

| Table | Count |
| --- | ---: |
| users | 12 |
| customers | 8 |
| pets | 10 |
| inventory_items | 77 |
| customer_orders | 7 |
| customer_order_items | 14 |
| service_requests | 5 |
| appointments | 4 |
| payments | 4 |
| inventory_logs | 77 |
| notifications | 11 |
| medical_records | 1 |
| medical_confinements | 1 |
| payrolls | 5 |
| sales | 9 |
| sale_items | 4 |
| hotel_rooms | 3 |
| boardings | 2 |

## 6. Demo Accounts

Password for all listed demo accounts: `Password123!`

| Role | Username | Email |
| --- | --- | --- |
| Admin | `admin` | `admin@example.com` |
| Manager | `manager` | `manager@example.com` |
| Receptionist | `receptionist` | `receptionist@example.com` |
| Cashier | `cashier` | `cashier@example.com` |
| Inventory Manager | `inventory` | `inventory@example.com` |
| Veterinarian | `vet` | `vet@example.com` |
| Customer | `customer` | `customer@example.com` |
| Payroll Manager | `payroll` | `payroll@example.com` |

Additional customer demo users:

- `customer.maria`
- `customer.ren`
- `customer.ana`
- `customer.leo`

All use `Password123!`.

## 7. Backend Route Audit

`php artisan route:list` completed and reported 477 routes.

Observed route coverage:

- Customer: store/products, checkout/order creation, own orders, own requests, payment upload, notifications, profile/pets.
- Receptionist: customer orders, pending orders, approve/reject/cancel orders, service request approvals, boarding approvals, vet scheduling, booking management.
- Cashier: POS products/services/transaction, pending payment requests, verify/reject payment requests, receipts, history.
- Inventory/Admin inventory: item list, create/update, stock adjustment, logs/history, low-stock, sellable/public inventory.
- Veterinary: appointments, start/complete/update status, medical notes, records, patients, reports.
- Manager: dashboard, staff, sales/inventory/service/payment/customer/veterinary reports.
- Admin: dashboard, users, services, inventory, customers, activity/login logs, reports, payroll, system health.

No duplicate public protected routes were added.
RBAC middleware was preserved.

## 8. Frontend API Audit

Validated:

- `frontend/src/api/client.js` keeps token handling and request behavior.
- `USE_MOCK_DATA` is `false`.
- Shared `normalizeList` already exists in `frontend/src/utils/normalizeList.js` and covers many backend response shapes.
- Static search found no remaining `localhost` or `127.0.0.1` inside `frontend/src` after the API fallback fix.

Remaining non-blocking findings:

- `src/utils/reportExport.js` calls `data.map`; callers should pass arrays or normalize before export.
- Build reports many existing ESLint warnings for unused variables and hook dependency arrays.
- `CustomerStore_old.jsx` and `CustomerStore_backup.jsx` remain in the source tree but are backup/old components.

## 9. Role Workflow Status

- Customer: partial. Seed data supports orders, requests, payment proof states, notifications, pets. Manual browser testing still needed for all UI actions.
- Receptionist: partial. Routes and seeded order/request states exist; stock deduction/restore logic should be tested manually through the UI/API.
- Cashier: partial. POS, payment verification/rejection routes exist; seeded payment states exist. Manual verification needed that payment verification does not deduct stock or complete services.
- Inventory: partial. Inventory data, stock logs, low-stock examples, and routes exist. Manual UI testing still needed.
- Veterinary: partial. Scheduled/in-progress/completed appointment records and medical record exist. Manual UI testing still needed.
- Manager: partial. Reports have real source data. Manual UI/report filters still need review.
- Admin: partial. User, logs, health, and reports routes/data exist. Manual UI testing still needed.
- Payroll: partial. Role and payroll records exist. Manual payroll workflow review still needed.

## 10. What Was Fixed

- Created missing local `pawesome_db`.
- Fixed migration ordering for `inventory_batches` foreign key.
- Added complete local live demo seeder.
- Updated demo credentials to `Password123!`.
- Removed hardcoded localhost fallback from frontend production code.

## 11. What Works

- MySQL connection to `pawesome_db`.
- Laravel cache/config/optimize clears after migrations.
- `php artisan migrate:fresh --seed`.
- `php artisan migrate:status`.
- `php artisan route:list`.
- React production build.
- Local demo database now has live backend data for dashboard/report counts and workflow samples.

## 12. What Does Not Work / Needs Manual Review

- Frontend build has warnings, mostly unused variables and hook dependency warnings.
- DOMPurify package source-map warnings appear during build but do not fail the build.
- Role workflows were validated by schema, routes, seed data, and build checks, not by browser clicking every page.
- Some requested workflow states are unsupported by current database enums:
  - `service_requests` has no direct `scheduled`, `in_progress`, `completed`, or `cancelled` status.
  - POS `payments` has no direct `rejected` status; failed/refunded are supported.

## 13. Commands Run

Backend and database:

- `php artisan config:clear`
- `php artisan cache:clear`
- `php artisan optimize:clear`
- `C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS pawesome_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"`
- `php artisan migrate:status`
- `php artisan migrate:fresh`
- `php artisan db:seed`
- `php artisan migrate:fresh --seed`
- `php artisan route:list`
- MySQL count checks with `C:\xampp\mysql\bin\mysql.exe -u root pawesome_db -e "..."`
- `php -l` on updated seeder files.

Frontend:

- `rg "localhost|127\.0\.0\.1|USE_MOCK_DATA|fake|mock|data\.map" src -g "*.js" -g "*.jsx"`
- `npm run build`

No `npm install` was run because dependencies were already present and the build completed.

## 14. Errors Encountered

1. Missing database:
   - `SQLSTATE[HY000] [1049] Unknown database 'pawesome_db'`
   - Fixed by creating `pawesome_db`.

2. Empty database cache clear:
   - `Table 'pawesome_db.cache' doesn't exist`
   - Resolved after migrations created Laravel cache tables.

3. Migration foreign key failure:
   - `inventory_batches_inventory_item_id_foreign` failed because `inventory_items` did not exist yet.
   - Fixed by deferring the foreign key.

4. Seeder schema mismatch:
   - `Unknown column 'type' in 'field list'` on `pets`.
   - Fixed by not writing `type` in the live demo seeder.

## 15. Final Next Steps

1. Start Laravel locally with `php artisan serve`.
2. Start React locally with `npm start` from `frontend`.
3. Log in with each role account and manually click the primary workflows.
4. For a stricter release-quality pass, address ESLint warnings and run role-based browser/E2E tests.

## 16. Safety Rules Followed

- Did not touch `C:\xampp\mysql\data` manually.
- Did not touch `C:\xampp\mysql\data_corrupt`.
- Did not touch `C:\xampp\mysql\data_old`.
- Did not touch `C:\xampp\mysql\backup`.
- Did not edit XAMPP system files.
- Did not weaken auth or RBAC.
- Did not hardcode production API URLs.
- Did not remove system features.
- Did not replace live backend logic with fake frontend data.

## Demo Login Credentials

Tested: 2026-05-08 21:45:01 +08:00

Login format: email or username plus password. The backend login controller accepts the frontend `login` field and matches it against either `email` or `username`.

Password for all demo accounts: `Password123!`

| Role | Email | Username | Expected Dashboard | API Login/Dashboard |
| --- | --- | --- | --- | --- |
| Admin | `admin@example.com` | `admin` | `/admin` | passed |
| Manager | `manager@example.com` | `manager` | `/manager` | passed |
| Receptionist | `receptionist@example.com` | `receptionist` | `/receptionist` | passed |
| Cashier | `cashier@example.com` | `cashier` | `/cashier` | passed |
| Inventory Manager | `inventory@example.com` | `inventory` | `/inventory` | passed |
| Veterinarian | `vet@example.com` | `vet` | `/veterinary` | passed |
| Customer | `customer@example.com` | `customer` | `/customer` | passed |
| Payroll Manager | `payroll@example.com` | `payroll` | `/payroll` | passed |

## Petshop Inventory Seed Data

- Total inventory items: 126.
- Sellable inventory items: 119.
- Non-sellable/internal clinic supplies: 7.
- Low-stock active examples: 7.
- Categories populated by current schema enum: Food 35, Accessories 30, Grooming 20, Toys 17, Health 19, Services 5.
- Granular requested categories such as Dog Food, Cat Food, Pet Treats, Pet Shampoo, Collars and Leashes, Litter and Hygiene, Veterinary Supplies, Pet Hotel Supplies, and Clinic Consumables are represented through product names/descriptions because the database category enum only supports `Food`, `Accessories`, `Grooming`, `Toys`, `Health`, and `Services`.
- Sample products: Pedigree Adult Dog Food 1.5kg - PHP 320; Whiskas Tuna Cat Food 1.2kg - PHP 290; JerHigh Chicken Stick - PHP 95; Madre de Cacao Pet Shampoo 500ml - PHP 180; Adjustable Dog Collar Small - PHP 120; Cat Litter Sand 5L - PHP 280; Disposable Syringe 3ml - PHP 15.
- Data quality checks passed: no duplicate SKUs, no negative stock, no zero-price inventory products.

## Service Seed Data

- Service catalog table exists: `services`.
- Total services: 90.
- Categories populated include veterinary, grooming, boarding/pet hotel, and medical confinement style services.
- Sample services: General Check-up - PHP 500; Consultation - PHP 450; Vaccination - PHP 800; Deworming - PHP 350; Full Grooming Small Breed - PHP 700; Dog Boarding Small Breed Per Night - PHP 500; Medical Confinement Per Day - PHP 1200.
- Data quality checks passed: no zero-price services.

## Workflow Demo Data

- Users: 19; customers: 9; pets: 12.
- Customer orders: 13; order items: 23.
- Orders by status/payment: approved/paid 2, approved/pending 1, approved/unpaid 2, cancelled/refunded 1, completed/paid 1, paid/paid 1, pending/unpaid 2, rejected/unpaid 3.
- Service requests: 9. Status/payment coverage: pending/pending 2, pending/unpaid 1, approved/pending 1, approved/paid 3, approved/unpaid 1, rejected/unpaid 1.
- Appointments: 6. Status coverage: pending 2, scheduled 1, in_progress 1, completed 2.
- Payments: 7; sales: 17; sale items: 7.
- Inventory logs: 214. Movement types include customer_order, customer_order_rejection, manual_adjustment, pos_sale_deduction, stock_addition, stock_deduction, stock_review, and batch_restock. Older rows have null movement_type from legacy/demo seed data.
- Notifications: 50.
- Medical records: 2. There is no `veterinary_records` table in this schema; veterinary clinical data is stored in `medical_records`.

## Browser End-to-End Workflow Validation

Tested: 2026-05-08 21:45:01 +08:00

- Backend startup: passed. `php artisan serve` is running on `http://127.0.0.1:8000`; `/api/health` returns OK.
- Frontend startup: passed. `npm run dev` is running on `http://localhost:3000`.
- Frontend local API base: `REACT_APP_API_URL=http://localhost:8000/api`; production code fallback remains `/api`, not localhost.
- Login page route exists in React. Direct `/login` dev-server request returned 404 from the dev server fallback, so browser-click validation should start from `/` and navigate/login through the SPA.
- Browser automation limitation: the Browser Use skill requires a Node REPL `js` tool that is not available in this session. API-level E2E validation was completed against the running backend/frontend environment; browser-click status remains partial and should not be considered fully signed off.

API workflow results:

- Customer: API passed. Customer dashboard login passed; store product API returned live database products; customer checkout created order 18; My Orders endpoint passed; customer was blocked from receptionist approval and cashier verification with 403 responses; payment proof upload passed.
- Receptionist: API passed. Receptionist approval of order 18 returned 200 and deducted stock once, from 38 to 37. A prior 500 response was fixed in `Receptionist\CustomerOrderController` by using safe order-number fallbacks.
- Cashier: API passed. Pending payment requests returned 200; verifying order 18 returned 200 and did not change inventory stock, remaining 37 before and after verification. POS products returned 200; POS transaction 21 returned 200 and deducted stock from 37 to 36.
- Inventory: API passed. Dashboard, item list, low stock, and logs returned 200.
- Veterinary: API passed. Dashboard and appointment list returned 200.
- Manager: API passed. Dashboard plus sales, inventory, services, payments, and customers reports returned 200 with live database-backed data.
- Admin: API passed. Dashboard, user management, and system health returned 200.
- Payroll: API login and summary passed.

API errors found:

- Fixed: `GET /api/inventory/public/items?in_stock_only=1` returned 500 because the query selected `inventory_items.*` while grouping only by `inventory_items.id` under MySQL `ONLY_FULL_GROUP_BY`. Fixed by using a correlated subquery for `nearest_expiration`.
- Fixed: `POST /api/receptionist/customer-orders/{id}/approve` and reject/cancel response paths could throw `Undefined property: stdClass::$order_number` when the table used another identifier field. Fixed with safe fallback to `order_number`, `order_id`, `reference_number`, then `id`.
- Observed during broad scripted test: several 429 responses from Laravel throttle after many rapid API calls. Cache was cleared and focused validation was rerun successfully.
- Existing log note: an old/local `check_order_details.php` warning appears in `storage/logs/laravel.log`; it was not part of the validated app route flow.

Console/frontend errors found:

- React dev server compiled with warnings only.
- Warnings include existing unused variables, hook dependency warnings, and DOMPurify source-map warnings.
- No build-blocking frontend error was found.

Fixed issues:

- `app/Services/InventoryService.php`: public inventory query made compatible with MySQL strict group-by mode.
- `app/Http/Controllers/Receptionist/CustomerOrderController.php`: approve/reject/cancel responses now support schemas without `order_number`.
- `database/seeders/PawesomeLiveDemoSeeder.php`: expanded realistic petshop inventory and service catalog seed data.
- `database/seeders/VeterinaryServicesSeeder.php`: made service seeding idempotent and realistic.
- `database/seeders/CashierTestDataSeeder.php`: made cashier sale demo data idempotent.
- `frontend/package.json`: added `npm run dev` script using the existing CRACO start command.

Final validation commands:

- `php artisan route:list`: passed, 477 routes.
- `php artisan migrate:status`: passed, all migrations shown as Ran.
- `npm run build`: passed with warnings.

Role status:

- Customer: partial. API workflow passed; browser-click validation still needed.
- Receptionist: partial. API approval and stock deduction passed; browser-click validation still needed.
- Cashier: partial. API POS and payment verification passed; browser-click validation still needed.
- Inventory: partial. API dashboard/list/low-stock/logs passed; browser-click validation still needed.
- Veterinary: partial. API dashboard/appointments passed; browser-click validation still needed.
- Manager: partial. API reports passed; browser-click validation still needed.
- Admin: partial. API dashboard/users/health passed; browser-click validation still needed.
- Payroll: partial. API summary passed; browser-click validation still needed.

Ready for demo: Partial.

Manual testing still needed:

- Click through each React dashboard in the browser, starting from `http://localhost:3000`.
- Confirm sidebar/menu rendering, logout behavior, and route redirects for every role.
- Confirm customer payment-proof upload UI uses the approved/unpaid state correctly.
- Confirm receptionist order and service request screens render the live data without response-shape errors.
- Confirm cashier POS receipt modal and payment request UI after verification/rejection.
- Confirm manager/admin charts render expected totals despite build warnings.

Safety confirmation:

- Did not touch `C:\xampp\mysql\data`, `C:\xampp\mysql\data_corrupt`, `C:\xampp\mysql\data_old`, or `C:\xampp\mysql\backup`.
- Did not run `php artisan migrate:fresh --seed` during this validation pass.
- Did not weaken authentication or RBAC.
- Did not replace backend live data with fake frontend arrays.
- Did not remove modules, routes, controllers, or features.
- Did not hardcode production API URLs.
