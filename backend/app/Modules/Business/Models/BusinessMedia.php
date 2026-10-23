<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class BusinessMedia extends Model
{
    use HasFactory;

    protected $table = 'biz_media';

    protected $fillable = [
        'business_id',
        'path',
        'path_800',
        'path_400',
        'alt_km',
        'alt_en',
        'sort_order',
        'is_cover',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_cover' => 'boolean',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    public function getUrlAttribute(): string
    {
        return $this->formatUrl($this->path);
    }

    public function getUrl800Attribute(): ?string
    {
        return $this->path_800 ? $this->formatUrl($this->path_800) : $this->url;
    }

    public function getUrl400Attribute(): ?string
    {
        return $this->path_400 ? $this->formatUrl($this->path_400) : $this->url;
    }

    private function formatUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        return Storage::disk('public')->url($path);
    }
}
