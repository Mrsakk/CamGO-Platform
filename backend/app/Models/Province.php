<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Province extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug',
        'name_km',
        'name_en',
        'code',
        'description_km',
        'description_en',
        'image',
        'latitude',
        'longitude',
        'area_km2',
        'population',
        'is_featured',
        'order',
    ];

    protected $appends = [
        'image_url',
    ];

    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image)) {
            return null;
        }

        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        return Storage::disk('public')->url($this->image);
    }

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'area_km2' => 'float',
            'population' => 'integer',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ];
    }

    public function destinations(): HasMany
    {
        return $this->hasMany(Destination::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc')->orderBy('name_en', 'asc');
    }
}
