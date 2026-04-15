<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Hotel rooms table
        Schema::create('hotel_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['standard', 'deluxe', 'suite'])->default('standard');
            $table->enum('size', ['small', 'medium', 'large'])->default('medium');
            $table->integer('capacity')->default(1);
            $table->decimal('daily_rate', 10, 2);
            $table->enum('status', ['available', 'occupied', 'maintenance', 'reserved'])->default('available');
            $table->json('amenities')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'type']);
            $table->index(['size', 'status']);
        });

        // Extend boardings table with hotel-specific fields
        Schema::table('boardings', function (Blueprint $table) {
            $table->foreignId('hotel_room_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])->default('pending')->change();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->enum('payment_status', ['pending', 'partial', 'paid'])->default('pending');
            $table->text('special_requests')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->string('emergency_phone')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('actual_check_in')->nullable();
            $table->timestamp('actual_check_out')->nullable();

            $table->index(['hotel_room_id', 'status']);
            $table->index(['check_in', 'check_out']);
            $table->index(['customer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('boardings', function (Blueprint $table) {
            $table->dropForeign(['hotel_room_id']);
            $table->dropForeign(['customer_id']);
            $table->dropColumn([
                'hotel_room_id',
                'customer_id',
                'total_amount',
                'payment_status',
                'special_requests',
                'emergency_contact',
                'emergency_phone',
                'confirmed_at',
                'actual_check_in',
                'actual_check_out'
            ]);
            $table->enum('status', ['checked_in', 'checked_out'])->default('checked_in')->change();
        });

        Schema::dropIfExists('hotel_rooms');
    }
};
