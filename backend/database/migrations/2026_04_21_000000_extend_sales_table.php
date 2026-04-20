<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Check if columns already exist before adding them
            if (!Schema::hasColumn('sales', 'customer_id')) {
                $table->foreignId('customer_id')->nullable()->constrained('customers')->after('id');
            }
            if (!Schema::hasColumn('sales', 'cashier_id')) {
                $table->foreignId('cashier_id')->nullable()->constrained('users')->after('customer_id');
            }
            if (!Schema::hasColumn('sales', 'transaction_number')) {
                $table->string('transaction_number')->unique()->after('cashier_id');
            }
            if (!Schema::hasColumn('sales', 'status')) {
                $table->enum('status', ['pending', 'completed', 'cancelled', 'refunded'])->default('pending')->after('type');
            }
            if (!Schema::hasColumn('sales', 'subtotal')) {
                $table->decimal('subtotal', 12, 2)->default(0)->after('status');
            }
            if (!Schema::hasColumn('sales', 'tax_amount')) {
                $table->decimal('tax_amount', 12, 2)->default(0)->after('subtotal');
            }
            if (!Schema::hasColumn('sales', 'discount_amount')) {
                $table->decimal('discount_amount', 12, 2)->default(0)->after('tax_amount');
            }
            if (!Schema::hasColumn('sales', 'discount_code')) {
                $table->string('discount_code')->nullable()->after('discount_amount');
            }
            if (!Schema::hasColumn('sales', 'total_amount')) {
                $table->decimal('total_amount', 12, 2)->default(0)->after('discount_amount');
            }
            if (!Schema::hasColumn('sales', 'notes')) {
                $table->text('notes')->nullable()->after('total_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropForeign(['cashier_id']);
            $table->dropColumn([
                'customer_id',
                'cashier_id',
                'transaction_number',
                'status',
                'subtotal',
                'tax_amount',
                'discount_amount',
                'discount_code',
                'total_amount',
                'notes',
            ]);
        });
    }
};
