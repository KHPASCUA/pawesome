<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('customer_orders', 'customer_email')) {
                $table->string('customer_email')->nullable()->after('customer_id')->index();
            }
            if (!Schema::hasColumn('customer_orders', 'customer_name')) {
                $table->string('customer_name')->nullable()->after('customer_email');
            }
            if (!Schema::hasColumn('customer_orders', 'payment_status')) {
                $table->string('payment_status', 30)->default('unpaid')->after('status')->index();
            }
            if (!Schema::hasColumn('customer_orders', 'payment_reference')) {
                $table->string('payment_reference')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('customer_orders', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('payment_proof');
            }
            if (!Schema::hasColumn('customer_orders', 'verified_by')) {
                $table->foreignId('verified_by')->nullable()->after('paid_at')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('customer_orders', 'cashier_remarks')) {
                $table->text('cashier_remarks')->nullable()->after('verified_by');
            }
            if (!Schema::hasColumn('customer_orders', 'receipt_number')) {
                $table->string('receipt_number')->nullable()->after('cashier_remarks')->index();
            }
            if (!Schema::hasColumn('customer_orders', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (!Schema::hasColumn('customer_orders', 'rejected_by')) {
                $table->foreignId('rejected_by')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('customer_orders', 'rejected_at')) {
                $table->timestamp('rejected_at')->nullable()->after('rejected_by');
            }
            if (!Schema::hasColumn('customer_orders', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('rejected_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('customer_orders', function (Blueprint $table) {
            foreach (['verified_by', 'rejected_by'] as $column) {
                if (Schema::hasColumn('customer_orders', $column)) {
                    $table->dropConstrainedForeignId($column);
                }
            }

            $columns = [
                'customer_email',
                'customer_name',
                'payment_status',
                'payment_reference',
                'paid_at',
                'cashier_remarks',
                'receipt_number',
                'approved_at',
                'rejected_at',
                'rejection_reason',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('customer_orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
