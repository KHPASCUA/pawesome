# Backend Controller Method → Models / DB Mapping

This document lists controller methods inspected and the primary models, tables, and services they interact with.

## BoardingController
- `index` : Boarding (boardings), Pet (pets), Customer (customers), HotelRoom (hotel_rooms)
- `store` : Boarding (create), HotelRoom (availability check), uses `daily_rate` to compute `total_amount`, NotificationService::notifyBoardingCreated
- `show` : Boarding (with pet, customer, hotel_room)
- `update` : Boarding (update), HotelRoom (availability/conflict checks), recalculates `total_amount`
- `destroy` : Boarding (delete), HotelRoom (status update when checked_in)
- `confirm` / `checkIn` / `checkOut` / `cancel` : Boarding model state transitions, NotificationService::notifyBoardingStatusChange
- `availableRooms` : HotelRoom (hotel_rooms), HotelRoom::isAvailableForDates checks Boarding conflicts
- `currentBoarders` / `todayActivity` : Boarding queries with date filters, Pet, Customer, HotelRoom
- `occupancyStats` : HotelRoom count, Boarding revenue & nights calculations

## Cashier\POSController
- `processTransaction` : Sale (sales), SaleItem (sale_items), Payment (payments), Invoice (invoices), InventoryItem (inventory_items) — updates stock via `decrementStock`, creates InventoryLog entries via model methods
- `getProducts` / `getServices` : InventoryItem (inventory_items), Service (services)
- `getTransaction` / `getTransactions` : Sale with relations (items, payments, invoice, customer, cashier)
- `voidTransaction` : Sale (mark cancelled), InventoryItem::incrementStock, Payment::processRefund, Invoice::cancel
- `downloadInvoice` : Sale -> Invoice (returns invoice data)

## Inventory\DashboardController
- `overview` : InventoryItem (inventory_items), InventoryLog (inventory_logs)
- `items`, `logs`, `showItem`, `storeItem`, `updateItem`, `destroyItem` : CRUD on InventoryItem and InventoryLog
- `publicItems`, `categories`, `showPublicItem` : read-only InventoryItem queries (status active)

## Customer\PortalController
- `overview` : Customer (customers), Pet (pets), Appointment (appointments)
- `pets` : Pet (pets) for authenticated customer
- `appointments` : Appointment (appointments) with relations
- `boardings` / `bookBoarding` : Boarding (boardings)
- `addPet` : Pet create
- `services` / `bookAppointment` : Service (services), Appointment create
- `chatbot` : ChatbotLog (chatbot_logs)

## Receptionist\DashboardController
- `overview` : Appointment (appointments), Customer (customers), Pet (pets)
- `appointments` : Appointment queries with relations
- `customers` : Customer with pets

## PayrollController
- `index`, `store`, `show`, `update`, `destroy` : Payroll (payrolls) model and relations to User
- `generateForPeriod` : creates Payroll records for many users, uses User data (base_salary/hourly_rate)
- `processPayment` : updates payroll status, payment fields
- `myPayroll`, `payslip`, `summary` : read-only payroll queries and aggregations

## NotificationController
- `index`, `store`, `markAsRead`, `markAllAsRead`, `clearAll`, `destroy`, `unreadCount` : Notification (notifications) scoped to user, updates `read` flag and `read_at`

---

## AppointmentController
- `index` : Appointment (appointments) with relations to Customer, Pet, Service, User(veterinarian); filters by status/date/veterinarian/customer
- `show` : Appointment with relations
- `store` : Appointment create (uses Service->price), writes to `appointments` table
- `approve` : updates `appointments.status`, assigns `veterinarian_id` (User), validation against `users` table
- `reschedule` : updates `scheduled_at` and `notes` on Appointment
- `cancel` : updates status to `cancelled`, sets `cancellation_reason`, NotificationService::notifyAppointmentStatusChange
- `complete` : updates status to `completed`, sets `completed_at`, NotificationService::notifyAppointmentStatusChange

## ChatbotWorkflowController
- `bookingOptions` : Reads Customer, Pet, Service tables for options
- `createBooking` : Creates Appointment record (customer->appointments)
- `lookupAppointments` : Searches Appointment with relations; scoped to customer when role=customer
- `searchInventory` : InventoryItem query (name/sku/description) returning limited fields
- `hotelOptions` / `checkHotelAvailability` / `createHotelBooking` : HotelRoom and Boarding interactions (hotel_rooms, boardings), availability queries

## Admin\ServiceController
- `index` / `store` / `update` / `destroy` : CRUD on `services` table via `Service` model

## Admin\ReportsController
- `summary` : Aggregates across `sales`, `appointments`, `customers`, `users`, `pets`, `inventory_items`; uses DB driver-aware date functions for monthly revenue

## Veterinary\DashboardController
- `overview`, `appointments`, `patients`, `appointment`, `history`, `reports`, `receipt` : Appointment and Pet queries, aggregations, and receipt formatting (reads `appointments`, `pets`, `services`)

## AuthController
- `register` : Creates `users` and `customers` records (for customer role), writes `api_token`
- `login` : Validates credentials against `users`, updates `api_token`
- `me` : Reads `users` by `api_token`
- `updateProfile` : Updates `users` table fields
- `changePassword` : Validates current password and updates `password` hash

## AttendanceController
- `index` : Attendance model queries with relations to `users` (user, approver); filters by date/user/department/status
- `store` : Creates `attendance` record, derives `salary_rate` from `users` (base_salary/hourly_rate), writes to `attendances` table
- `show` / `update` / `destroy` : CRUD on `attendances`
- `today` / `statistics` : Aggregations and stats over `attendances`
- `checkIn` : convenience endpoint creating or updating `attendance` for current user/date

## ChatbotController
- `welcome` / `message` : Delegates to Chatbot service classes (`PremiumChatbotService`, `RoleScopeService`, `KnowledgeBaseService`) — reads `chatbot_logs` when logging

## TelegramBotController
- `webhook` : Handles incoming Telegram webhooks, may create/find `users`, call `PremiumChatbotService`, and send messages via external API (no DB writes except `users` linking and possible logs)

## Veterinary\MedicalRecordController
- `index` / `show` / `store` / `update` / `destroy` : CRUD across `medical_records`, with nested `prescriptions` and `vaccinations` operations writing to `prescriptions`, `vaccinations` tables; uses transactions (`DB::beginTransaction`) to ensure integrity
- helper methods: `createPrescription`, `addVaccinationToRecord`, `updatePrescription`, `updateVaccinationRecord` — write to `prescriptions`, `vaccinations`, and optionally `inventory_items` (when prescribing drugs)

## HotelRoomController
- `index` / `store` / `show` / `update` / `destroy` / `setStatus` : CRUD on `hotel_rooms` table; `show` loads related `boardings` via relationship; `destroy` checks for active `boardings` before deletion

## Admin\InventoryController
- `index` / `store` / `show` / `update` / `destroy` / `adjustStock` : Full inventory management; writes to `inventory_items`, `inventory_logs`, and queries `sale_items` to check history before deletion

## Admin\CustomersController
- `index` / `show` / `store` / `update` / `destroy` : CRUD on `customers`; `destroy` checks related `pets`, `appointments`, `boardings` via relationships before deleting
- `pets` / `addPet` : create and list `pets` for a `customer`

## Admin\LoginLogController
- `index` / `statistics` / `recent` / `userLogs` / `userSessions` : Read-only analytics on `login_logs` table; supports pagination and aggregation queries

## Admin\ActivityLogController
- `index` / `statistics` / `show` / `userLogs` / `filters` : Read-only analytics on `activity_logs` table with grouping and filtering

## Admin\ChatbotFaqController & Admin\ChatbotController
- CRUD for `chatbot_faqs` and read-only analytics for `chatbot_logs` respectively

---

Next steps: I will (a) convert `backend-method-to-db-mapping.md` into a CSV if you want machine-parsable output for test generation, and (b) begin adding column-level details (important columns used/updated) for high-risk endpoints (sales, payroll, inventory adjustments, medical records).

Next steps: continue scanning remaining controllers and expand each method with the exact DB tables/columns and service calls. I can also convert this document into a machine-readable CSV for test generation.
