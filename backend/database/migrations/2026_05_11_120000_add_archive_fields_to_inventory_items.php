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
        Schema::table('inventory_items', function (Blueprint $table) {
            // Archive/discontinue fields
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active')->change();
            $table->timestamp('archived_at')->nullable()->after('status');
            $table->foreignId('archived_by')->nullable()->after('archived_at')->constrained('users')->onDelete('set null');
            $table->text('archive_reason')->nullable()->after('archived_by');
            
            // Categorization flags
            $table->boolean('is_service_consumable')->default(false)->after('is_sellable');
            $table->boolean('requires_expiry_tracking')->default(false)->after('is_service_consumable');
            $table->enum('issue_method', ['FIFO', 'FEFO', 'Manual'])->default('FEFO')->after('requires_expiry_tracking');
            
            // Indexes for performance
            $table->index(['status', 'archived_at']);
            $table->index('is_service_consumable');
            $table->index('issue_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            // Drop new columns
            $table->dropColumn(['archived_at', 'archived_by', 'archive_reason']);
            $table->dropColumn(['is_service_consumable', 'requires_expiry_tracking', 'issue_method']);
            
            // Drop indexes
            $table->dropIndex(['status', 'archived_at']);
            $table->dropIndex('is_service_consumable');
            $table->dropIndex('issue_method');
            
            // Revert status to original string type
            $table->string('status')->default('In Stock')->change();
        });
    }
};
