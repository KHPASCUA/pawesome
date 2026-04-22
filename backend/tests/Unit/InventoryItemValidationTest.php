<?php

namespace Tests\Unit;

use App\Models\InventoryItem;
use App\Models\InventoryLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryItemValidationTest extends TestCase
{
    use RefreshDatabase;

    // ============================================
    // Category Validation (P0.2)
    // ============================================

    public function test_invalid_category_gets_corrected_to_accessories(): void
    {
        $item = new InventoryItem([
            'sku' => 'TEST-001',
            'name' => 'Test Item',
            'category' => 'InvalidCategory',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        $item->save();

        $this->assertEquals('Accessories', $item->fresh()->category);
    }

    public function test_all_valid_categories_accepted(): void
    {
        $validCategories = ['Food', 'Accessories', 'Grooming', 'Toys', 'Health', 'Services'];

        foreach ($validCategories as $category) {
            $item = new InventoryItem([
                'sku' => 'CAT-' . uniqid(),
                'name' => $category . ' Item',
                'category' => $category,
                'price' => 100,
                'stock' => 10,
                'reorder_level' => 5,
                'status' => 'active',
            ]);

            $item->save();

            $this->assertEquals($category, $item->fresh()->category);
        }
    }

    // ============================================
    // Status Validation
    // ============================================

    public function test_invalid_status_gets_corrected_to_active(): void
    {
        $item = new InventoryItem([
            'sku' => 'TEST-002',
            'name' => 'Test Item',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'invalid_status',
        ]);

        $item->save();

        $this->assertEquals('active', $item->fresh()->status);
    }

    public function test_valid_statuses_accepted(): void
    {
        $validStatuses = ['active', 'inactive', 'discontinued'];

        foreach ($validStatuses as $status) {
            $item = new InventoryItem([
                'sku' => 'STAT-' . uniqid(),
                'name' => $status . ' Item',
                'category' => 'Food',
                'price' => 100,
                'stock' => 10,
                'reorder_level' => 5,
                'status' => $status,
            ]);

            $item->save();

            $this->assertEquals($status, $item->fresh()->status);
        }
    }

    // ============================================
    // Numeric Validation (P0.5)
    // ============================================

    public function test_negative_stock_gets_corrected_to_zero(): void
    {
        $item = InventoryItem::create([
            'sku' => 'TEST-003',
            'name' => 'Test Item',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        $item->stock = -5;
        $item->save();

        $this->assertEquals(0, $item->fresh()->stock);
    }

    public function test_negative_price_gets_corrected_to_zero(): void
    {
        $item = InventoryItem::create([
            'sku' => 'TEST-004',
            'name' => 'Test Item',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        $item->price = -50;
        $item->save();

        $this->assertEquals(0, $item->fresh()->price);
    }

    public function test_negative_reorder_level_gets_corrected_to_zero(): void
    {
        $item = InventoryItem::create([
            'sku' => 'TEST-005',
            'name' => 'Test Item',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        $item->reorder_level = -3;
        $item->save();

        $this->assertEquals(0, $item->fresh()->reorder_level);
    }

    // ============================================
    // SKU Auto-Generation
    // ============================================

    public function test_empty_sku_gets_auto_generated(): void
    {
        $item = new InventoryItem([
            'sku' => '',
            'name' => 'Auto SKU Test',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        $item->save();

        $this->assertNotNull($item->fresh()->sku);
        $this->assertNotEmpty($item->fresh()->sku);
        $this->assertStringStartsWith('FOO', $item->fresh()->sku); // FOO for Food category
    }

    public function test_provided_sku_is_preserved(): void
    {
        $item = new InventoryItem([
            'sku' => 'CUSTOM-SKU-123',
            'name' => 'Custom SKU Test',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        $item->save();

        $this->assertEquals('CUSTOM-SKU-123', $item->fresh()->sku);
    }

    // ============================================
    // Stock Status Methods
    // ============================================

    public function test_is_low_stock_method(): void
    {
        $lowStockItem = InventoryItem::create([
            'sku' => 'LOW-001',
            'name' => 'Low Stock Item',
            'category' => 'Food',
            'price' => 100,
            'stock' => 3,
            'reorder_level' => 10,
            'status' => 'active',
        ]);

        $normalStockItem = InventoryItem::create([
            'sku' => 'NORM-001',
            'name' => 'Normal Stock Item',
            'category' => 'Food',
            'price' => 100,
            'stock' => 50,
            'reorder_level' => 10,
            'status' => 'active',
        ]);

        $this->assertTrue($lowStockItem->isLowStock());
        $this->assertFalse($normalStockItem->isLowStock());
    }

    public function test_is_out_of_stock_method(): void
    {
        $outOfStockItem = InventoryItem::create([
            'sku' => 'OUT-001',
            'name' => 'Out of Stock',
            'category' => 'Food',
            'price' => 100,
            'stock' => 0,
            'reorder_level' => 10,
            'status' => 'active',
        ]);

        $inStockItem = InventoryItem::create([
            'sku' => 'IN-001',
            'name' => 'In Stock',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        $this->assertTrue($outOfStockItem->isOutOfStock());
        $this->assertFalse($inStockItem->isOutOfStock());
    }

    // ============================================
    // Inventory Value Calculation
    // ============================================

    public function test_get_inventory_value(): void
    {
        $item = InventoryItem::create([
            'sku' => 'VAL-001',
            'name' => 'Value Test',
            'category' => 'Food',
            'price' => 250,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        $this->assertEquals(2500, $item->getInventoryValue());
    }

    // ============================================
    // Stock Movement with Logging
    // ============================================

    public function test_decrement_stock_creates_log(): void
    {
        $item = InventoryItem::create([
            'sku' => 'DEC-001',
            'name' => 'Decrement Test',
            'category' => 'Food',
            'price' => 100,
            'stock' => 20,
            'reorder_level' => 10,
            'status' => 'active',
        ]);

        $item->decrementStock(5, 'Sale #123');

        $this->assertEquals(15, $item->fresh()->stock);

        $this->assertDatabaseHas('inventory_logs', [
            'inventory_item_id' => $item->id,
            'delta' => -5,
            'reason' => 'Sale #123',
            'reference_type' => 'sale',
        ]);
    }

    public function test_increment_stock_creates_log(): void
    {
        $item = InventoryItem::create([
            'sku' => 'INC-001',
            'name' => 'Increment Test',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        $item->incrementStock(20, 'Restock from supplier');

        $this->assertEquals(30, $item->fresh()->stock);

        $this->assertDatabaseHas('inventory_logs', [
            'inventory_item_id' => $item->id,
            'delta' => 20,
            'reason' => 'Restock from supplier',
            'reference_type' => 'restock',
        ]);
    }

    // ============================================
    // Expiration Date Handling
    // ============================================

    public function test_is_expiring_soon_with_future_date(): void
    {
        $item = InventoryItem::create([
            'sku' => 'EXP-001',
            'name' => 'Expiring Soon',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
            'expiry_date' => now()->addDays(15),
        ]);

        $this->assertTrue($item->isExpiringSoon());
    }

    public function test_is_expiring_soon_with_distant_date(): void
    {
        $item = InventoryItem::create([
            'sku' => 'EXP-002',
            'name' => 'Not Expiring Soon',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
            'expiry_date' => now()->addDays(60),
        ]);

        $this->assertFalse($item->isExpiringSoon());
    }

    public function test_is_expiring_soon_with_null_date(): void
    {
        $item = InventoryItem::create([
            'sku' => 'EXP-003',
            'name' => 'No Expiry',
            'category' => 'Accessories', // Non-perishable
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
            'expiry_date' => null,
        ]);

        $this->assertFalse($item->isExpiringSoon());
    }

    // ============================================
    // Scopes
    // ============================================

    public function test_active_scope(): void
    {
        InventoryItem::create([
            'sku' => 'SCOPE-ACT',
            'name' => 'Active',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        InventoryItem::create([
            'sku' => 'SCOPE-INA',
            'name' => 'Inactive',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'inactive',
        ]);

        $activeItems = InventoryItem::active()->get();
        $this->assertCount(1, $activeItems);
        $this->assertEquals('SCOPE-ACT', $activeItems->first()->sku);
    }

    public function test_in_stock_scope(): void
    {
        InventoryItem::create([
            'sku' => 'STOCK-YES',
            'name' => 'In Stock',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        InventoryItem::create([
            'sku' => 'STOCK-NO',
            'name' => 'Out of Stock',
            'category' => 'Food',
            'price' => 100,
            'stock' => 0,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        $inStockItems = InventoryItem::inStock()->get();
        $this->assertCount(1, $inStockItems);
        $this->assertEquals('STOCK-YES', $inStockItems->first()->sku);
    }

    public function test_low_stock_scope(): void
    {
        InventoryItem::create([
            'sku' => 'LOW-NO',
            'name' => 'Not Low',
            'category' => 'Food',
            'price' => 100,
            'stock' => 100,
            'reorder_level' => 10,
            'status' => 'active',
        ]);

        InventoryItem::create([
            'sku' => 'LOW-YES',
            'name' => 'Low Stock',
            'category' => 'Food',
            'price' => 100,
            'stock' => 5,
            'reorder_level' => 10,
            'status' => 'active',
        ]);

        InventoryItem::create([
            'sku' => 'LOW-OUT',
            'name' => 'Out of Stock',
            'category' => 'Food',
            'price' => 100,
            'stock' => 0,
            'reorder_level' => 10,
            'status' => 'active',
        ]);

        $lowStockItems = InventoryItem::lowStock()->get();
        $this->assertCount(1, $lowStockItems);
        $this->assertEquals('LOW-YES', $lowStockItems->first()->sku);
    }
}
