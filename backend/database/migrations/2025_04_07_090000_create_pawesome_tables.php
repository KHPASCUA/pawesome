<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Services table
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2)->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Customers table
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        // Pets table
        Schema::create('pets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('species');
            $table->string('breed')->nullable();
            $table->date('birth_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Appointments table
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('pet_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->foreignId('veterinarian_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['pending', 'approved', 'completed', 'cancelled'])->default('pending');
            $table->dateTime('scheduled_at');
            $table->dateTime('completed_at')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
        });

        // Boarding table
        Schema::create('boardings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->onDelete('cascade');
            $table->dateTime('check_in');
            $table->dateTime('check_out')->nullable();
            $table->enum('status', ['checked_in', 'checked_out'])->default('checked_in');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Sales table
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->decimal('amount', 10, 2);
            $table->enum('type', ['appointment', 'boarding', 'product']);
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Inventory items table
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('stock')->default(0);
            $table->integer('reorder_level')->default(10);
            $table->decimal('price', 10, 2)->default(0);
            $table->date('expiry_date')->nullable();
            $table->timestamps();
        });

        // Inventory logs table
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->integer('delta');
            $table->text('reason')->nullable();
            $table->timestamps();
        });

        // Chatbot logs table
        Schema::create('chatbot_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['inquiry', 'booking', 'general']);
            $table->text('message');
            $table->text('response')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbot_logs');
        Schema::dropIfExists('inventory_logs');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('boardings');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('pets');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('services');
    }
};
