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
        Schema::table('pets', function (Blueprint $table) {
            // Add archiving columns
            if (!Schema::hasColumn('pets', 'status')) {
                $table->enum('status', ['active', 'archived'])->default('active')->after('notes');
            }
            
            if (!Schema::hasColumn('pets', 'archived_at')) {
                $table->timestamp('archived_at')->nullable()->after('status');
            }
            
            if (!Schema::hasColumn('pets', 'archived_by')) {
                $table->unsignedBigInteger('archived_by')->nullable()->after('archived_at');
            }
            
            // Add indexes for performance
            $table->index(['status', 'archived_at']);
            $table->index('archived_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pets', function (Blueprint $table) {
            // Drop archiving columns
            if (Schema::hasColumn('pets', 'status')) {
                $table->dropColumn('status');
            }
            
            if (Schema::hasColumn('pets', 'archived_at')) {
                $table->dropColumn('archived_at');
            }
            
            if (Schema::hasColumn('pets', 'archived_by')) {
                $table->dropColumn('archived_by');
            }
        });
    }
};
