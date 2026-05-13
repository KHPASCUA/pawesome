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
        Schema::table('booking_addons', function (Blueprint $table) {
            // Add inventory deduction tracking fields
            $table->timestamp('inventory_deducted_at')->nullable()->after('subtotal');
            $table->unsignedBigInteger('inventory_deducted_by')->nullable()->after('inventory_deducted_at');
            $table->integer('inventory_deducted_quantity')->nullable()->after('inventory_deducted_by');
            $table->enum('deduction_status', ['pending', 'deducted', 'restored'])->default('pending')->after('inventory_deducted_quantity');
            
            // Add indexes
            $table->index('inventory_deducted_at');
            $table->index('deduction_status');
            $table->index('inventory_deducted_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_addons', function (Blueprint $table) {
            $table->dropIndex(['inventory_deducted_at']);
            $table->dropIndex(['deduction_status']);
            $table->dropIndex(['inventory_deducted_by']);
            
            $table->dropColumn([
                'inventory_deducted_at',
                'inventory_deducted_by', 
                'inventory_deducted_quantity',
                'deduction_status'
            ]);
        });
    }
};
