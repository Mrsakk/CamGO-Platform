<?php

namespace App\Modules\Business\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessDocument extends Model
{
    use HasFactory;

    protected $table = 'biz_documents';

    protected $fillable = [
        'business_id',
        'type', // id_card, business_license, other
        'path',
        'file_name',
        'file_size',
        'mime_type',
        'uploaded_by',
        'expires_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'expires_at' => 'date',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
