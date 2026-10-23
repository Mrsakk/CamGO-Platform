<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'destination_id',
        'day_number',
        'order_index',
        'name_km',
        'name_en',
        'slug',
        'category',
        'image',
        'time',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'day_number' => 'integer',
            'order_index' => 'integer',
        ];
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }
}
