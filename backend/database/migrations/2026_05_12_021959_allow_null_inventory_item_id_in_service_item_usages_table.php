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
            // Drop foreign key constraint first
            $table->dropForeign(['inventory_item_id']);
            // Allow NULL values for billing fees (base_service, add_on_service, etc.)
            $table->unsignedBigInteger('inventory_item_id')->nullable()->change();
            // Re-add foreign key constraint allowing NULL
            $table->foreign('inventory_item_id')->references('id')->on('inventory_items')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_item_usages', function (Blueprint $table) {
            // Drop foreign key constraint
            $table->dropForeign(['inventory_item_id']);
            // Make inventory_item_id NOT NULL again
            $table->unsignedBigInteger('inventory_item_id')->nullable(false)->change();
            // Re-add foreign key constraint without NULL
            $table->foreign('inventory_item_id')->references('id')->on('inventory_items');
        });
    }
};
