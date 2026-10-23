<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Business extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ulid',
        'slug',
        'user_id',
        'province_id',
        'category_id',
        'destination_id',
        'name_km',
        'name_en',
        'type',
        'description_km',
        'description_en',
        'cover_image',
        'phone',
        'email',
        'website',
        'latitude',
        'longitude',
        'address_km',
        'address_en',
        'price_range_min',
        'price_range_max',
        'is_active',
        'is_verified',
        'avg_rating',
        'reviews_count',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'price_range_min' => 'float',
            'price_range_max' => 'float',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'avg_rating' => 'float',
            'reviews_count' => 'integer',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($business) {
            if (empty($business->ulid)) {
                $business->ulid = (string) Str::ulid();
            }
            if (empty($business->slug)) {
                $business->slug = Str::slug($business->name_en) . '-' . substr($business->ulid, -6);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }
}
