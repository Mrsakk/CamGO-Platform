<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $table = 'biz_plans';

    public const CODES = ['free', 'pro', 'premium'];

    protected $fillable = [
        'code',
        'name_km',
        'name_en',
        'description_km',
        'description_en',
        'price_usd',
        'price_month_cents',
        'price_year_cents',
        'billing_cycle',
        'features',
        'limits',
        'trial_days',
        'is_active',
        'is_public',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price_usd' => 'float',
            'price_month_cents' => 'integer',
            'price_year_cents' => 'integer',
            'features' => 'array',
            'limits' => 'array',
            'trial_days' => 'integer',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function limit(string $key, mixed $default = null): mixed
    {
        $entitlement = $this->relationLoaded('entitlements')
            ? $this->entitlements->firstWhere('key', $key)
            : $this->entitlements()->where('key', $key)->first();

        if ($entitlement) {
            return $entitlement->typedValue();
        }

        return data_get($this->limits ?? [], $key, $default);
    }

    public function entitlements(): HasMany
    {
        return $this->hasMany(PlanEntitlement::class, 'plan_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    public function entitlementMap(): array
    {
        $rows = $this->relationLoaded('entitlements')
            ? $this->entitlements
            : $this->entitlements()->get();

        return $rows->mapWithKeys(fn (PlanEntitlement $row) => [$row->key => $row->typedValue()])->all();
    }
}
