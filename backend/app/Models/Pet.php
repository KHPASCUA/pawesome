<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'name',
        'species',
        'breed',
        'age',
    ];

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
