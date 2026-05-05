<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('inventory_logs', 'movement_type')) {
                $table->string('movement_type')->nullable()->after('reference_type')->index();
            }
            if (!Schema::hasColumn('inventory_logs', 'type')) {
                $table->string('type')->nullable()->after('movement_type');
            }
            if (!Schema::hasColumn('inventory_logs', 'quantity')) {
                $table->integer('quantity')->nullable()->after(Schema::hasColumn('inventory_logs', 'delta') ? 'delta' : 'inventory_item_id');
            }
            if (!Schema::hasColumn('inventory_logs', 'stock_before')) {
                $table->integer('stock_before')->nullable()->after('quantity');
            }
            if (!Schema::hasColumn('inventory_logs', 'stock_after')) {
                $table->integer('stock_after')->nullable()->after('stock_before');
            }
            if (!Schema::hasColumn('inventory_logs', 'previous_stock')) {
                $table->integer('previous_stock')->nullable()->after(Schema::hasColumn('inventory_logs', 'stock_after') ? 'stock_after' : 'quantity');
            }
            if (!Schema::hasColumn('inventory_logs', 'new_stock')) {
                $table->integer('new_stock')->nullable()->after('previous_stock');
            }
            if (!Schema::hasColumn('inventory_logs', 'reference_id')) {
                $table->unsignedBigInteger('reference_id')->nullable()->after('reference_type')->index();
            }
            if (!Schema::hasColumn('inventory_logs', 'reference')) {
                $table->string('reference')->nullable()->after('reference_id');
            }
            if (!Schema::hasColumn('inventory_logs', 'performed_by')) {
                $table->string('performed_by')->nullable()->after(Schema::hasColumn('inventory_logs', 'reference') ? 'reference' : 'reason');
            }
            if (!Schema::hasColumn('inventory_logs', 'role')) {
                $table->string('role')->nullable()->after('performed_by');
            }
            if (!Schema::hasColumn('inventory_logs', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('role')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('inventory_logs', 'details')) {
                $table->json('details')->nullable()->after('user_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('inventory_logs', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_logs', 'user_id')) {
                $table->dropConstrainedForeignId('user_id');
            }

            foreach (['movement_type', 'type', 'quantity', 'stock_before', 'stock_after', 'previous_stock', 'new_stock', 'reference', 'performed_by', 'role', 'reference_id', 'details'] as $column) {
                if (Schema::hasColumn('inventory_logs', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
