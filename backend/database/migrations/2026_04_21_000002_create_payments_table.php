<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
            $table->string('payment_number')->unique();
            $table->enum('payment_method', ['cash', 'credit_card', 'debit_card', 'gcash', 'maya', 'bank_transfer', 'check']);
            $table->string('card_type')->nullable(); // visa, mastercard, amex
            $table->string('card_last_four')->nullable();
            $table->string('reference_number')->nullable(); // For GCash, Maya, bank transfer
            $table->decimal('amount', 12, 2);
            $table->decimal('change_amount', 12, 2)->default(0);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['sale_id', 'status']);
            $table->index('payment_method');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
