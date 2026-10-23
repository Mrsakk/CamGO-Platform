<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    public function getCoverImageAttribute($value): ?string
    {
        if (empty($value)) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        $cleanPath = ltrim(preg_replace('/^\/?storage\//', '', $value), '/');
        return Storage::disk('public')->url($cleanPath);
    }

    protected $fillable = [
        'slug',
        'title_km',
        'title_en',
        'description_km',
        'description_en',
        'province_id',
        'location_name_km',
        'location_name_en',
        'cover_image',
        'start_date',
        'end_date',
        'is_featured',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($event) {
            if (empty($event->slug)) {
                $event->slug = Str::slug($event->title_en) . '-' . Str::random(5);
            }
        });
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where(function ($q) {
            $q->where('start_date', '>=', now()->startOfDay())
              ->orWhere('end_date', '>=', now()->startOfDay());
        })->orderBy('start_date', 'asc');
    }
}
