<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('appointments')) {
            return;
        }

        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('status', [
                'pending',
                'approved',
                'scheduled',
                'in_progress',
                'treated',
                'completed',
                'cancelled',
                'rejected',
                'no_show',
            ])->default('pending')->change();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('appointments')) {
            return;
        }

        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('status', [
                'pending',
                'approved',
                'completed',
                'cancelled',
                'no_show',
            ])->default('pending')->change();
        });
    }
};
