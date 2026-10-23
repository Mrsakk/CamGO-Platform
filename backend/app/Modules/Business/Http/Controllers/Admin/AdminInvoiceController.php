<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Invoice;
use App\Modules\Business\Models\Subscription;
use App\Modules\Business\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInvoiceController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('manageBilling', Business::class);

        $query = Invoice::with(['business:id,slug,name_km,name_en', 'subscription.plan'])
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('business_id')) {
            $query->where('business_id', $request->input('business_id'));
        }

        return $this->paginateResponse(
            $query->paginate(min(max((int) $request->input('per_page', 20), 1), 100)),
            'Invoices retrieved successfully'
        );
    }

    public function store(Request $request, SubscriptionService $service): JsonResponse
    {
        $this->authorize('manageBilling', Business::class);

        $validated = $request->validate([
            'business_id' => 'required|integer|exists:biz_businesses,id',
            'subscription_id' => 'required|integer|exists:biz_subscriptions,id',
            'amount_cents' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:2000',
        ]);

        $business = Business::findOrFail($validated['business_id']);
        $subscription = Subscription::where('business_id', $business->id)
            ->findOrFail($validated['subscription_id']);

        $invoice = $service->createInvoice(
            $business,
            $subscription,
            (int) $validated['amount_cents'],
            $request->user()
        );

        if (! empty($validated['notes'])) {
            $invoice->update(['notes' => $validated['notes']]);
        }

        return $this->successResponse($invoice, 'Invoice created successfully', 201);
    }

    public function markPaid(Request $request, int $id): JsonResponse
    {
        $this->authorize('manageBilling', Business::class);

        $invoice = Invoice::find($id);
        if (! $invoice) {
            return $this->errorResponse('Invoice not found', 404);
        }

        $old = $invoice->only(['status', 'paid_at']);
        $invoice->update(['status' => 'paid', 'paid_at' => now()]);

        AuditLog::record('invoice_paid', $invoice, $old, $invoice->only(['status', 'paid_at']));

        return $this->successResponse($invoice, 'Invoice marked as paid');
    }

    public function void(Request $request, int $id): JsonResponse
    {
        $this->authorize('manageBilling', Business::class);

        $invoice = Invoice::find($id);
        if (! $invoice) {
            return $this->errorResponse('Invoice not found', 404);
        }

        $old = $invoice->only(['status']);
        $invoice->update(['status' => 'void']);

        AuditLog::record('invoice_voided', $invoice, $old, ['status' => 'void']);

        return $this->successResponse($invoice, 'Invoice voided');
    }
}
