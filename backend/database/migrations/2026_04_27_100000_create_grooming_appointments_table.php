<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grooming_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->nullable()->constrained('pets')->nullOnDelete();
            $table->string('pet_name');
            $table->string('service');
            $table->date('appointment_date');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grooming_appointments');
    }
};
