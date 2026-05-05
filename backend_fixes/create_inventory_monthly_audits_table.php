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
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->string('audit_month'); // Format: YYYY-MM
            $table->integer('system_stock')->default(0);
            $table->integer('actual_stock')->nullable();
            $table->integer('variance')->default(0);
            $table->string('status')->default('pending'); // pending, matched, discrepancy
            $table->text('reason')->nullable();
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
