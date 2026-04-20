<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Medical Records table - core consultation data
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('veterinarian_id')->constrained('users')->onDelete('restrict');
            $table->dateTime('visit_date');
            
            // Structured consultation data
            $table->text('chief_complaint')->nullable(); // Main reason for visit
            $table->text('symptoms')->nullable(); // Observed symptoms
            $table->text('physical_examination')->nullable(); // Physical exam findings
            $table->text('diagnosis')->nullable(); // Primary diagnosis
            $table->text('secondary_diagnosis')->nullable(); // Secondary conditions
            $table->text('treatment_plan')->nullable(); // Treatment plan details
            $table->text('procedure_notes')->nullable(); // Any procedures performed
            $table->text('follow_up_instructions')->nullable(); // Follow-up care
            
            // Vitals
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->decimal('temperature_celsius', 4, 1)->nullable();
            $table->integer('heart_rate')->nullable();
            $table->integer('respiratory_rate')->nullable();
            $table->string('body_condition_score')->nullable(); // e.g., 1-9 scale
            
            // Record management
            $table->enum('status', ['draft', 'finalized', 'locked'])->default('draft');
            $table->boolean('is_editable')->default(true);
            $table->timestamp('locked_at')->nullable();
            $table->foreignId('locked_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('notes')->nullable(); // General notes
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('pet_id');
            $table->index('veterinarian_id');
            $table->index('visit_date');
            $table->index('status');
        });

        // Vaccinations table - vaccination history
        Schema::create('vaccinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->onDelete('cascade');
            $table->foreignId('medical_record_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('veterinarian_id')->constrained('users')->onDelete('restrict');
            
            // Vaccination details
            $table->string('vaccine_name'); // e.g., "Rabies", "DHPP", "Bordetella"
            $table->string('vaccine_type')->nullable(); // e.g., "Core", "Non-core", "Lifestyle"
            $table->string('manufacturer')->nullable();
            $table->string('lot_number')->nullable();
            $table->date('date_administered');
            $table->date('next_due_date')->nullable(); // When next dose is due
            $table->decimal('dosage', 8, 3)->nullable(); // Amount given
            $table->string('dosage_unit')->default('mL'); // mL, mg, etc.
            $table->string('route_of_administration')->nullable(); // Subcutaneous, Intramuscular, etc.
            $table->string('site_of_administration')->nullable(); // Location on body
            
            // Status
            $table->enum('status', ['given', 'pending', 'overdue', 'waived'])->default('given');
            $table->text('notes')->nullable();
            $table->boolean('is_editable')->default(true);
            
            $table->timestamps();
            
            // Indexes
            $table->index('pet_id');
            $table->index('vaccine_name');
            $table->index('date_administered');
            $table->index('next_due_date');
        });

        // Prescriptions table - medication prescriptions
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained()->onDelete('cascade');
            $table->foreignId('veterinarian_id')->constrained('users')->onDelete('restrict');
            
            // Medication details
            $table->string('medication_name'); // e.g., "Amoxicillin"
            $table->string('generic_name')->nullable(); // Generic name if different
            $table->string('medication_type')->nullable(); // Antibiotic, Anti-inflammatory, etc.
            $table->string('dosage'); // e.g., "10mg"
            $table->string('dosage_unit'); // mg, mL, tablet, capsule, etc.
            $table->string('frequency'); // e.g., "Twice daily", "Every 8 hours"
            $table->string('duration'); // e.g., "7 days", "14 days"
            $table->string('route'); // Oral, Topical, Injectable, etc.
            $table->text('instructions')->nullable(); // Special instructions
            
            // Quantity and refills
            $table->decimal('quantity_prescribed', 8, 2);
            $table->string('quantity_unit'); // tablets, mL, etc.
            $table->integer('refills_allowed')->default(0);
            $table->integer('refills_remaining')->default(0);
            
            // Administration tracking
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            
            // Notes
            $table->text('side_effects_notes')->nullable();
            $table->text('pharmacist_notes')->nullable();
            $table->boolean('is_editable')->default(true);
            
            $table->timestamps();
            
            // Indexes
            $table->index('medical_record_id');
            $table->index('medication_name');
            $table->index('is_active');
        });

        // Medical Record Attachments - for documents/images
        Schema::create('medical_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained()->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type'); // image, pdf, document
            $table->string('attachment_type'); // lab_result, xray, document, photo
            $table->text('description')->nullable();
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_attachments');
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('vaccinations');
        Schema::dropIfExists('medical_records');
    }
};
