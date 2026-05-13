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
        Schema::create('add_ons', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('add_on_type', ['inventory_item', 'service']);
            $table->enum('charge_type', ['one_time', 'per_day']);
            $table->decimal('unit_price', 10, 2);
            $table->json('species_allowed')->nullable();
            $table->json('size_allowed')->nullable();
            $table->unsignedBigInteger('inventory_item_id')->nullable();
            $table->integer('quantity_per_unit')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index('add_on_type');
            $table->index('inventory_item_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('add_ons');
    }
};
