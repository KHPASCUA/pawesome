<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('service_item_usages', function (Blueprint $table) {
            // Billing fields
            $table->string('item_type')->nullable()->after('notes')->comment('Type of billing item: base_service, add_on_service, inventory_usage, manual_charge, discount');
            $table->string('description')->nullable()->after('item_type')->comment('Description of the billing item');
            $table->decimal('unit_price', 10, 2)->nullable()->after('description')->default(0)->comment('Unit price of the item');
            $table->decimal('total_price', 10, 2)->nullable()->after('unit_price')->default(0)->comment('Total price (quantity * unit_price)');
            $table->boolean('is_billable')->nullable()->after('total_price')->default(false)->comment('Whether this item is billable');
            $table->boolean('is_paid')->nullable()->after('is_billable')->default(false)->comment('Whether this item has been paid');
            
            // Add indexes for performance
            $table->index(['service_type', 'service_id', 'is_billable'], 'service_billing_index');
            $table->index(['is_billable', 'is_paid'], 'billing_payment_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_item_usages', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex('service_billing_index');
            $table->dropIndex('billing_payment_index');
            
            // Drop billing columns
            $table->dropColumn(['item_type', 'description', 'unit_price', 'total_price', 'is_billable', 'is_paid']);
        });
    }
};
