<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Verification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVerificationController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewKyc', Business::class);

        $query = Verification::with(['business:id,slug,name_km,name_en,is_verified', 'document', 'submitter:id,name'])
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('business_id')) {
            $query->where('business_id', $request->input('business_id'));
        }

        return $this->paginateResponse(
            $query->paginate(min(max((int) $request->input('per_page', 20), 1), 100)),
            'Verification requests retrieved successfully'
        );
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $this->authorize('verify', Business::class);

        $verification = Verification::find($id);
        if (! $verification) {
            return $this->errorResponse('Verification request not found', 404);
        }

        $business = Business::findOrFail($verification->business_id);

        $verification->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'notes' => $request->input('notes'),
        ]);

        $business->forceFill([
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
        ])->save();

        AuditLog::record('business_verification_approved', $business, null, [
            'verification_id' => $verification->id,
        ]);

        return $this->successResponse($verification->fresh('business'), 'Verification approved');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $this->authorize('verify', Business::class);

        $verification = Verification::find($id);
        if (! $verification) {
            return $this->errorResponse('Verification request not found', 404);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $verification->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        AuditLog::record('business_verification_rejected', $verification, null, [
            'reason' => $validated['rejection_reason'],
        ]);

        return $this->successResponse($verification->fresh('business'), 'Verification rejected');
    }
}
