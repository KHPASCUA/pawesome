<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add snapshot fields for historical data visibility
     * 
     * This migration adds snapshot fields to preserve historical data
     * when items are archived, ensuring no data loss for reporting
     */
    public function up(): void
    {
        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->string('item_name_snapshot')->nullable()->after('reference_id')->comment('Snapshot of item name at time of log');
            $table->string('item_sku_snapshot')->nullable()->after('item_name_snapshot')->comment('Snapshot of item SKU at time of log');
            $table->string('item_category_snapshot')->nullable()->after('item_sku_snapshot')->comment('Snapshot of item category at time of log');
        });

        Schema::table('service_item_usages', function (Blueprint $table) {
            $table->string('item_name_snapshot')->nullable()->after('service_type')->comment('Snapshot of item name at time of usage');
            $table->string('item_sku_snapshot')->nullable()->after('item_name_snapshot')->comment('Snapshot of item SKU at time of usage');
            $table->string('pet_name_snapshot')->nullable()->after('item_sku_snapshot')->comment('Snapshot of pet name at time of usage');
            $table->string('service_name_snapshot')->nullable()->after('pet_name_snapshot')->comment('Snapshot of service name at time of usage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->dropColumn('item_name_snapshot');
            $table->dropColumn('item_sku_snapshot');
            $table->dropColumn('item_category_snapshot');
        });

        Schema::table('service_item_usages', function (Blueprint $table) {
            $table->dropColumn('item_name_snapshot');
            $table->dropColumn('item_sku_snapshot');
            $table->dropColumn('pet_name_snapshot');
            $table->dropColumn('service_name_snapshot');
        });
    }
};
