<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Http\Resources\SubscriptionRequestResource;
use App\Modules\Business\Http\Resources\SubscriptionResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Plan;
use App\Modules\Business\Models\SubscriptionRequest as SubscriptionRequestModel;
use App\Modules\Business\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminSubscriptionRequestController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('manageBilling', Business::class);

        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);

        $query = SubscriptionRequestModel::with(['business', 'requestedPlan', 'requester', 'approver'])
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('business', function ($businessQuery) use ($search) {
                $businessQuery->where('name_km', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate($perPage)->withQueryString();
        $paginator->through(fn (SubscriptionRequestModel $item) => (new SubscriptionRequestResource($item))->resolve($request));

        return $this->paginateResponse($paginator, 'Subscription requests retrieved successfully');
    }

    public function approve(Request $request, int $id, SubscriptionService $service): JsonResponse
    {
        $this->authorize('manageBilling', Business::class);

        $subscriptionRequest = SubscriptionRequestModel::with('business')->find($id);
        if (!$subscriptionRequest) {
            return $this->errorResponse('Subscription request not found', 404);
        }

        if ($subscriptionRequest->status !== 'pending') {
            return $this->errorResponse('Only pending requests can be approved.', 422);
        }

        $validated = $request->validate([
            'plan_id' => 'nullable|integer|exists:biz_plans,id',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'price_usd' => 'nullable|numeric|min:0',
            'auto_renew' => 'sometimes|boolean',
            'admin_note' => 'nullable|string|max:1000',
            'payment' => 'nullable|array',
            'payment.amount_usd' => 'nullable|numeric|min:0',
            'payment.amount_cents' => 'nullable|integer|min:0',
            'payment.currency' => 'nullable|string|size:3',
            'payment.method' => 'nullable|in:cash,bank_transfer,aba,wing,khqr,other',
            'payment.reference_no' => 'nullable|string|max:255',
            'payment.receipt_no' => 'nullable|string|max:255',
            'payment.status' => 'nullable|in:pending,recorded,verified,rejected,voided',
            'payment.paid_at' => 'nullable|date',
            'payment.notes' => 'nullable|string|max:1000',
        ]);

        $plan = Plan::find($validated['plan_id'] ?? $subscriptionRequest->requested_plan_id);
        if (!$plan) {
            return $this->errorResponse('A valid plan is required to approve this request.', 422);
        }

        $result = DB::transaction(function () use ($request, $subscriptionRequest, $validated, $plan, $service) {
            $data = Arr::except($validated, ['plan_id', 'admin_note']);
            if (empty($data['notes'])) {
                $data['notes'] = $subscriptionRequest->note;
            }

            $activation = $service->activate(
                $subscriptionRequest->business,
                $plan,
                $data,
                $request->user()
            );

            $oldValues = $subscriptionRequest->only(['status', 'approved_by', 'approved_at', 'admin_note']);

            $subscriptionRequest->update([
                'status' => 'approved',
                'requested_plan_id' => $plan->id,
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'admin_note' => $validated['admin_note'] ?? null,
            ]);

            AuditLog::record('subscription_request_approved', $subscriptionRequest, $oldValues, [
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'plan_id' => $plan->id,
                'subscription_id' => $activation['subscription']->id,
                'admin_note' => $validated['admin_note'] ?? null,
            ]);

            return $activation;
        });

        Cache::forget('admin:business:stats:overview');
        Cache::forget('admin:billing:stats');

        return $this->successResponse([
            'request' => new SubscriptionRequestResource(
                $subscriptionRequest->fresh(['business', 'requestedPlan', 'requester', 'approver'])
            ),
            'subscription' => new SubscriptionResource($result['subscription']),
            'warning' => $result['warning'],
        ], 'Subscription request approved successfully');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $this->authorize('manageBilling', Business::class);

        $subscriptionRequest = SubscriptionRequestModel::find($id);
        if (!$subscriptionRequest) {
            return $this->errorResponse('Subscription request not found', 404);
        }

        if ($subscriptionRequest->status !== 'pending') {
            return $this->errorResponse('Only pending requests can be rejected.', 422);
        }

        $validated = $request->validate([
            'admin_note' => 'required|string|max:1000',
        ]);

        $oldValues = $subscriptionRequest->only(['status', 'approved_by', 'approved_at', 'admin_note']);

        $subscriptionRequest->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'admin_note' => $validated['admin_note'],
        ]);

        AuditLog::record('subscription_request_rejected', $subscriptionRequest, $oldValues, [
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'admin_note' => $validated['admin_note'],
        ]);

        Cache::forget('admin:business:stats:overview');
        Cache::forget('admin:billing:stats');

        return $this->successResponse(
            new SubscriptionRequestResource($subscriptionRequest->fresh(['business', 'requestedPlan', 'requester', 'approver'])),
            'Subscription request rejected successfully'
        );
    }
}
