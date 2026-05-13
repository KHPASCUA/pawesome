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
        Schema::create('boarding_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_code')->unique();
            $table->string('room_name');
            $table->string('room_type');
            $table->json('allowed_species');
            $table->integer('max_capacity')->default(1);
            $table->integer('total_rooms')->default(1);
            $table->decimal('daily_rate', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->boolean('customer_selectable')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['room_type', 'is_active']);
            $table->index('customer_selectable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boarding_rooms');
    }
};
