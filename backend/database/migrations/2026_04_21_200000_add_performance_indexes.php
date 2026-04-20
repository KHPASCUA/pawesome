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
        // Appointments table indexes for common query patterns
        Schema::table('appointments', function (Blueprint $table) {
            if (!Schema::hasIndex('appointments', 'appointments_status_index')) {
                $table->index('status', 'appointments_status_index');
            }
            if (!Schema::hasIndex('appointments', 'appointments_scheduled_at_index')) {
                $table->index('scheduled_at', 'appointments_scheduled_at_index');
            }
            if (!Schema::hasIndex('appointments', 'appointments_customer_id_status_index')) {
                $table->index(['customer_id', 'status'], 'appointments_customer_id_status_index');
            }
            if (!Schema::hasIndex('appointments', 'appointments_veterinarian_id_status_index')) {
                $table->index(['veterinarian_id', 'status'], 'appointments_veterinarian_id_status_index');
            }
            if (!Schema::hasIndex('appointments', 'appointments_scheduled_at_status_index')) {
                $table->index(['scheduled_at', 'status'], 'appointments_scheduled_at_status_index');
            }
        });

        // Pets table indexes
        Schema::table('pets', function (Blueprint $table) {
            if (!Schema::hasIndex('pets', 'pets_customer_id_index')) {
                $table->index('customer_id', 'pets_customer_id_index');
            }
            if (!Schema::hasIndex('pets', 'pets_name_index')) {
                $table->index('name', 'pets_name_index');
            }
        });

        // Sales table indexes
        Schema::table('sales', function (Blueprint $table) {
            if (!Schema::hasIndex('sales', 'sales_type_index')) {
                $table->index('type', 'sales_type_index');
            }
            if (!Schema::hasIndex('sales', 'sales_appointment_id_index')) {
                $table->index('appointment_id', 'sales_appointment_id_index');
            }
            if (!Schema::hasIndex('sales', 'sales_created_at_index')) {
                $table->index('created_at', 'sales_created_at_index');
            }
        });

        // Boardings table indexes
        Schema::table('boardings', function (Blueprint $table) {
            if (!Schema::hasIndex('boardings', 'boardings_status_index')) {
                $table->index('status', 'boardings_status_index');
            }
            if (!Schema::hasIndex('boardings', 'boardings_check_in_index')) {
                $table->index('check_in', 'boardings_check_in_index');
            }
            if (!Schema::hasIndex('boardings', 'boardings_pet_id_index')) {
                $table->index('pet_id', 'boardings_pet_id_index');
            }
        });

        // Inventory logs indexes
        Schema::table('inventory_logs', function (Blueprint $table) {
            if (!Schema::hasIndex('inventory_logs', 'inventory_logs_inventory_item_id_index')) {
                $table->index('inventory_item_id', 'inventory_logs_inventory_item_id_index');
            }
            if (!Schema::hasIndex('inventory_logs', 'inventory_logs_created_at_index')) {
                $table->index('created_at', 'inventory_logs_created_at_index');
            }
        });

        // Chatbot logs indexes
        Schema::table('chatbot_logs', function (Blueprint $table) {
            if (!Schema::hasIndex('chatbot_logs', 'chatbot_logs_type_index')) {
                $table->index('type', 'chatbot_logs_type_index');
            }
            if (!Schema::hasIndex('chatbot_logs', 'chatbot_logs_created_at_index')) {
                $table->index('created_at', 'chatbot_logs_created_at_index');
            }
        });

        // Customers table indexes
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasIndex('customers', 'customers_email_index')) {
                $table->index('email', 'customers_email_index');
            }
            if (!Schema::hasIndex('customers', 'customers_name_index')) {
                $table->index('name', 'customers_name_index');
            }
        });

        // Inventory items indexes
        Schema::table('inventory_items', function (Blueprint $table) {
            if (!Schema::hasIndex('inventory_items', 'inventory_items_sku_index')) {
                $table->index('sku', 'inventory_items_sku_index');
            }
            if (!Schema::hasIndex('inventory_items', 'inventory_items_stock_index')) {
                $table->index('stock', 'inventory_items_stock_index');
            }
            if (!Schema::hasIndex('inventory_items', 'inventory_items_reorder_level_index')) {
                $table->index('reorder_level', 'inventory_items_reorder_level_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['appointments_status_index']);
            $table->dropIndex(['appointments_scheduled_at_index']);
            $table->dropIndex(['appointments_customer_id_status_index']);
            $table->dropIndex(['appointments_veterinarian_id_status_index']);
            $table->dropIndex(['appointments_scheduled_at_status_index']);
        });

        Schema::table('pets', function (Blueprint $table) {
            $table->dropIndex(['pets_customer_id_index']);
            $table->dropIndex(['pets_name_index']);
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex(['sales_type_index']);
            $table->dropIndex(['sales_appointment_id_index']);
            $table->dropIndex(['sales_created_at_index']);
        });

        Schema::table('boardings', function (Blueprint $table) {
            $table->dropIndex(['boardings_status_index']);
            $table->dropIndex(['boardings_check_in_index']);
            $table->dropIndex(['boardings_pet_id_index']);
        });

        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->dropIndex(['inventory_logs_inventory_item_id_index']);
            $table->dropIndex(['inventory_logs_created_at_index']);
        });

        Schema::table('chatbot_logs', function (Blueprint $table) {
            $table->dropIndex(['chatbot_logs_type_index']);
            $table->dropIndex(['chatbot_logs_created_at_index']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['customers_email_index']);
            $table->dropIndex(['customers_name_index']);
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropIndex(['inventory_items_sku_index']);
            $table->dropIndex(['inventory_items_stock_index']);
            $table->dropIndex(['inventory_items_reorder_level_index']);
        });
    }
};
