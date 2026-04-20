<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            // Add new columns
            $table->foreignId('customer_id')->nullable()->constrained('customers')->after('id');
            $table->foreignId('cashier_id')->nullable()->constrained('users')->after('customer_id');
            $table->string('transaction_number')->unique()->after('cashier_id');
            $table->enum('status', ['pending', 'completed', 'cancelled', 'refunded'])->default('pending')->after('type');
            $table->decimal('subtotal', 12, 2)->default(0)->after('status');
            $table->decimal('tax_amount', 12, 2)->default(0)->after('subtotal');
            $table->decimal('discount_amount', 12, 2)->default(0)->after('tax_amount');
            $table->string('discount_code')->nullable()->after('discount_amount');
            $table->decimal('total_amount', 12, 2)->default(0)->after('discount_amount');
            $table->text('notes')->nullable()->after('total_amount');
            
            // Rename amount to store the calculated total for backward compatibility
            $table->decimal('amount', 12, 2)->change();
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
