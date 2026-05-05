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
            if (!Schema::hasColumn('pets', 'age')) {
                $table->integer('age')->nullable()->after('breed');
            }
            if (!Schema::hasColumn('pets', 'gender')) {
                $table->string('gender')->nullable()->after('age');
            }
            if (!Schema::hasColumn('pets', 'image')) {
                $table->string('image')->nullable()->after('gender');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pets', function (Blueprint $table) {
            if (Schema::hasColumn('pets', 'age')) {
                $table->dropColumn('age');
            }
            if (Schema::hasColumn('pets', 'gender')) {
                $table->dropColumn('gender');
            }
            if (Schema::hasColumn('pets', 'image')) {
                $table->dropColumn('image');
            }
        });
    }
};
