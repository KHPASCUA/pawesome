<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalProgressNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'confinement_id',
        'vet_id',
        'note_type',
        'diagnosis_update',
        'treatment_given',
        'medication_given',
        'vital_signs',
        'prescription',
        'recommendations',
        'status',
    ];

    public const VALID_TYPES = [
        'diagnosis',
        'treatment',
        'medication',
        'observation',
        'progress_update',
        'discharge_clearance',
    ];

    public function confinement()
    {
        return $this->belongsTo(MedicalConfinement::class, 'confinement_id');
    }

    public function veterinarian()
    {
        return $this->belongsTo(User::class, 'vet_id');
    }
}
