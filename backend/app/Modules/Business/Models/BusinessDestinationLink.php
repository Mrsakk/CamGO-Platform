<?php

namespace App\Modules\Business\Models;

use App\Models\Destination;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessDestinationLink extends Model
{
    use HasFactory;

    protected $table = 'biz_destination_links';

    protected $fillable = [
        'business_id',
        'destination_id',
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

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class, 'destination_id');
    }
}
