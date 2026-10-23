<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Http\Resources\PaymentResource;
use App\Modules\Business\Http\Resources\SubscriptionResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Payment;
use App\Modules\Business\Models\Plan;
use App\Modules\Business\Models\Subscription;
use App\Modules\Business\Models\SubscriptionRequest as SubscriptionRequestModel;
use App\Modules\Business\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class AdminSubscriptionController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('manageBilling', Business::class);

        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);

        $query = Subscription::with(['business', 'plan', 'payments', 'creator', 'approver'])
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('plan_id')) {
            $query->where('plan_id', $request->input('plan_id'));
        }

        if ($request->filled('business_id')) {
            $query->where('business_id', $request->input('business_id'));
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
        $paginator->through(fn (Subscription $subscription) => (new SubscriptionResource($subscription))->resolve($request));

        return $this->paginateResponse($paginator, 'Subscriptions retrieved successfully');
    }

    public function stats(): JsonResponse
    {
        $this->authorize('manageBilling', Business::class);

        $now = now();

        return $this->successResponse([
            'active_subscriptions' => Subscription::whereIn('status', ['active', 'trialing'])
                ->where(function ($query) use ($now) {
                    $query->whereNull('ends_at')->orWhere('ends_at', '>', $now);
                })
                ->count(),
            'trial_subscriptions' => Subscription::where('status', 'trialing')->count(),
            'expiring_soon' => Subscription::whereIn('status', ['active', 'trialing'])
                ->whereBetween('ends_at', [$now, $now->copy()->addDays(7)])
                ->count(),
            'pending_requests' => SubscriptionRequestModel::where('status', 'pending')->count(),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'verified_revenue_30d' => (float) Payment::whereIn('status', ['recorded', 'verified'])
                ->where('paid_at', '>=', $now->copy()->subDays(30))
                ->sum('amount_usd'),
            'verified_revenue_total' => (float) Payment::whereIn('status', ['recorded', 'verified'])->sum('amount_usd'),
            'revenue_total_cents' => (int) Payment::whereIn('status', ['recorded', 'verified'])->sum('amount_cents'),
        ], 'Billing statistics retrieved successfully');
    }

    public function payments(Request $request): JsonResponse
    {
        $this->authorize('verifyPayments', Business::class);

        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);

        $query = Payment::with(['subscription.business', 'subscription.plan', 'verifier'])
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('method')) {
            $query->where('method', $request->input('method'));
        }

        if ($request->filled('subscription_id')) {
            $query->where('subscription_id', $request->input('subscription_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('subscription.business', function ($businessQuery) use ($search) {
                $businessQuery->where('name_km', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate($perPage)->withQueryString();
        $paginator->through(fn (Payment $payment) => (new PaymentResource($payment))->resolve($request));

        return $this->paginateResponse($paginator, 'Payments retrieved successfully');
    }

    public function activate(Request $request, int $id, SubscriptionService $service): JsonResponse
    {
        $this->authorize('manageBilling', Business::class);

        $business = Business::find($id);
        if (!$business) {
            return $this->errorResponse('Business not found', 404);
        }

        $validated = $request->validate([
            'plan_id' => 'required|integer|exists:biz_plans,id',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after:starts_at',
            'price_usd' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'auto_renew' => 'sometimes|boolean',
            'notes' => 'nullable|string|max:1000',
            'featured_until' => 'nullable|date',
            'sponsored_category_until' => 'nullable|date',
            'sponsored_province_until' => 'nullable|date',
            'is_verified' => 'nullable|boolean',
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

        $plan = Plan::find($validated['plan_id']);

        $result = $service->activate(
            $business,
            $plan,
            Arr::except($validated, ['plan_id']),
            $request->user()
        );

        return $this->successResponse([
            'subscription' => new SubscriptionResource($result['subscription']),
            'business' => [
                'id' => $result['business']->id,
                'tier' => $result['business']->tier,
                'effective_tier' => $result['business']->effectiveTier(),
                'is_verified' => (bool) $result['business']->is_verified,
                'is_featured' => $result['business']->isFeatured(),
                'is_sponsored_category' => $result['business']->isSponsoredCategory(),
                'is_sponsored_province' => $result['business']->isSponsoredProvince(),
                'subscription_expires_at' => $result['business']->subscription_expires_at?->toIso8601String(),
                'featured_until' => $result['business']->featured_until?->toIso8601String(),
                'sponsored_category_until' => $result['business']->sponsored_category_until?->toIso8601String(),
                'sponsored_province_until' => $result['business']->sponsored_province_until?->toIso8601String(),
                'is_subscription_active' => $result['business']->isSubscriptionActive(),
                'entitlements' => $result['business']->entitlements(),
            ],
            'warning' => $result['warning'],
        ], 'Subscription activated successfully', 201);
    }

    public function recordPayment(Request $request, int $id, SubscriptionService $service): JsonResponse
    {
        $this->authorize('verifyPayments', Business::class);

        $subscription = Subscription::find($id);
        if (!$subscription) {
            return $this->errorResponse('Subscription not found', 404);
        }

        $validated = $request->validate([
            'amount_usd' => 'nullable|numeric|min:0',
            'amount_cents' => 'nullable|integer|min:0',
            'invoice_id' => 'nullable|integer|exists:biz_invoices,id',
            'currency' => 'nullable|string|size:3',
            'method' => 'nullable|in:cash,bank_transfer,aba,wing,khqr,other',
            'reference_no' => 'nullable|string|max:255',
            'receipt_no' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,recorded,verified,rejected,voided',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $payment = $service->recordPayment($subscription, $validated, $request->user());

        return $this->successResponse(
            new PaymentResource($payment->load('verifier')),
            'Payment recorded successfully',
            201
        );
    }

    public function updatePaymentStatus(Request $request, int $id): JsonResponse
    {
        $this->authorize('verifyPayments', Business::class);

        $payment = Payment::with(['subscription.business'])->find($id);
        if (!$payment) {
            return $this->errorResponse('Payment not found', 404);
        }

        if ($payment->status !== 'pending') {
            return $this->errorResponse('Only pending payments can be verified or rejected.', 422);
        }

        $validated = $request->validate([
            'status' => 'required|in:recorded,verified,rejected',
            'notes' => 'nullable|string|max:1000',
        ]);

        $oldValues = $payment->only(['status', 'verified_by', 'paid_at', 'notes']);

        $payment->update([
            'status' => $validated['status'],
            'verified_by' => $request->user()->id,
            'recorded_by' => $payment->recorded_by ?? $request->user()->id,
            'paid_at' => $payment->paid_at ?? now(),
            'notes' => $validated['notes'] ?? $payment->notes,
        ]);

        AuditLog::record("subscription_payment_{$validated['status']}", $payment, $oldValues, [
            'status' => $validated['status'],
            'verified_by' => $request->user()->id,
            'notes' => $validated['notes'] ?? $payment->notes,
        ]);

        return $this->successResponse(
            new PaymentResource($payment->fresh()->load('verifier')),
            "Payment {$validated['status']} successfully"
        );
    }

    public function voidPayment(Request $request, int $id, SubscriptionService $service): JsonResponse
    {
        $this->authorize('verifyPayments', Business::class);

        $payment = Payment::find($id);
        if (!$payment) {
            return $this->errorResponse('Payment not found', 404);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $payment = $service->voidPayment($payment, $validated['reason'], $request->user());

        return $this->successResponse(
            new PaymentResource($payment->fresh()->load('verifier')),
            'Payment voided successfully'
        );
    }
}
