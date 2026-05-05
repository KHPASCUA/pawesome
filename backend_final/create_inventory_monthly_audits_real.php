<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('inventory_monthly_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->string('audit_month'); // e.g., "2026-05"
            $table->integer('system_stock');
            $table->integer('actual_stock')->nullable();
            $table->integer('variance')->default(0);
            $table->string('status')->default('pending');
            $table->string('reason')->nullable();
            $table->timestamps();
            
            // Ensure unique combination of item and month
            $table->unique(['inventory_item_id', 'audit_month']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory_monthly_audits');
    }
};
