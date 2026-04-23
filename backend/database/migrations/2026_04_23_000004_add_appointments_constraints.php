<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds constraints to appointments table for data integrity.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Ensure valid status values
            $table->enum('status', ['pending', 'approved', 'completed', 'cancelled', 'no_show'])
                ->default('pending')
                ->change();
        });

        // Add indexes for faster queries
        Schema::table('appointments', function (Blueprint $table) {
            $table->index('status', 'idx_appointments_status');
            $table->index('scheduled_at', 'idx_appointments_scheduled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('idx_appointments_status');
            $table->dropIndex('idx_appointments_scheduled_at');

            // Revert to string
            $table->string('status', 50)->default('pending')->change();
        });
    }
};
