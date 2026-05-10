<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'name',
        'type',
        'species',
        'breed',
        'age',
        'gender',
        'image',
        'notes',
    ];

    protected $dates = ['deleted_at'];

    /**
     * Scope to get only active pets
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get only archived pets
     */
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function boardings()
    {
        return $this->hasMany(Boarding::class);
    }

    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class)->orderBy('visit_date', 'desc');
    }

    public function vaccinations()
    {
        return $this->hasMany(Vaccination::class)->orderBy('date_administered', 'desc');
    }

    public function groomingAppointments()
    {
        return $this->hasMany(ServiceRequest::class)->where('service_type', 'grooming');
    }

    /**
     * Get latest medical record
     */
    public function latestMedicalRecord()
    {
        return $this->hasOne(MedicalRecord::class)->latest('visit_date');
    }

    /**
     * Get upcoming vaccinations
     */
    public function upcomingVaccinations($days = 30)
    {
        return $this->vaccinations()
            ->whereNotNull('next_due_date')
            ->whereBetween('next_due_date', [now(), now()->addDays($days)])
            ->orderBy('next_due_date');
    }
}
