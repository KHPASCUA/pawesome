<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('boardings', function (Blueprint $table) {
            $this->addColumnIfMissing($table, 'customer_email', 'string', ['nullable' => true, 'after' => 'customer_id']);
            $this->addColumnIfMissing($table, 'customer_name', 'string', ['nullable' => true, 'after' => 'customer_email']);
            $this->addColumnIfMissing($table, 'pet_name', 'string', ['nullable' => true, 'after' => 'pet_id']);
            $this->addColumnIfMissing($table, 'pet_type', 'string', ['nullable' => true, 'after' => 'pet_name']);
            $this->addColumnIfMissing($table, 'pet_breed', 'string', ['nullable' => true, 'after' => 'pet_type']);
            $this->addColumnIfMissing($table, 'stay_type', 'string', ['default' => 'hotel_boarding', 'after' => 'pet_breed']);
            $this->addColumnIfMissing($table, 'check_in_time', 'time', ['nullable' => true, 'after' => 'check_in']);
            $this->addColumnIfMissing($table, 'check_out_time', 'time', ['nullable' => true, 'after' => 'check_out']);
            $this->addColumnIfMissing($table, 'boarding_type', 'string', ['nullable' => true, 'after' => 'hotel_room_id']);
            $this->addColumnIfMissing($table, 'feeding_instructions', 'text', ['nullable' => true, 'after' => 'special_requests']);
            $this->addColumnIfMissing($table, 'medication_notes', 'text', ['nullable' => true, 'after' => 'feeding_instructions']);
            $this->addColumnIfMissing($table, 'payment_method', 'string', ['nullable' => true, 'after' => 'payment_status']);
            $this->addColumnIfMissing($table, 'payment_reference', 'string', ['nullable' => true, 'after' => 'payment_method']);
            $this->addColumnIfMissing($table, 'payment_proof', 'string', ['nullable' => true, 'after' => 'payment_reference']);
            $this->addColumnIfMissing($table, 'paid_at', 'timestamp', ['nullable' => true, 'after' => 'payment_proof']);
            $this->addColumnIfMissing($table, 'verified_by', 'unsignedBigInteger', ['nullable' => true, 'after' => 'paid_at']);
            $this->addColumnIfMissing($table, 'cashier_remarks', 'text', ['nullable' => true, 'after' => 'verified_by']);
            $this->addColumnIfMissing($table, 'receipt_number', 'string', ['nullable' => true, 'after' => 'cashier_remarks']);
            $this->addColumnIfMissing($table, 'approved_by', 'unsignedBigInteger', ['nullable' => true, 'after' => 'receipt_number']);
            $this->addColumnIfMissing($table, 'approved_at', 'timestamp', ['nullable' => true, 'after' => 'approved_by']);
            $this->addColumnIfMissing($table, 'rejected_by', 'unsignedBigInteger', ['nullable' => true, 'after' => 'approved_at']);
            $this->addColumnIfMissing($table, 'rejected_at', 'timestamp', ['nullable' => true, 'after' => 'rejected_by']);
            $this->addColumnIfMissing($table, 'rejection_reason', 'text', ['nullable' => true, 'after' => 'rejected_at']);
            $this->addColumnIfMissing($table, 'checked_in_by', 'unsignedBigInteger', ['nullable' => true, 'after' => 'actual_check_in']);
            $this->addColumnIfMissing($table, 'checked_in_at', 'timestamp', ['nullable' => true, 'after' => 'checked_in_by']);
            $this->addColumnIfMissing($table, 'ready_for_pickup_by', 'unsignedBigInteger', ['nullable' => true, 'after' => 'checked_in_at']);
            $this->addColumnIfMissing($table, 'ready_for_pickup_at', 'timestamp', ['nullable' => true, 'after' => 'ready_for_pickup_by']);
            $this->addColumnIfMissing($table, 'checked_out_by', 'unsignedBigInteger', ['nullable' => true, 'after' => 'actual_check_out']);
            $this->addColumnIfMissing($table, 'checked_out_at', 'timestamp', ['nullable' => true, 'after' => 'checked_out_by']);
        });

        $this->alterEnumForMysql('boardings', 'status', [
            'pending', 'approved', 'scheduled', 'confirmed', 'checked_in', 'in_care',
            'ready_for_pickup', 'checked_out', 'completed', 'cancelled', 'rejected',
        ], 'pending');

        $this->alterEnumForMysql('boardings', 'payment_status', [
            'unpaid', 'pending', 'partial', 'paid', 'rejected', 'refunded',
        ], 'unpaid');

        $this->alterEnumForMysql('hotel_rooms', 'status', [
            'available', 'occupied', 'maintenance', 'cleaning', 'reserved', 'inactive',
        ], 'available');

        Schema::table('appointments', function (Blueprint $table) {
            $this->addColumnIfMissing($table, 'payment_status', 'string', ['default' => 'unpaid', 'after' => 'price']);
            $this->addColumnIfMissing($table, 'consultation_fee', 'decimal', ['nullable' => true, 'total' => 10, 'places' => 2, 'after' => 'payment_status']);
            $this->addColumnIfMissing($table, 'diagnosis', 'text', ['nullable' => true, 'after' => 'notes']);
            $this->addColumnIfMissing($table, 'treatment_notes', 'text', ['nullable' => true, 'after' => 'diagnosis']);
            $this->addColumnIfMissing($table, 'prescription', 'text', ['nullable' => true, 'after' => 'treatment_notes']);
            $this->addColumnIfMissing($table, 'vet_remarks', 'text', ['nullable' => true, 'after' => 'prescription']);
        });

        $this->alterEnumForMysql('appointments', 'status', [
            'pending', 'approved', 'scheduled', 'in_progress', 'in_consultation',
            'needs_confinement', 'treated', 'completed', 'cancelled', 'rejected', 'no_show',
        ], 'pending');

        if (!Schema::hasTable('medical_confinements')) {
            Schema::create('medical_confinements', function (Blueprint $table) {
                $table->id();
            $table->foreignId('consultation_id')->constrained('appointments')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('customer_email')->nullable();
            $table->string('customer_name')->nullable();
            $table->foreignId('pet_id')->nullable()->constrained('pets')->nullOnDelete();
            $table->string('pet_name')->nullable();
            $table->foreignId('vet_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('hotel_rooms')->nullOnDelete();
            $table->text('diagnosis');
            $table->text('reason_for_confinement');
            $table->string('urgency_level')->default('normal');
            $table->unsignedInteger('expected_stay_days')->nullable();
            $table->text('treatment_plan')->nullable();
            $table->text('medication_plan')->nullable();
            $table->text('observation_instructions')->nullable();
            $table->text('special_care_instructions')->nullable();
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('final_amount', 10, 2)->nullable();
            $table->string('status')->default('recommended');
            $table->string('payment_status')->default('unpaid');
            $table->string('payment_method')->nullable();
            $table->string('payment_reference')->nullable();
            $table->string('payment_proof')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->text('cashier_remarks')->nullable();
            $table->string('receipt_number')->nullable();
            $table->unsignedBigInteger('rejected_by')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('admitted_by')->nullable();
            $table->timestamp('admitted_at')->nullable();
            $table->unsignedBigInteger('discharge_cleared_by')->nullable();
            $table->timestamp('discharge_cleared_at')->nullable();
            $table->unsignedBigInteger('discharged_by')->nullable();
            $table->timestamp('discharged_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('boarding_care_logs')) {
            Schema::create('boarding_care_logs', function (Blueprint $table) {
                $table->id();
            $table->foreignId('boarding_id')->nullable()->constrained('boardings')->cascadeOnDelete();
            $table->foreignId('confinement_id')->nullable()->constrained('medical_confinements')->cascadeOnDelete();
            $table->foreignId('logged_by')->constrained('users')->cascadeOnDelete();
            $table->string('log_type');
            $table->string('title')->nullable();
            $table->text('notes');
            $table->string('feeding_amount')->nullable();
            $table->text('medication_given')->nullable();
            $table->text('behavior_notes')->nullable();
            $table->text('health_observation')->nullable();
            $table->string('photo_path')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('medical_progress_notes')) {
            Schema::create('medical_progress_notes', function (Blueprint $table) {
                $table->id();
            $table->foreignId('confinement_id')->constrained('medical_confinements')->cascadeOnDelete();
            $table->foreignId('vet_id')->constrained('users')->cascadeOnDelete();
            $table->string('note_type');
            $table->text('diagnosis_update')->nullable();
            $table->text('treatment_given')->nullable();
            $table->text('medication_given')->nullable();
            $table->text('vital_signs')->nullable();
            $table->text('prescription')->nullable();
            $table->text('recommendations')->nullable();
            $table->string('status')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_progress_notes');
        Schema::dropIfExists('boarding_care_logs');
        Schema::dropIfExists('medical_confinements');
    }

    private function addColumnIfMissing(Blueprint $table, string $column, string $type, array $options = []): void
    {
        if (Schema::hasColumn($table->getTable(), $column)) {
            return;
        }

        $definition = match ($type) {
            'text' => $table->text($column),
            'time' => $table->time($column),
            'timestamp' => $table->timestamp($column),
            'unsignedBigInteger' => $table->unsignedBigInteger($column),
            'decimal' => $table->decimal($column, $options['total'] ?? 8, $options['places'] ?? 2),
            default => $table->string($column),
        };

        if (($options['nullable'] ?? false) === true) {
            $definition->nullable();
        }

        if (array_key_exists('default', $options)) {
            $definition->default($options['default']);
        }

        if (isset($options['after'])) {
            $definition->after($options['after']);
        }
    }

    private function alterEnumForMysql(string $table, string $column, array $values, string $default): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $quoted = collect($values)->map(fn ($value) => "'" . str_replace("'", "''", $value) . "'")->implode(',');
        DB::statement("ALTER TABLE {$table} MODIFY {$column} ENUM({$quoted}) NOT NULL DEFAULT '{$default}'");
    }
};
