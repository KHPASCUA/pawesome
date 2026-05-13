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
        Schema::create('boarding_room_reservations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('room_id');
            $table->string('source_type'); // pet_hotel, vet_boarding, vet_confinement
            $table->unsignedBigInteger('source_id');
            $table->unsignedBigInteger('pet_id');
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->enum('status', ['pending', 'approved', 'scheduled', 'checked_in', 'in_stay', 'checked_out', 'cancelled', 'confined'])->default('pending');
            $table->timestamps();
            
            // Foreign keys will be added in a separate migration
            
            // Indexes
            $table->index(['room_id', 'check_in_date', 'check_out_date'], 'room_reservations_dates');
            $table->index(['source_type', 'source_id'], 'room_reservations_source');
            $table->index(['pet_id', 'status'], 'room_reservations_pet_status');
            $table->index('customer_id', 'room_reservations_customer');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boarding_room_reservations');
    }
};
