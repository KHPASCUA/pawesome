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
        Schema::create('inventory_monthly_audits', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('inventory_item_id');

            $table->integer('system_stock')->default(0);
            $table->integer('actual_stock')->default(0);
            $table->integer('variance')->default(0);

            $table->string('audit_month');
            $table->string('status')->default('matched');
            $table->text('reason')->nullable();
            $table->string('checked_by')->nullable();

            $table->timestamps();

            $table->foreign('inventory_item_id')
                ->references('id')
                ->on('inventory_items')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_monthly_audits');
    }
};
