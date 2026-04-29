# Pawesome System - Startup Guide

## Prerequisites

- PHP 8.2+
- MySQL 8.0+
- Node.js 18+
- Composer

## 1. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE pawesome_db;
EXIT;
```

## 2. Backend Setup (Laravel)

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Update .env with your database credentials
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=pawesome_db
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Optional: Seed test data
php artisan db:seed

# Start Laravel server
php artisan serve
```

**Backend runs at:** `http://127.0.0.1:8000`

## 3. Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

**Frontend runs at:** `http://localhost:3000`

## 4. API Endpoints

Once both servers are running:

| Service | URL |
|---------|-----|
| Backend API | `http://127.0.0.1:8000/api` |
| Frontend App | `http://localhost:3000` |

## 5. Default Login Credentials

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pawesome.com | password |
| Manager | manager@pawesome.com | password |
| Cashier | cashier@pawesome.com | password |
| Receptionist | receptionist@pawesome.com | password |
| Inventory | inventory@pawesome.com | password |
| Veterinary | vet@pawesome.com | password |
| Customer | customer@pawesome.com | password |

## 6. Test the System

1. Open `http://localhost:3000`
2. Login with any role above
3. Navigate through the dashboard

## Module URLs

| Module | URL Path |
|--------|----------|
| Admin | `/admin` |
| Manager | `/manager` |
| Cashier | `/cashier` |
| Inventory | `/inventory` |
| Receptionist | `/receptionist` |
| Veterinary | `/veterinary` |
| Customer | `/customer` |

## Troubleshooting

### Backend Issues

```bash
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Check routes
php artisan route:list

# Test database connection
php artisan tinker
DB::connection()->getPdo();
```

### Frontend Issues

```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules
npm install

# Restart with fresh port
npm start -- --port 3001
```

### Database Issues

```bash
# Reset and re-run migrations
php artisan migrate:fresh
php artisan migrate:fresh --seed
```

## System Stack

- **Frontend:** React 18 + Vite
- **Backend:** Laravel 12 (PHP 8.2+)
- **Database:** MySQL 8.0+
- **API:** RESTful JSON

## Features Ready

✅ Multi-role authentication (Admin, Manager, Cashier, Receptionist, Inventory, Vet, Customer)
✅ Attendance tracking with Excel export
✅ Payroll management with auto-calculations
✅ Inventory management with stock alerts
✅ POS system with multiple payment methods
✅ Appointment booking (Hotel, Grooming, Vet)
✅ Customer management
✅ Reports and analytics
✅ Telegram bot integration
✅ Chatbot AI assistance
