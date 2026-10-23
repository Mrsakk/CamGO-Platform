<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Http\Resources\PlanResource;
use App\Modules\Business\Http\Resources\SubscriptionRequestResource;
use App\Modules\Business\Http\Resources\SubscriptionResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Plan;
use App\Modules\Business\Models\SubscriptionRequest as SubscriptionRequestModel;
use App\Modules\Business\Services\ProfileScoreService;
use App\Modules\Business\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OwnerSubscriptionController extends ApiController
{
    public function plans(): JsonResponse
    {
        $plans = Plan::with('entitlements')
            ->where('is_active', true)
            ->where('is_public', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return $this->successResponse(
            PlanResource::collection($plans),
            'Plans retrieved successfully'
        );
    }

    public function show(Request $request, ProfileScoreService $profileScore): JsonResponse
    {
        $business = $this->ownerBusiness($request);
        if (!$business) {
            return $this->errorResponse('No business is linked to this account.', 404);
        }

        $business->load([
            'activeSubscription.plan',
            'activeSubscription.payments',
            'subscriptions.plan',
            'subscriptionRequests.requestedPlan',
        ]);

        $latestSubscription = $business->subscriptions->first();
        $pendingRequest = $business->subscriptionRequests
            ->where('status', 'pending')
            ->first();
        $profile = $profileScore->forBusiness($business);

        return $this->successResponse([
            'business' => [
                'id' => $business->id,
                'slug' => $business->slug,
                'name_km' => $business->name_km,
                'name_en' => $business->name_en,
                'tier' => $business->effectiveTier(),
                'billing_tier' => $business->tier,
                'is_verified' => (bool) $business->is_verified,
                'is_featured' => $business->isFeatured(),
                'is_sponsored_category' => $business->isSponsoredCategory(),
                'is_sponsored_province' => $business->isSponsoredProvince(),
                'is_subscription_active' => $business->isSubscriptionActive(),
                'subscription_expires_at' => $business->subscription_expires_at?->toIso8601String(),
                'featured_until' => $business->featured_until?->toIso8601String(),
                'sponsored_category_until' => $business->sponsored_category_until?->toIso8601String(),
                'sponsored_province_until' => $business->sponsored_province_until?->toIso8601String(),
                'is_on_trial' => $business->isOnTrial(),
                'has_used_trial' => $business->hasUsedTrial(),
                'trial_started_at' => $business->trial_started_at?->toIso8601String(),
                'trial_ends_at' => $business->trial_ends_at?->toIso8601String(),
                'plan_limits' => $business->planLimits(),
                'entitlements' => $business->entitlements(),
            ],
            'trial' => [
                'can_start' => $profile['is_trial_eligible']
                    && !$business->hasActivePaidSubscription()
                    && !$business->isOnTrial(),
                'profile_completion' => $profile,
            ],
            'active_subscription' => $business->activeSubscription
                ? new SubscriptionResource($business->activeSubscription)
                : null,
            'latest_subscription' => $latestSubscription
                ? new SubscriptionResource($latestSubscription)
                : null,
            'pending_request' => $pendingRequest
                ? new SubscriptionRequestResource($pendingRequest)
                : null,
        ]);
    }

    public function startTrial(
        Request $request,
        SubscriptionService $subscriptions,
        ProfileScoreService $profileScore,
    ): JsonResponse {
        $business = $this->ownerBusiness($request);
        if (!$business) {
            return $this->errorResponse('No business is linked to this account.', 404);
        }

        $this->authorize('update', $business);

        if ($business->hasActivePaidSubscription()) {
            return $this->errorResponse('A paid subscription is already active.', 422);
        }

        if ($business->isOnTrial()) {
            return $this->errorResponse('A free Pro trial is already active.', 422);
        }

        $profile = $profileScore->forBusiness($business);

        if (!$profile['is_trial_eligible']) {
            return $this->errorResponse(
                'Complete at least 80% of your profile and pass KYC verification before starting the trial.',
                422,
                ['profile_completion' => $profile]
            );
        }

        $result = $subscriptions->activateTrial($business, $request->user());
        $trialDays = (int) ($result['subscription']->plan?->trial_days ?: 30);

        return $this->successResponse([
            'business' => [
                'id' => $result['business']->id,
                'tier' => $result['business']->tier,
                'is_on_trial' => $result['business']->isOnTrial(),
                'has_used_trial' => $result['business']->hasUsedTrial(),
                'trial_started_at' => $result['business']->trial_started_at?->toIso8601String(),
                'trial_ends_at' => $result['business']->trial_ends_at?->toIso8601String(),
            ],
            'subscription' => new SubscriptionResource($result['subscription']),
            'trial_ends_at' => $result['trial_ends_at'],
        ], "Your {$trialDays}-day Pro trial has started.", 201);
    }

    public function requestPlan(Request $request): JsonResponse
    {
        $business = $this->ownerBusiness($request);
        if (!$business) {
            return $this->errorResponse('No business is linked to this account.', 404);
        }

        $validated = $request->validate([
            'plan_id' => [
                'required',
                'integer',
                Rule::exists('biz_plans', 'id')->where(fn ($query) => $query->where('is_active', true)),
            ],
            'contact_phone' => 'nullable|string|max:100',
            'note' => 'nullable|string|max:1000',
        ]);

        $hasPending = SubscriptionRequestModel::where('business_id', $business->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPending) {
            return $this->errorResponse('A subscription request is already pending for this business.', 422);
        }

        $subscriptionRequest = SubscriptionRequestModel::create([
            'business_id' => $business->id,
            'requested_plan_id' => $validated['plan_id'],
            'contact_phone' => $validated['contact_phone'] ?? $business->owner_phone,
            'note' => $validated['note'] ?? null,
            'status' => 'pending',
            'requested_by' => $request->user()->id,
        ]);

        AuditLog::record('subscription_requested', $subscriptionRequest, null, [
            'business_id' => $business->id,
            'plan_id' => $validated['plan_id'],
            'requested_by' => $request->user()->id,
        ]);

        return $this->successResponse(
            new SubscriptionRequestResource($subscriptionRequest->load(['business', 'requestedPlan', 'requester'])),
            'Subscription request submitted successfully',
            201
        );
    }

    public function cancelRequest(Request $request, int $id): JsonResponse
    {
        $business = $this->ownerBusiness($request);
        if (!$business) {
            return $this->errorResponse('No business is linked to this account.', 404);
        }

        $subscriptionRequest = SubscriptionRequestModel::where('business_id', $business->id)->find($id);
        if (!$subscriptionRequest) {
            return $this->errorResponse('Subscription request not found', 404);
        }

        if ($subscriptionRequest->status !== 'pending') {
            return $this->errorResponse('Only pending requests can be canceled.', 422);
        }

        $oldValues = $subscriptionRequest->only(['status']);
        $subscriptionRequest->update(['status' => 'canceled']);

        AuditLog::record('subscription_request_canceled', $subscriptionRequest, $oldValues, [
            'status' => 'canceled',
        ]);

        return $this->successResponse(
            new SubscriptionRequestResource($subscriptionRequest->fresh(['business', 'requestedPlan', 'requester'])),
            'Subscription request canceled successfully'
        );
    }

    private function ownerBusiness(Request $request): ?Business
    {
        $user = $request->user();
        if (empty($user->business_id)) {
            return null;
        }

        $business = Business::find($user->business_id);
        if (!$business) {
            return null;
        }

        $this->authorize('view', $business);

        return $business;
    }
}
