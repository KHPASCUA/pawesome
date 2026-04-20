<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'medical_record_id',
        'file_name',
        'file_path',
        'file_type',
        'attachment_type',
        'description',
        'uploaded_by',
    ];

    // Attachment types
    const TYPE_LAB_RESULT = 'lab_result';
    const TYPE_XRAY = 'xray';
    const TYPE_ULTRASOUND = 'ultrasound';
    const TYPE_DOCUMENT = 'document';
    const TYPE_PHOTO = 'photo';
    const TYPE_OTHER = 'other';

    /**
     * Relationships
     */
    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get attachment types for dropdown
     */
    public static function getAttachmentTypes(): array
    {
        return [
            self::TYPE_LAB_RESULT => 'Lab Result',
            self::TYPE_XRAY => 'X-Ray',
            self::TYPE_ULTRASOUND => 'Ultrasound',
            self::TYPE_DOCUMENT => 'Document',
            self::TYPE_PHOTO => 'Photo',
            self::TYPE_OTHER => 'Other',
        ];
    }
}
