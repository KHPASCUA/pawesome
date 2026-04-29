<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add loyalty_points to customers
        if (!Schema::hasColumn('customers', 'loyalty_points')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->integer('loyalty_points')->default(0)->after('address');
            });
        }

        if (!Schema::hasColumn('customers', 'is_active')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->after('loyalty_points');
            });
        }

        // Add barcode to inventory_items
        if (!Schema::hasColumn('inventory_items', 'barcode')) {
            Schema::table('inventory_items', function (Blueprint $table) {
                $table->string('barcode')->nullable()->unique()->after('sku');
            });
        }

        if (!Schema::hasColumn('inventory_items', 'threshold')) {
            Schema::table('inventory_items', function (Blueprint $table) {
                $table->integer('threshold')->default(10)->after('reorder_level');
            });
        }

        if (!Schema::hasColumn('inventory_items', 'category')) {
            Schema::table('inventory_items', function (Blueprint $table) {
                $table->string('category')->nullable()->after('description');
            });
        }

        if (!Schema::hasColumn('inventory_items', 'status')) {
            Schema::table('inventory_items', function (Blueprint $table) {
                $table->string('status')->default('active')->after('expiry_date');
            });
        }

        // Add cashier fields to sales
        if (!Schema::hasColumn('sales', 'customer_id')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null')->after('id');
            });
        }

        if (!Schema::hasColumn('sales', 'product_id')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->foreignId('product_id')->nullable()->constrained('inventory_items')->onDelete('set null')->after('customer_id');
            });
        }

        if (!Schema::hasColumn('sales', 'payment_type')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->string('payment_type')->default('cash')->after('type');
            });
        }

        if (!Schema::hasColumn('sales', 'payment_method')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->string('payment_method')->default('cash')->after('payment_type');
            });
        }

        if (!Schema::hasColumn('sales', 'status')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->string('status')->default('completed')->after('payment_type');
            });
        }

        if (!Schema::hasColumn('sales', 'void_reason')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->text('void_reason')->nullable()->after('notes');
            });
        }

        if (!Schema::hasColumn('sales', 'voided_by')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->string('voided_by')->nullable()->after('void_reason');
            });
        }

        if (!Schema::hasColumn('sales', 'voided_at')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->timestamp('voided_at')->nullable()->after('voided_by');
            });
        }

        if (!Schema::hasColumn('sales', 'cash_amount')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->decimal('cash_amount')->nullable()->after('amount');
            });
        }

        if (!Schema::hasColumn('sales', 'card_amount')) {
            Schema::table('sales', function (Blueprint $table) {
                $table->decimal('card_amount')->nullable()->after('cash_amount');
            });
        }

        // Create gift_cards table
        if (!Schema::hasTable('gift_cards')) {
            Schema::create('gift_cards', function (Blueprint $table) {
                $table->id();
                $table->string('number')->unique();
                $table->decimal('balance', 10, 2)->default(0);
                $table->boolean('is_active')->default(true);
                $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');
                $table->timestamp('issued_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('gift_cards');

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['customer_id', 'product_id', 'payment_type', 'status', 'void_reason', 'voided_by', 'voided_at', 'cash_amount', 'card_amount']);
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn(['barcode', 'threshold', 'category', 'status']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['loyalty_points', 'is_active']);
        });
    }
};
