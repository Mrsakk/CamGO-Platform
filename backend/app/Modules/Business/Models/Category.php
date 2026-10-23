<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $table = 'biz_categories';

    protected $fillable = [
        'name_km',
        'name_en',
        'slug',
        'icon',
        'profile_schema',
        'service_presets',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'profile_schema' => 'array',
            'service_presets' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public static function boot(): void
    {
        parent::boot();

        static::creating(function (self $model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name_en ?: $model->name_km);
            }
        });
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class, 'category_id');
    }
}
