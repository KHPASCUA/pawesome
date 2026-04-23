<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds constraints to hotel_rooms table for data integrity.
     */
    public function up(): void
    {
        Schema::table('hotel_rooms', function (Blueprint $table) {
            // Change status to ENUM
            $table->enum('status', ['available', 'occupied', 'maintenance', 'cleaning', 'reserved'])
                ->default('available')
                ->change();

            // Change size to ENUM
            $table->enum('size', ['small', 'medium', 'large', 'suite'])
                ->default('medium')
                ->change();

            // Change type to ENUM
            $table->enum('type', ['standard', 'deluxe', 'suite', 'kennel', 'cattery'])
                ->default('standard')
                ->change();
        });

        // Add unique index on room_number
        Schema::table('hotel_rooms', function (Blueprint $table) {
            $table->unique('room_number', 'idx_hotel_rooms_number_unique');
            $table->index('status', 'idx_hotel_rooms_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hotel_rooms', function (Blueprint $table) {
            $table->dropUnique('idx_hotel_rooms_number_unique');
            $table->dropIndex('idx_hotel_rooms_status');

            // Revert to strings
            $table->string('status', 50)->default('available')->change();
            $table->string('size', 50)->default('medium')->change();
            $table->string('type', 50)->default('standard')->change();
        });
    }
};
