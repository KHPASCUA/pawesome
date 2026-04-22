<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds foreign key constraints to sales table for referential integrity.
     */
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Add foreign key for customer_id if not exists
            try {
                $table->foreign('customer_id')
                    ->references('id')
                    ->on('customers')
                    ->onDelete('restrict'); // Prevent deleting customers with sales
            } catch (\Exception $e) {
                // Constraint may already exist
            }

            // Add foreign key for cashier_id if not exists
            try {
                $table->foreign('cashier_id')
                    ->references('id')
                    ->on('users')
                    ->onDelete('restrict');
            } catch (\Exception $e) {
                // Constraint may already exist
            }
        });

        // Add index for faster queries
        Schema::table('sales', function (Blueprint $table) {
            $table->index('status', 'idx_sales_status');
            $table->index('type', 'idx_sales_type');
            $table->index('created_at', 'idx_sales_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex('idx_sales_status');
            $table->dropIndex('idx_sales_type');
            $table->dropIndex('idx_sales_created_at');

            try {
                $table->dropForeign(['customer_id']);
            } catch (\Exception $e) {
                // May not exist
            }

            try {
                $table->dropForeign(['cashier_id']);
            } catch (\Exception $e) {
                // May not exist
            }
        });
    }
};
