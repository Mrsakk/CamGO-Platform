<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetricDaily extends Model
{
    protected $table = 'biz_metrics_daily';

    protected $fillable = [
        'business_id',
        'date',
        'profile_views',
        'search_impressions',
        'website_clicks',
        'phone_clicks',
        'direction_requests',
        'telegram_clicks',
        'leads_count',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }
}
