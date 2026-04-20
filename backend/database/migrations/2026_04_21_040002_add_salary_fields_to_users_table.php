<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('base_salary', 12, 2)->nullable()->after('role');
            $table->decimal('hourly_rate', 10, 2)->nullable()->after('base_salary');
            $table->time('work_start_time')->nullable()->after('hourly_rate')->default('08:00');
            $table->time('work_end_time')->nullable()->after('work_start_time')->default('17:00');
            $table->integer('working_days_per_week')->nullable()->after('work_end_time')->default(5);
            $table->string('department')->nullable()->after('working_days_per_week');
            $table->string('position')->nullable()->after('department');
            $table->date('employment_date')->nullable()->after('position');
            $table->enum('employment_status', ['active', 'probationary', 'resigned', 'terminated'])->default('active')->after('employment_date');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'base_salary',
                'hourly_rate',
                'work_start_time',
                'work_end_time',
                'working_days_per_week',
                'department',
                'position',
                'employment_date',
                'employment_status'
            ]);
        });
    }
};
