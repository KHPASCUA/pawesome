<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds constraints to inventory_items.category to prevent invalid data insertion.
     */
    public function up(): void
    {
        // First, normalize existing invalid categories to valid ones
        $validCategories = ['Food', 'Accessories', 'Grooming', 'Toys', 'Health', 'Services'];
        
        // Update any invalid categories to 'Accessories' (default fallback)
        DB::table('inventory_items')
            ->whereNotIn('category', $validCategories)
            ->update(['category' => 'Accessories']);
        
        // For MySQL: Use ENUM for strict category validation
        // For PostgreSQL/SQLite: Use CHECK constraint via raw SQL
        Schema::table('inventory_items', function (Blueprint $table) {
            // Change category to ENUM with valid values
            // This will throw error on invalid data insertion
            $table->enum('category', ['Food', 'Accessories', 'Grooming', 'Toys', 'Health', 'Services'])
                ->default('Accessories')
                ->change();
        });
        
        // Add additional constraints for data integrity
        Schema::table('inventory_items', function (Blueprint $table) {
            // Ensure stock cannot be negative
            if (DB::getDriverName() !== 'sqlite') {
                DB::statement('ALTER TABLE inventory_items ADD CONSTRAINT chk_stock_nonnegative CHECK (stock >= 0)');
            }
            
            // Ensure price cannot be negative
            if (DB::getDriverName() !== 'sqlite') {
                DB::statement('ALTER TABLE inventory_items ADD CONSTRAINT chk_price_nonnegative CHECK (price >= 0)');
            }
            
            // Ensure reorder_level cannot be negative
            if (DB::getDriverName() !== 'sqlite') {
                DB::statement('ALTER TABLE inventory_items ADD CONSTRAINT chk_reorder_nonnegative CHECK (reorder_level >= 0)');
            }
        });
        
        // Add index on category for faster filtering
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->index('category', 'idx_inventory_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            // Drop the index
            $table->dropIndex('idx_inventory_category');
        });
        
        // Revert category back to string (less strict)
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->string('category', 50)->default('Accessories')->change();
        });
        
        // Note: CHECK constraints are automatically dropped in MySQL when column changes
        // For PostgreSQL, explicit removal would be needed
    }
};
