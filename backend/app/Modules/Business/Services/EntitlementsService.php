<?php

namespace App\Modules\Business\Services;

use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\FeaturedSlot;

class EntitlementsService
{
    public function forBusiness(Business $business): array
    {
        $business->loadMissing('activeSubscription.plan.entitlements');

        $plan = $business->activeSubscription?->plan;
        $limits = $business->planLimits();
        $entitlements = array_replace(
            $limits,
            $plan?->entitlementMap() ?? []
        );

        return [
            'plan' => $plan?->code ?? 'free',
            'tier' => $business->effectiveTier(),
            'status' => $business->activeSubscription?->status ?? 'none',
            'is_trial' => (bool) $business->activeSubscription?->is_trial,
            'trial_ends_at' => $business->activeSubscription?->trial_ends_at?->toIso8601String(),
            'is_verified' => (bool) $business->is_verified,
            'is_featured' => $business->isFeatured(),
            'limits' => $limits,
            'entitlements' => $entitlements,
            'usage' => [
                'photos' => $business->media()->count(),
                'services' => $business->services()->count(),
                'team_members' => $business->businessUsers()->where('status', 'active')->where('role', '!=', 'owner')->count(),
                'branches' => $business->branches()->where('is_active', true)->count(),
            ],
            'featured_slots' => FeaturedSlot::where('business_id', $business->id)
                ->where('status', 'active')
                ->where('ends_at', '>', now())
                ->count(),
        ];
    }

    public function limit(Business $business, string $key, mixed $default = null): mixed
    {
        return $this->forBusiness($business)['entitlements'][$key] ?? $default;
    }

    public function allows(Business $business, string $key): bool
    {
        return (bool) $this->limit($business, $key, false);
    }

    public function canAdd(Business $business, string $usageKey, string $limitKey, int $quantity = 1): bool
    {
        $limit = $this->limit($business, $limitKey);

        if (! is_numeric($limit)) {
            return true;
        }

        $current = (int) ($this->forBusiness($business)['usage'][$usageKey] ?? 0);

        return $current + $quantity <= (int) $limit;
    }
}
