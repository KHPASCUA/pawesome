# Dashboard → Component → API → Controller → DB Mapping

This document maps visible dashboards to frontend components, the API endpoints they call, the likely backend controllers, and primary DB tables involved. Use this as the source of truth for E2E test design.

## Admin Dashboard
- Route: `/admin`
- Frontend components: `AdminDashboard`, `AdminSidebar`, `NotificationDropdown`, `RoleAwareChatbot` (frontend/src/components/admin/AdminDashboard.jsx)
- API calls: `GET /admin/dashboard`
- Backend controller: `App\\Http\\Controllers\\Admin\\DashboardController` (backend/app/Http/Controllers/Admin/DashboardController.php)
- Primary DB tables: `users`, `customers`, `appointments`, `invoices`, `inventory_items`, `activity_logs`, `login_logs`

## Manager Dashboard
- Route: `/manager`
- Frontend components: `ManagerDashboard`, `ManagerSidebar`, `NotificationDropdown` (frontend/src/components/manager/ManagerDashboard.jsx)
- API calls: `GET /manager/dashboard`, `GET /manager/staff`, boarding API `GET /boardings/occupancy` (via `boardingApi`)
- Backend controller: `App\\Http\\Controllers\\Manager\\DashboardController` and staff endpoints (backend/routes/api.php)
- Primary DB tables: `users` (staff), `appointments`, `boardings`, `hotel_rooms`, `payroll`, `attendance`

## Veterinary (Vet) Dashboard
- Route: `/veterinary` or `/vet`
- Frontend components: `VetDashboard`, `VeterinarySidebar`, `NotificationDropdown` (frontend/src/components/veterinary/VetDashboard.jsx)
- API calls: `GET /veterinary/dashboard`, `GET /veterinary/boardings/current-boarders`
- Backend controller: `App\\Http\\Controllers\\Veterinary\\DashboardController`, `BoardingController`
- Primary DB tables: `appointments`, `medical_records`, `boardings`, `pets`, `customers`

## Cashier Dashboard
- Route: `/cashier`
- Frontend components: `CashierDashboard`, `CashierSidebar`, `NotificationDropdown` (frontend/src/components/cashier/CashierDashboard.jsx)
- API calls: `GET /cashier/dashboard`
- Backend controller: `App\\Http\\Controllers\\Cashier\\DashboardController` (or POSController)
- Primary DB tables: `sales`, `sale_items`, `payments`, `invoices`, `customers`

## Inventory Dashboard
- Route: `/inventory`
- Frontend components: `InventoryDashboard`, `InventorySidebar`, `NotificationDropdown` (frontend/src/components/inventory/InventoryDashboard.jsx)
- API calls: `GET /inventory/dashboard` (auto-refresh)
- Backend controller: `App\\Http\\Controllers\\Inventory\\DashboardController`
- Primary DB tables: `inventory_items`, `inventory_logs`, `suppliers`, `inventory_categories`

## Customer Dashboard
- Route: `/customer`
- Frontend components: `CustomerDashboard`, `CustomerSidebar`, `NotificationDropdown` (frontend/src/components/customers/CustomerDashboard.jsx)
- API calls: `GET /customer/overview`
- Backend controller: `App\\Http\\Controllers\\Customer\\PortalController` or `CustomerController`
- Primary DB tables: `customers`, `pets`, `bookings`, `appointments`, `loyalty_points`

## Payroll (Admin) Dashboard
- Route: `/payroll` (admin-payroll module)
- Frontend components: `AdminPayroll`, `EmployeeSalaryManagement`, `PayrollReports`
- API calls: `GET /payroll/*` (module endpoints)
- Backend controller: `App\\Http\\Controllers\\PayrollController` / admin payroll controllers
- Primary DB tables: `payrolls`, `attendance`, `users`, `payroll_schedules`

## Receptionist Dashboard
- Route: `/receptionist`
- Frontend components: `ReceptionistDashboard`, `AppointmentList`, `CheckInForm`, `ReceptionistBookings` (frontend/src/components/receptionist/*)
- API calls: `GET /receptionist/appointments`, `POST /receptionist/checkin`, `POST /receptionist/checkout`, booking endpoints
- Backend controller: `App\\Http\\Controllers\\Receptionist\\*` (Appointment handling, Booking controllers)
- Primary DB tables: `appointments`, `boardings`, `hotel_rooms`, `customers`, `checkins`, `checkouts`

---
Next steps:
- Expand mapping to list exact controller method names and service functions (backend scan).
- Generate per-dashboard E2E test templates and seed/teardown scripts.
