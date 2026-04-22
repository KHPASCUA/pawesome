<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'price',
        'description',
        'is_active',
        'duration',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'duration' => 'integer',
    ];

    /**
     * Valid service categories
     */
    public const VALID_CATEGORIES = ['Grooming', 'Consultation', 'Vaccination', 'Surgery', 'Dental', 'Boarding', 'Other'];

    /**
     * Boot method for model-level validation
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($service) {
            // Validate category
            if (!in_array($service->category, self::VALID_CATEGORIES)) {
                $service->category = 'Other';
            }

            // Ensure non-negative price
            $service->price = max(0, (float) $service->price);

            // Ensure non-negative duration
            $service->duration = max(0, (int) $service->duration);
        });
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Scope: Active services only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: By category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Activate service
     */
    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Deactivate service
     */
    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Get formatted price
     */
    public function getFormattedPrice(): string
    {
        return '₱' . number_format((float) $this->price, 2);
    }

    /**
     * Get duration in minutes with label
     */
    public function getDurationLabel(): string
    {
        if (!$this->duration) {
            return 'N/A';
        }
        return $this->duration . ' min';
    }
}
