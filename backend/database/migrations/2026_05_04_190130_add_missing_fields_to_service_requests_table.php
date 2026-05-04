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
        Schema::table('service_requests', function (Blueprint $table) {
            $table->string('customer_email')->nullable()->after('customer_name');
            $table->string('service_type')->nullable()->after('request_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropColumn(['customer_email', 'service_type']);
        });
    }
};
