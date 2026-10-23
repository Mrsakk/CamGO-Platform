<?php

namespace App\Modules\Business\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeaturedSlot extends Model
{
    protected $table = 'biz_featured_slots';

    protected $fillable = [
        'business_id',
        'slot',
        'category_id',
        'province_id',
        'amount_cents',
        'status',
        'starts_at',
        'ends_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'amount_cents' => 'integer',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Province::class, 'province_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isActive(): bool
    {
        return $this->status === 'active'
            && $this->starts_at->isPast()
            && $this->ends_at->isFuture();
    }
}
