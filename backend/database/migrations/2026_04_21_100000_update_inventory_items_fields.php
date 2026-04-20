<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            // Add category if not exists
            if (!Schema::hasColumn('inventory_items', 'category')) {
                $table->string('category')->default('general')->after('name');
            }
            
            // Add description if not exists
            if (!Schema::hasColumn('inventory_items', 'description')) {
                $table->text('description')->nullable()->after('category');
            }
            
            // Add status if not exists
            if (!Schema::hasColumn('inventory_items', 'status')) {
                $table->enum('status', ['active', 'inactive', 'discontinued'])->default('active')->after('expiry_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn(['category', 'description', 'status']);
        });
    }
};
