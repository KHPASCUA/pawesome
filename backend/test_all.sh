#!/bin/bash

echo "=========================================="
echo "PAWESOME CENTRALIZED DATA FLOW TEST SUITE"
echo "=========================================="
echo ""

# Run migrations
echo "📦 Running migrations..."
php artisan migrate:fresh --seed --force

# Run inventory seeder specifically
echo "📦 Seeding inventory data..."
php artisan db:seed --class=InventorySeeder --force

echo ""
echo "=========================================="
echo "🧪 RUNNING ALL TESTS"
echo "=========================================="
echo ""

# Unit Tests
echo "📋 Unit Tests - Model Validation"
php artisan test --filter=InventoryItemValidationTest --colors=always

echo ""
echo "📋 Feature Tests - Inventory CRUD"
php artisan test --filter=InventoryTest --colors=always

echo ""
echo "📋 Feature Tests - Inventory Dashboard"
php artisan test --filter=InventoryDashboardTest --colors=always

echo ""
echo "📋 Feature Tests - POS & Sales"
php artisan test --filter=POSTest --colors=always

echo ""
echo "=========================================="
echo "🔗 CENTRALIZED DATA FLOW INTEGRATION TEST"
echo "=========================================="
php artisan test --filter=CentralizedDataFlowTest --colors=always

echo ""
echo "=========================================="
echo "📊 FINAL TEST SUMMARY"
echo "=========================================="
php artisan test --colors=always --testdox

echo ""
echo "✅ All tests complete!"
echo ""
echo "To run individual test files:"
echo "  php artisan test --filter=CentralizedDataFlowTest"
echo "  php artisan test --filter=InventoryTest"
echo "  php artisan test --filter=POSTest"
echo ""
