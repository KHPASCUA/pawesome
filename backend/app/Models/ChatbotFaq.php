<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatbotFaq extends Model
{
    use HasFactory;

    protected $fillable = [
        'question',
        'answer',
        'keywords',
        'category',
        'scope',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'keywords' => 'array',
    ];

    /**
     * Valid FAQ categories
     */
    public const VALID_CATEGORIES = ['general', 'services', 'pricing', 'booking', 'policies', 'medical', 'grooming'];

    /**
     * Boot method for model-level validation
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($faq) {
            // Validate category
            if ($faq->category && !in_array($faq->category, self::VALID_CATEGORIES)) {
                $faq->category = 'general';
            }
        });
    }
}
