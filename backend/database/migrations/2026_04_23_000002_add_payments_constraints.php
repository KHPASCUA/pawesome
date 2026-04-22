<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds constraints to payments table for data integrity.
     */
    public function up(): void
    {
        // Add check constraint for valid payment methods
        $validMethods = ['cash', 'credit_card', 'debit_card', 'gcash', 'maya', 'bank_transfer', 'check'];
        
        Schema::table('payments', function (Blueprint $table) {
            // Change payment_method to ENUM if using MySQL
            $table->enum('payment_method', [
                'cash', 'credit_card', 'debit_card', 'gcash', 'maya', 'bank_transfer', 'check'
            ])->default('cash')->change();
        });
        
        // Add check constraint for amount
        if (DB::getDriverName() !== 'sqlite') {
            try {
                DB::statement('ALTER TABLE payments ADD CONSTRAINT chk_amount_positive CHECK (amount > 0)');
            } catch (\Exception $e) {
                // Constraint may already exist
            }
        }
        
        // Add check constraint for change_amount (must be >= 0)
        if (DB::getDriverName() !== 'sqlite') {
            try {
                DB::statement('ALTER TABLE payments ADD CONSTRAINT chk_change_nonnegative CHECK (change_amount >= 0)');
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
        Schema::table('payments', function (Blueprint $table) {
            // Revert to string
            $table->string('payment_method', 50)->default('cash')->change();
        });
    }
};
