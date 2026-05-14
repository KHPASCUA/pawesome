<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('appointments')) {
            Schema::table('appointments', function (Blueprint $table) {
                if (!Schema::hasColumn('appointments', 'base_amount')) {
                    $table->decimal('base_amount', 10, 2)->nullable()->default(0)->after('consultation_fee');
                }
                if (!Schema::hasColumn('appointments', 'additional_charges')) {
                    $table->decimal('additional_charges', 10, 2)->nullable()->default(0)->after('base_amount');
                }
                if (!Schema::hasColumn('appointments', 'total_amount')) {
                    $table->decimal('total_amount', 10, 2)->nullable()->default(0)->after('additional_charges');
                }
                if (!Schema::hasColumn('appointments', 'amount_paid')) {
                    $table->decimal('amount_paid', 10, 2)->nullable()->default(0)->after('total_amount');
                }
                if (!Schema::hasColumn('appointments', 'balance_due')) {
                    $table->decimal('balance_due', 10, 2)->nullable()->default(0)->after('amount_paid');
                }
                if (!Schema::hasColumn('appointments', 'paid_at')) {
                    $table->timestamp('paid_at')->nullable()->after('balance_due');
                }
                if (!Schema::hasColumn('appointments', 'verified_by')) {
                    $table->unsignedBigInteger('verified_by')->nullable()->after('paid_at');
                }
                if (!Schema::hasColumn('appointments', 'cashier_remarks')) {
                    $table->text('cashier_remarks')->nullable()->after('verified_by');
                }
                if (!Schema::hasColumn('appointments', 'receipt_number')) {
                    $table->string('receipt_number')->nullable()->after('cashier_remarks');
                }
            });
        }

        if (Schema::hasTable('groomings')) {
            Schema::table('groomings', function (Blueprint $table) {
                if (!Schema::hasColumn('groomings', 'payment_status')) {
                    $table->string('payment_status')->default('unpaid')->after('amount');
                }
                if (!Schema::hasColumn('groomings', 'base_amount')) {
                    $table->decimal('base_amount', 10, 2)->nullable()->default(0)->after('payment_status');
                }
                if (!Schema::hasColumn('groomings', 'additional_charges')) {
                    $table->decimal('additional_charges', 10, 2)->nullable()->default(0)->after('base_amount');
                }
                if (!Schema::hasColumn('groomings', 'total_amount')) {
                    $table->decimal('total_amount', 10, 2)->nullable()->default(0)->after('additional_charges');
                }
                if (!Schema::hasColumn('groomings', 'amount_paid')) {
                    $table->decimal('amount_paid', 10, 2)->nullable()->default(0)->after('total_amount');
                }
                if (!Schema::hasColumn('groomings', 'balance_due')) {
                    $table->decimal('balance_due', 10, 2)->nullable()->default(0)->after('amount_paid');
                }
                if (!Schema::hasColumn('groomings', 'payment_method')) {
                    $table->string('payment_method')->nullable()->after('balance_due');
                }
                if (!Schema::hasColumn('groomings', 'payment_reference')) {
                    $table->string('payment_reference')->nullable()->after('payment_method');
                }
                if (!Schema::hasColumn('groomings', 'payment_proof')) {
                    $table->string('payment_proof')->nullable()->after('payment_reference');
                }
                if (!Schema::hasColumn('groomings', 'paid_at')) {
                    $table->timestamp('paid_at')->nullable()->after('payment_proof');
                }
                if (!Schema::hasColumn('groomings', 'verified_by')) {
                    $table->unsignedBigInteger('verified_by')->nullable()->after('paid_at');
                }
                if (!Schema::hasColumn('groomings', 'cashier_remarks')) {
                    $table->text('cashier_remarks')->nullable()->after('verified_by');
                }
                if (!Schema::hasColumn('groomings', 'receipt_number')) {
                    $table->string('receipt_number')->nullable()->after('cashier_remarks');
                }
                if (!Schema::hasColumn('groomings', 'completed_at')) {
                    $table->timestamp('completed_at')->nullable()->after('receipt_number');
                }
            });
        }

        if (Schema::hasTable('boardings')) {
            Schema::table('boardings', function (Blueprint $table) {
                if (!Schema::hasColumn('boardings', 'base_amount')) {
                    $table->decimal('base_amount', 10, 2)->nullable()->default(0)->after('status');
                }
                if (!Schema::hasColumn('boardings', 'additional_charges')) {
                    $table->decimal('additional_charges', 10, 2)->nullable()->default(0)->after('base_amount');
                }
                if (!Schema::hasColumn('boardings', 'amount_paid')) {
                    $table->decimal('amount_paid', 10, 2)->nullable()->default(0)->after('total_amount');
                }
                if (!Schema::hasColumn('boardings', 'balance_due')) {
                    $table->decimal('balance_due', 10, 2)->nullable()->default(0)->after('amount_paid');
                }
            });
        }

        if (Schema::hasTable('service_item_usages')) {
            Schema::table('service_item_usages', function (Blueprint $table) {
                if (!Schema::hasColumn('service_item_usages', 'customer_id')) {
                    $table->unsignedBigInteger('customer_id')->nullable()->after('pet_id');
                }
                if (!Schema::hasColumn('service_item_usages', 'customer_email')) {
                    $table->string('customer_email')->nullable()->after('customer_id');
                }
                if (!Schema::hasColumn('service_item_usages', 'usage_type')) {
                    $table->string('usage_type')->nullable()->after('unit');
                }
                if (!Schema::hasColumn('service_item_usages', 'role')) {
                    $table->string('role')->nullable()->after('used_by');
                }
                if (!Schema::hasColumn('service_item_usages', 'charge_amount')) {
                    $table->decimal('charge_amount', 10, 2)->nullable()->default(0)->after('total_price');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('appointments')) {
            Schema::table('appointments', function (Blueprint $table) {
                $columns = ['base_amount', 'additional_charges', 'total_amount', 'amount_paid', 'balance_due', 'paid_at', 'verified_by', 'cashier_remarks', 'receipt_number'];
                $existing = array_values(array_filter($columns, fn ($column) => Schema::hasColumn('appointments', $column)));
                if ($existing) {
                    $table->dropColumn($existing);
                }
            });
        }

        if (Schema::hasTable('groomings')) {
            Schema::table('groomings', function (Blueprint $table) {
                $columns = ['payment_status', 'base_amount', 'additional_charges', 'total_amount', 'amount_paid', 'balance_due', 'payment_method', 'payment_reference', 'payment_proof', 'paid_at', 'verified_by', 'cashier_remarks', 'receipt_number', 'completed_at'];
                $existing = array_values(array_filter($columns, fn ($column) => Schema::hasColumn('groomings', $column)));
                if ($existing) {
                    $table->dropColumn($existing);
                }
            });
        }

        if (Schema::hasTable('boardings')) {
            Schema::table('boardings', function (Blueprint $table) {
                $columns = ['base_amount', 'additional_charges', 'amount_paid', 'balance_due'];
                $existing = array_values(array_filter($columns, fn ($column) => Schema::hasColumn('boardings', $column)));
                if ($existing) {
                    $table->dropColumn($existing);
                }
            });
        }

        if (Schema::hasTable('service_item_usages')) {
            Schema::table('service_item_usages', function (Blueprint $table) {
                $columns = ['customer_id', 'customer_email', 'usage_type', 'role', 'charge_amount'];
                $existing = array_values(array_filter($columns, fn ($column) => Schema::hasColumn('service_item_usages', $column)));
                if ($existing) {
                    $table->dropColumn($existing);
                }
            });
        }
    }
};
