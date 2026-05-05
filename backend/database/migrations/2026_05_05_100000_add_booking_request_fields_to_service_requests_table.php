<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('service_requests', 'customer_id')) {
                $table->unsignedBigInteger('customer_id')->nullable()->after('id');
            }

            if (!Schema::hasColumn('service_requests', 'customer_name')) {
                $table->string('customer_name')->nullable()->after('customer_id');
            }

            if (!Schema::hasColumn('service_requests', 'customer_email')) {
                $table->string('customer_email')->nullable()->after('customer_name');
            }

            if (!Schema::hasColumn('service_requests', 'pet_id')) {
                $table->unsignedBigInteger('pet_id')->nullable()->after('customer_email');
            }

            if (!Schema::hasColumn('service_requests', 'pet_name')) {
                $table->string('pet_name')->nullable()->after('pet_id');
            }

            if (!Schema::hasColumn('service_requests', 'service_type')) {
                $table->string('service_type')->nullable()->after('pet_name');
            }

            // Add preferred_date/time as aliases for request_date/time
            if (!Schema::hasColumn('service_requests', 'preferred_date')) {
                $table->date('preferred_date')->nullable()->after('service_type');
            }

            if (!Schema::hasColumn('service_requests', 'preferred_time')) {
                $table->time('preferred_time')->nullable()->after('preferred_date');
            }

            if (!Schema::hasColumn('service_requests', 'notes')) {
                $table->text('notes')->nullable()->after('preferred_time');
            }

            if (!Schema::hasColumn('service_requests', 'status')) {
                $table->string('status')->default('pending')->after('notes');
            }
        });
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            foreach ([
                'status',
                'notes',
                'preferred_time',
                'preferred_date',
                'service_type',
                'pet_name',
                'pet_id',
                'customer_email',
                'customer_name',
                'customer_id',
            ] as $column) {
                if (Schema::hasColumn('service_requests', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
