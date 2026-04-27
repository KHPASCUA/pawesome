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
        Schema::create('groomings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pet_id')->constrained()->cascadeOnDelete();
            $table->string('service');
            $table->date('appointment_date');
            $table->string('appointment_time')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('status')->default('pending');
            $table->timestamps();
            
            $table->index(['customer_id', 'status']);
            $table->index(['appointment_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('groomings');
    }
};
