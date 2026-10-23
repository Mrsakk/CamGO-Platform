<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Branch extends Model
{
    protected $table = 'biz_branches';

    protected $fillable = [
        'business_id',
        'name_km',
        'name_en',
        'address_km',
        'address_en',
        'phone',
        'lat',
        'lng',
        'hours',
        'is_primary',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
            'hours' => 'array',
            'is_primary' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }
}
