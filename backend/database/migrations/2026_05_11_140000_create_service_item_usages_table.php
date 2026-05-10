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
        if (!Schema::hasTable('service_item_usages')) {
            Schema::create('service_item_usages', function (Blueprint $table) {
                $table->id();
                $table->enum('service_type', ['veterinary', 'grooming', 'boarding', 'cashier'])->default('veterinary');
                $table->foreignId('service_id')->nullable()->comment('Reference to appointment, grooming, boarding, or sale ID');
                $table->foreignId('appointment_id')->nullable()->constrained('vet_appointments')->onDelete('set null');
                $table->foreignId('pet_id')->nullable()->constrained('pets')->onDelete('set null');
                $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('restrict');
                $table->foreignId('batch_id')->nullable()->constrained('inventory_batches')->onDelete('set null');
                $table->integer('quantity_used')->unsigned()->comment('Quantity of inventory item used');
                $table->string('unit')->nullable()->comment('Unit of measurement (pcs, ml, mg, etc.)');
                $table->foreignId('used_by')->nullable()->constrained('users')->onDelete('set null');
                $table->text('notes')->nullable()->comment('Usage notes or purpose');
                $table->timestamps();
                
                // Indexes for performance
                $table->index(['service_type', 'service_id']);
                $table->index(['appointment_id', 'pet_id']);
                $table->index('inventory_item_id');
                $table->index('created_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_item_usages');
    }
};
