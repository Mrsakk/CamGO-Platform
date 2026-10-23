<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Destination extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ulid',
        'slug',
        'province_id',
        'category_id',
        'name_km',
        'name_en',
        'excerpt_km',
        'excerpt_en',
        'description_km',
        'description_en',
        'highlights_km',
        'highlights_en',
        'cover_image',
        'opening_hours_km',
        'opening_hours_en',
        'entrance_fee_km',
        'entrance_fee_en',
        'entrance_fee_usd',
        'is_free',
        'best_time_km',
        'best_time_en',
        'how_to_get_there_km',
        'how_to_get_there_en',
        'latitude',
        'longitude',
        'address_km',
        'address_en',
        'is_published',
        'is_featured',
        'view_count',
        'avg_rating',
        'reviews_count',
        'listable_type',
        'listable_id',
    ];

    protected function casts(): array
    {
        return [
            'highlights_km' => 'array',
            'highlights_en' => 'array',
            'entrance_fee_usd' => 'float',
            'is_free' => 'boolean',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'view_count' => 'integer',
            'avg_rating' => 'float',
            'reviews_count' => 'integer',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($destination) {
            if (empty($destination->ulid)) {
                $destination->ulid = (string) Str::ulid();
            }
            if (empty($destination->slug)) {
                $destination->slug = Str::slug($destination->name_en) . '-' . substr($destination->ulid, -6);
            }
        });
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(DestinationImage::class)->orderBy('order', 'asc');
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function approvedReviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable')->where('status', 'approved');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function favoritedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorites', 'destination_id', 'user_id')
            ->withTimestamps();
    }

    // Phase 2 readiness: attached businesses (e.g. nearby hotels, restaurants)
    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class);
    }

    public function listable(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    public function scopePaid($query)
    {
        return $query->where('is_free', false);
    }

    public function updateRatingStats(): void
    {
        $approved = $this->reviews()->where('status', 'approved');
        $count = $approved->count();
        $avg = $count > 0 ? (float) $approved->avg('rating') : 0.00;

        $this->updateQuietly([
            'reviews_count' => $count,
            'avg_rating' => round($avg, 2),
        ]);
    }
}
