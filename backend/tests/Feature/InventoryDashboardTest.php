<?php

namespace Tests\Feature;

use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    /**
     * Test dashboard overview endpoint returns correct statistics
     */
    public function test_dashboard_overview_returns_correct_stats(): void
    {
        // Create test data
        InventoryItem::create(['sku' => 'D1', 'name' => 'Food 1', 'category' => 'Food', 'price' => 100, 'stock' => 50, 'reorder_level' => 10, 'status' => 'active']);
        InventoryItem::create(['sku' => 'D2', 'name' => 'Toy 1', 'category' => 'Toys', 'price' => 200, 'stock' => 30, 'reorder_level' => 10, 'status' => 'active']);
        InventoryItem::create(['sku' => 'D3', 'name' => 'Low Stock', 'category' => 'Food', 'price' => 150, 'stock' => 5, 'reorder_level' => 10, 'status' => 'active']);
        InventoryItem::create(['sku' => 'D4', 'name' => 'Out of Stock', 'category' => 'Food', 'price' => 100, 'stock' => 0, 'reorder_level' => 10, 'status' => 'active']);
        InventoryItem::create(['sku' => 'D5', 'name' => 'Inactive', 'category' => 'Food', 'price' => 100, 'stock' => 20, 'reorder_level' => 10, 'status' => 'inactive']);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/inventory/dashboard/overview');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_items',
                    'total_inventory_value',
                    'low_stock_count',
                    'out_of_stock_count',
                    'category_breakdown',
                    'recent_activity',
                ]
            ]);
    }

    /**
     * Test low stock items endpoint
     */
    public function test_low_stock_items_endpoint(): void
    {
        InventoryItem::create(['sku' => 'L1', 'name' => 'Normal', 'category' => 'Food', 'price' => 100, 'stock' => 100, 'reorder_level' => 10, 'status' => 'active']);
        InventoryItem::create(['sku' => 'L2', 'name' => 'Low Stock A', 'category' => 'Food', 'price' => 100, 'stock' => 3, 'reorder_level' => 10, 'status' => 'active']);
        InventoryItem::create(['sku' => 'L3', 'name' => 'Low Stock B', 'category' => 'Toys', 'price' => 100, 'stock' => 5, 'reorder_level' => 10, 'status' => 'active']);
        InventoryItem::create(['sku' => 'L4', 'name' => 'Out of Stock', 'category' => 'Food', 'price' => 100, 'stock' => 0, 'reorder_level' => 10, 'status' => 'active']);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/inventory/dashboard/low-stock');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data'); // Only 2 low stock (not out of stock)
    }

    /**
     * Test category breakdown is accurate
     */
    public function test_category_breakdown_accuracy(): void
    {
        foreach (['Food', 'Accessories', 'Grooming', 'Toys', 'Health'] as $category) {
            InventoryItem::create([
                'sku' => 'CAT-' . strtoupper(substr($category, 0, 3)) . '-1',
                'name' => $category . ' Item',
                'category' => $category,
                'price' => 100,
                'stock' => 10,
                'reorder_level' => 5,
                'status' => 'active',
            ]);
        }

        $response = $this->actingAs($this->admin)
            ->getJson('/api/inventory/dashboard/overview');

        $response->assertStatus(200);

        $categories = $response->json('data.category_breakdown');
        $this->assertCount(5, $categories);
    }

    /**
     * Test inventory value calculation
     */
    public function test_inventory_value_calculation(): void
    {
        InventoryItem::create(['sku' => 'V1', 'name' => 'Item 1', 'category' => 'Food', 'price' => 100, 'stock' => 10, 'reorder_level' => 5, 'status' => 'active']); // 1000
        InventoryItem::create(['sku' => 'V2', 'name' => 'Item 2', 'category' => 'Food', 'price' => 200, 'stock' => 5, 'reorder_level' => 3, 'status' => 'active']);  // 1000
        InventoryItem::create(['sku' => 'V3', 'name' => 'Item 3', 'category' => 'Toys', 'price' => 50, 'stock' => 20, 'reorder_level' => 10, 'status' => 'active']); // 1000
        // Total: 3000

        $response = $this->actingAs($this->admin)
            ->getJson('/api/inventory/dashboard/overview');

        $response->assertStatus(200);

        // Total value should be approximately 3000
        $totalValue = $response->json('data.total_inventory_value');
        $this->assertEquals(3000, $totalValue);
    }

    /**
     * Test recent activity endpoint
     */
    public function test_recent_activity_endpoint(): void
    {
        $item = InventoryItem::create([
            'sku' => 'ACT-001',
            'name' => 'Activity Test',
            'category' => 'Food',
            'price' => 100,
            'stock' => 10,
            'reorder_level' => 5,
            'status' => 'active',
        ]);

        // Add some activity logs
        InventoryLog::create([
            'inventory_item_id' => $item->id,
            'delta' => 5,
            'reason' => 'Restock',
            'reference_type' => 'restock',
        ]);

        InventoryLog::create([
            'inventory_item_id' => $item->id,
            'delta' => -2,
            'reason' => 'Sale',
            'reference_type' => 'sale',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/inventory/dashboard/recent-activity');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test stock movement reporting
     */
    public function test_stock_movement_report(): void
    {
        $item = InventoryItem::create([
            'sku' => 'MOVE-001',
            'name' => 'Movement Test',
            'category' => 'Food',
            'price' => 100,
            'stock' => 20,
            'reorder_level' => 10,
            'status' => 'active',
        ]);

        // Simulate various stock movements
        $item->decrementStock(3, 'Sale #123');
        $item->decrementStock(2, 'Sale #124');
        $item->incrementStock(10, 'Weekly delivery');

        $logs = InventoryLog::where('inventory_item_id', $item->id)->get();

        $this->assertCount(4, $logs); // Initial + 3 movements
        $this->assertEquals(25, $item->fresh()->stock); // 20 - 3 - 2 + 10
    }
}
