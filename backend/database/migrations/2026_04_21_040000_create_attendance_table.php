<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->time('break_time')->nullable()->default('01:00');
            $table->decimal('total_hours', 5, 2)->nullable()->default(0);
            $table->decimal('overtime_hours', 5, 2)->nullable()->default(0);
            $table->enum('status', ['present', 'absent', 'late', 'early_leave', 'on_leave'])->default('present');
            $table->boolean('is_late')->default(false);
            $table->boolean('is_early_leave')->default(false);
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('salary_rate', 10, 2)->nullable();
            $table->decimal('daily_earnings', 10, 2)->nullable()->default(0);
            $table->timestamps();
            
            $table->unique(['user_id', 'date']);
            $table->index(['date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
};
