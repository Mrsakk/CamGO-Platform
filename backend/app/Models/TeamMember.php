<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class TeamMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_km',
        'role_en',
        'role_km',
        'image',
        'order',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    public function getImageAttribute($value): ?string
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

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
