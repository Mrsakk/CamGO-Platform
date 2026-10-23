<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DestinationImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'destination_id',
        'image_path',
        'caption_km',
        'caption_en',
        'is_cover',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'is_cover' => 'boolean',
            'order' => 'integer',
        ];
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }
}
