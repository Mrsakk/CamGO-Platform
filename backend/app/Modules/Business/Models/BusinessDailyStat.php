<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessDailyStat extends Model
{
    use HasFactory;

    protected $table = 'biz_daily_stats';

    protected $fillable = [
        'business_id',
        'date',
        'views',
        'contacts_total',
        'contacts_by_channel',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'views' => 'integer',
            'contacts_total' => 'integer',
            'contacts_by_channel' => 'array',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }
}
