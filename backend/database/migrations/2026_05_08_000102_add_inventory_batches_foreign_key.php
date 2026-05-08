<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('inventory_batches') || !Schema::hasTable('inventory_items')) {
            return;
        }

        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->foreign('inventory_item_id', 'inventory_batches_inventory_item_id_foreign')
                ->references('id')
                ->on('inventory_items')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('inventory_batches')) {
            return;
        }

        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->dropForeign('inventory_batches_inventory_item_id_foreign');
        });
    }
};
