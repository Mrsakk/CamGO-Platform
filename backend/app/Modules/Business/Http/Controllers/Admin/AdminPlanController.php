<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Http\Resources\PlanResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPlanController extends ApiController
{
    public function index(): JsonResponse
    {
        $this->authorize('managePlans', Business::class);

        $plans = Plan::with('entitlements')
            ->withCount('subscriptions')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return $this->successResponse(
            PlanResource::collection($plans),
            'Plans retrieved successfully'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('managePlans', Business::class);

        $validated = $request->validate($this->rules());
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['features'] = $validated['features'] ?? [];
        $validated['limits'] = $validated['limits'] ?? [];
        $validated['trial_days'] = $validated['trial_days'] ?? 0;
        $validated['price_month_cents'] = $validated['price_month_cents'] ?? (int) round($validated['price_usd'] * 100);
        $validated['price_year_cents'] = $validated['price_year_cents'] ?? ((int) $validated['price_month_cents'] * 12);
        $validated['is_public'] = $validated['is_public'] ?? true;

        $plan = Plan::create($validated);
        $this->syncEntitlements($plan);

        AuditLog::record('billing_plan_created', $plan, null, $plan->only([
            'code',
            'name_km',
            'name_en',
            'price_usd',
            'billing_cycle',
            'is_active',
            'sort_order',
        ]));

        return $this->successResponse(
            new PlanResource($plan),
            'Plan created successfully',
            201
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $this->authorize('managePlans', Business::class);

        $plan = Plan::find($id);
        if (!$plan) {
            return $this->errorResponse('Plan not found', 404);
        }

        $validated = $request->validate($this->rules($plan->id));

        if (array_key_exists('code', $validated) && $validated['code'] !== $plan->code) {
            return $this->errorResponse('Plan code cannot be changed after creation.', 422);
        }

        if (array_key_exists('sort_order', $validated)) {
            $validated['sort_order'] = $validated['sort_order'] ?? 0;
        }

        $oldValues = $plan->only([
            'code',
            'name_km',
            'name_en',
            'price_usd',
            'billing_cycle',
            'is_active',
            'sort_order',
        ]);

        $plan->update($validated);
        $this->syncEntitlements($plan);

        AuditLog::record('billing_plan_updated', $plan, $oldValues, $plan->only([
            'code',
            'name_km',
            'name_en',
            'price_usd',
            'billing_cycle',
            'is_active',
            'sort_order',
        ]));

        return $this->successResponse(
            new PlanResource($plan->fresh()->load(['entitlements'])->loadCount('subscriptions')),
            'Plan updated successfully'
        );
    }

    private function rules(?int $ignoreId = null): array
    {
        return [
            'code' => 'required|string|in:free,pro,premium|unique:biz_plans,code' . ($ignoreId ? ",{$ignoreId}" : ''),
            'name_km' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'description_km' => 'nullable|string',
            'description_en' => 'nullable|string',
            'price_usd' => 'required|numeric|min:0|max:999999',
            'price_month_cents' => 'nullable|integer|min:0',
            'price_year_cents' => 'nullable|integer|min:0',
            'billing_cycle' => 'required|in:none,monthly,yearly',
            'is_public' => 'sometimes|boolean',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'limits' => 'nullable|array',
            'limits.max_photos' => 'nullable|integer|min:1',
            'limits.max_services' => 'nullable|integer|min:1',
            'limits.max_team_members' => 'nullable|integer|min:1',
            'limits.max_branches' => 'nullable|integer|min:1',
            'limits.analytics_days' => 'nullable|integer|min:1',
            'limits.lead_export' => 'nullable|boolean',
            'limits.featured_placement' => 'nullable|boolean',
            'limits.sponsored_placement' => 'nullable|boolean',
            'limits.support_level' => 'nullable|in:community,priority,dedicated',
            'trial_days' => 'nullable|integer|min:0|max:365',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }

    private function syncEntitlements(Plan $plan): void
    {
        $limits = $plan->limits ?? [];

        foreach ($limits as $key => $value) {
            $type = is_bool($value) ? 'boolean' : (is_int($value) ? 'integer' : 'string');

            \App\Modules\Business\Models\PlanEntitlement::updateOrCreate(
                ['plan_id' => $plan->id, 'key' => $key],
                [
                    'value' => is_bool($value) ? ($value ? '1' : '0') : (string) ($value ?? '999999'),
                    'type' => $type,
                ]
            );
        }
    }
}
