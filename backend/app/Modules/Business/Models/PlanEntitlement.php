<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanEntitlement extends Model
{
    protected $table = 'biz_plan_entitlements';

    protected $fillable = [
        'plan_id',
        'key',
        'value',
        'type',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    public function typedValue(): mixed
    {
        return match ($this->type) {
            'boolean' => (bool) (int) $this->value,
            'integer' => (int) $this->value,
            'float' => (float) $this->value,
            default => $this->value,
        };
    }
}
