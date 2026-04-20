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
        Schema::table('users', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('profile_image');
            $table->string('gender')->nullable()->after('date_of_birth');
            $table->string('emergency_contact_person')->nullable()->after('gender');
            $table->string('emergency_contact_number')->nullable()->after('emergency_contact_person');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'date_of_birth',
                'gender',
                'emergency_contact_person',
                'emergency_contact_number',
            ]);
        });
    }
};
