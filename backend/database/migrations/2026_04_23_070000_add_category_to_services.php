<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('category')->default('Other')->after('name');
            $table->integer('duration')->default(0)->after('price');
            $table->boolean('is_active')->default(true)->after('duration');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['category', 'duration', 'is_active']);
        });
    }
};
