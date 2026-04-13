<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chatbot_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('chatbot_logs', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
            }

            if (!Schema::hasColumn('chatbot_logs', 'role')) {
                $table->string('role')->nullable()->after('user_id');
            }

            if (!Schema::hasColumn('chatbot_logs', 'channel')) {
                $table->string('channel')->default('web')->after('role');
            }

            if (!Schema::hasColumn('chatbot_logs', 'intent')) {
                $table->string('intent')->nullable()->after('type');
            }

            if (!Schema::hasColumn('chatbot_logs', 'scope')) {
                $table->string('scope')->nullable()->after('intent');
            }

            if (!Schema::hasColumn('chatbot_logs', 'user_message')) {
                $table->text('user_message')->nullable()->after('message');
            }

            if (!Schema::hasColumn('chatbot_logs', 'bot_response')) {
                $table->text('bot_response')->nullable()->after('response');
            }

            if (!Schema::hasColumn('chatbot_logs', 'metadata')) {
                $table->json('metadata')->nullable()->after('bot_response');
            }
        });
    }

    public function down(): void
    {
        Schema::table('chatbot_logs', function (Blueprint $table) {
            $columns = [
                'metadata',
                'bot_response',
                'user_message',
                'scope',
                'intent',
                'channel',
                'role',
                'user_id',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('chatbot_logs', $column)) {
                    if ($column === 'user_id') {
                        $table->dropConstrainedForeignId($column);
                    } else {
                        $table->dropColumn($column);
                    }
                }
            }
        });
    }
};
