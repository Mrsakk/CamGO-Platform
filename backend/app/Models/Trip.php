<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'ulid',
        'user_id',
        'title',
        'title_en',
        'province',
        'days_count',
        'notes',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'days_count' => 'integer',
            'is_public' => 'boolean',
        ];
    }

    protected static function booted()
    {
        static::creating(function ($trip) {
            if (empty($trip->ulid)) {
                $trip->ulid = (string) Str::ulid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(TripItem::class)->orderBy('day_number')->orderBy('order_index');
    }
}
