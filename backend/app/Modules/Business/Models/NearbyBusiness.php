<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NearbyBusiness extends Model
{
    protected $table = 'biz_nearby';

    protected $fillable = [
        'business_id',
        'nearby_business_id',
        'distance_km',
    ];

    protected function casts(): array
    {
        return [
            'distance_km' => 'float',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    public function nearbyBusiness(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'nearby_business_id');
    }
}
