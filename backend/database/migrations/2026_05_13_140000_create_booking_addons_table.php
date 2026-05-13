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
        Schema::create('booking_addons', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id');
            $table->unsignedBigInteger('add_on_id');
            $table->unsignedBigInteger('inventory_item_id')->nullable();
            $table->string('name');
            $table->enum('add_on_type', ['inventory_item', 'service']);
            $table->enum('charge_type', ['one_time', 'per_day']);
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->integer('number_of_days')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
            
            // Indexes
            $table->index(['booking_id', 'add_on_id']);
            $table->index('inventory_item_id');
            $table->index('add_on_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_addons');
    }
};
