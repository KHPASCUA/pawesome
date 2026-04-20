<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('boardings', function (Blueprint $table) {
            if (!Schema::hasColumn('boardings', 'reminder_sent_at')) {
                $table->timestamp('reminder_sent_at')->nullable()->after('special_requests');
            }
        });
    }

    public function down(): void
    {
        Schema::table('boardings', function (Blueprint $table) {
            $table->dropColumn('reminder_sent_at');
        });
    }
};
