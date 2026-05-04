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
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->string('batch_no')->nullable();
            $table->date('received_date');
            $table->date('expiration_date')->nullable();
            $table->integer('quantity');
            $table->integer('remaining_quantity');
            $table->enum('status', ['active', 'expired', 'depleted', 'disposed'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['inventory_item_id', 'status']);
            $table->index('expiration_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_batches');
    }
};
