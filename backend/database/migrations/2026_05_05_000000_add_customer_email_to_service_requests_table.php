<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('service_requests') && !Schema::hasColumn('service_requests', 'customer_email')) {
            Schema::table('service_requests', function (Blueprint $table) {
                $table->string('customer_email')->nullable()->after('customer_name')->index();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('service_requests') && Schema::hasColumn('service_requests', 'customer_email')) {
            Schema::table('service_requests', function (Blueprint $table) {
                $table->dropColumn('customer_email');
            });
        }
    }
};
