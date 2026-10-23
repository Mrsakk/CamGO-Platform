<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\PartnerRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPartnerRequestController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Business::class);

        $query = PartnerRequest::with(['business:id,slug,name_km,name_en', 'requester:id,name'])
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        return $this->paginateResponse(
            $query->paginate(min(max((int) $request->input('per_page', 20), 1), 100)),
            'Partner requests retrieved successfully'
        );
    }

    public function review(Request $request, int $id): JsonResponse
    {
        $this->authorize('update', Business::class);

        $partnerRequest = PartnerRequest::find($id);
        if (! $partnerRequest) {
            return $this->errorResponse('Partner request not found', 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string|max:2000',
        ]);

        $old = $partnerRequest->only(['status', 'admin_note']);
        $partnerRequest->update([
            'status' => $validated['status'],
            'admin_note' => $validated['admin_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        AuditLog::record('partner_request_reviewed', $partnerRequest, $old, [
            'status' => $validated['status'],
        ]);

        return $this->successResponse($partnerRequest->fresh('business'), 'Partner request reviewed');
    }
}
