<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'billing_cycle' => $this->billing_cycle,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'price_usd' => (float) $this->price_usd,
            'currency' => $this->currency,
            'auto_renew' => (bool) $this->auto_renew,
            'is_trial' => (bool) $this->is_trial,
            'trial_starts_at' => $this->trial_starts_at?->toIso8601String(),
            'trial_ends_at' => $this->trial_ends_at?->toIso8601String(),
            'past_due_at' => $this->past_due_at?->toIso8601String(),
            'grace_ends_at' => $this->grace_ends_at?->toIso8601String(),
            'notes' => $this->notes,
            'canceled_at' => $this->canceled_at?->toIso8601String(),
            'is_active' => $this->isActive(),
            'business' => $this->whenLoaded('business', fn () => $this->business ? [
                'id' => $this->business->id,
                'slug' => $this->business->slug,
                'name_km' => $this->business->name_km,
                'name_en' => $this->business->name_en,
                'tier' => $this->business->tier,
                'effective_tier' => $this->business->effectiveTier(),
                'is_verified' => (bool) $this->business->is_verified,
                'is_featured' => $this->business->isFeatured(),
                'is_sponsored_category' => $this->business->isSponsoredCategory(),
                'is_sponsored_province' => $this->business->isSponsoredProvince(),
            ] : null),
            'plan' => $this->whenLoaded('plan', fn () => $this->plan ? [
                'id' => $this->plan->id,
                'code' => $this->plan->code,
                'name_km' => $this->plan->name_km,
                'name_en' => $this->plan->name_en,
                'price_usd' => (float) $this->plan->price_usd,
                'price_month_cents' => (int) $this->plan->price_month_cents,
                'price_year_cents' => (int) $this->plan->price_year_cents,
                'billing_cycle' => $this->plan->billing_cycle,
                'features' => $this->plan->features ?? [],
                'limits' => $this->plan->limits ?: null,
                'trial_days' => (int) $this->plan->trial_days,
            ] : null),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'paid_total' => $this->whenLoaded('payments', fn () => (float) $this->payments->sum('amount_usd')),
            'creator' => $this->whenLoaded('creator', fn () => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ] : null),
            'approver' => $this->whenLoaded('approver', fn () => $this->approver ? [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
