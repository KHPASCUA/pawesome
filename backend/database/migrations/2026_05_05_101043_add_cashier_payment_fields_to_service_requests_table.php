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
            if (!Schema::hasColumn('service_requests', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('payment_status');
            }

            if (!Schema::hasColumn('service_requests', 'verified_by')) {
                $table->unsignedBigInteger('verified_by')->nullable()->after('paid_at');
            }

            if (!Schema::hasColumn('service_requests', 'cashier_remarks')) {
                $table->text('cashier_remarks')->nullable()->after('verified_by');
            }

            if (!Schema::hasColumn('service_requests', 'receipt_number')) {
                $table->string('receipt_number')->nullable()->after('cashier_remarks');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            foreach (['receipt_number', 'cashier_remarks', 'verified_by', 'paid_at'] as $column) {
                if (Schema::hasColumn('service_requests', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
