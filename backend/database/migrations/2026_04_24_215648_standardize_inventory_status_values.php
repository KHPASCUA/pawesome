<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update old status values to new standardized values
        DB::table('inventory_items')
            ->where('status', 'In stock')
            ->update(['status' => 'active']);

        DB::table('inventory_items')
            ->where('status', 'Low stock')
            ->update(['status' => 'active']);

        DB::table('inventory_items')
            ->where('status', 'Out of stock')
            ->update(['status' => 'active']);

        // Set any remaining null or invalid statuses to active
        DB::table('inventory_items')
            ->whereNull('status')
            ->orWhereNotIn('status', ['active', 'inactive', 'discontinued'])
            ->update(['status' => 'active']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
