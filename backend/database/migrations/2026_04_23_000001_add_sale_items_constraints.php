<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds foreign key constraints to sale_items to prevent orphaned records.
     */
    public function up(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            // Add foreign key constraint for product_id if not exists
            if (!Schema::hasColumn('sale_items', 'product_id')) {
                $table->foreignId('product_id')->nullable()->constrained('inventory_items')->onDelete('set null');
            } else {
                // Add constraint if column exists but no FK
                try {
                    $table->foreign('product_id')->references('id')->on('inventory_items')->onDelete('set null');
                } catch (\Exception $e) {
                    // Constraint may already exist
                }
            }
            
            // Add foreign key constraint for service_id if not exists
            if (!Schema::hasColumn('sale_items', 'service_id')) {
                $table->foreignId('service_id')->nullable()->constrained('services')->onDelete('set null');
            } else {
                // Add constraint if column exists but no FK
                try {
                    $table->foreign('service_id')->references('id')->on('services')->onDelete('set null');
                } catch (\Exception $e) {
                    // Constraint may already exist
                }
            }
        });
        
        // Add check constraint for quantity
        if (DB::getDriverName() !== 'sqlite') {
            try {
                DB::statement('ALTER TABLE sale_items ADD CONSTRAINT chk_quantity_positive CHECK (quantity > 0)');
            } catch (\Exception $e) {
                // Constraint may already exist
            }
        }
        
        // Add check constraint for unit_price
        if (DB::getDriverName() !== 'sqlite') {
            try {
                DB::statement('ALTER TABLE sale_items ADD CONSTRAINT chk_unit_price_nonnegative CHECK (unit_price >= 0)');
            } catch (\Exception $e) {
                // Constraint may already exist
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            // Drop foreign keys
            try {
                $table->dropForeign(['product_id']);
            } catch (\Exception $e) {
                // May not exist
            }
            
            try {
                $table->dropForeign(['service_id']);
            } catch (\Exception $e) {
                // May not exist
            }
        });
    }
};
