<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds constraints to boardings table for data integrity.
     */
    public function up(): void
    {
        Schema::table('boardings', function (Blueprint $table) {
            // Change status to ENUM
            $table->enum('status', ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])
                ->default('pending')
                ->change();

            // Change payment_status to ENUM
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'refunded'])
                ->default('pending')
                ->change();
        });

        // Add indexes for faster queries
        Schema::table('boardings', function (Blueprint $table) {
            $table->index('status', 'idx_boardings_status');
            $table->index('check_in', 'idx_boardings_check_in');
            $table->index(['hotel_room_id', 'status'], 'idx_boardings_room_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('boardings', function (Blueprint $table) {
            $table->dropIndex('idx_boardings_status');
            $table->dropIndex('idx_boardings_check_in');
            $table->dropIndex('idx_boardings_room_status');

            // Revert to strings
            $table->string('status', 50)->default('pending')->change();
            $table->string('payment_status', 50)->default('pending')->change();
        });
    }
};
