<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name_km' => $this->name_km,
            'name_en' => $this->name_en,
            'description_km' => $this->description_km,
            'description_en' => $this->description_en,
            'price_usd' => (float) $this->price_usd,
            'price_month_cents' => (int) $this->price_month_cents,
            'price_year_cents' => (int) $this->price_year_cents,
            'billing_cycle' => $this->billing_cycle,
            'features' => $this->features ?? [],
            'limits' => $this->limits ?: null,
            'entitlements' => $this->whenLoaded('entitlements', fn () => $this->entitlementMap()),
            'trial_days' => (int) $this->trial_days,
            'is_active' => (bool) $this->is_active,
            'sort_order' => (int) $this->sort_order,
            'subscriptions_count' => $this->whenCounted('subscriptions'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
