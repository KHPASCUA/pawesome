<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'telegram_chat_id')) {
                $table->string('telegram_chat_id')->nullable()->after('address');
            }
            if (!Schema::hasColumn('customers', 'notification_preferences')) {
                $table->json('notification_preferences')->nullable()->after('telegram_chat_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['telegram_chat_id', 'notification_preferences']);
        });
    }
};
