<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Verification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerVerificationController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $business = $this->business($request);

        return $this->successResponse(
            Verification::with('document')->where('business_id', $business->id)->latest('id')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $business = $this->business($request);

        $validated = $request->validate([
            'document_id' => 'nullable|integer|exists:biz_documents,id',
            'notes' => 'nullable|string|max:2000',
        ]);

        if ($business->is_verified) {
            return $this->errorResponse('This business is already verified.', 422);
        }

        $pending = Verification::where('business_id', $business->id)
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            return $this->errorResponse('A verification request is already pending.', 422);
        }

        $verification = Verification::create([
            'business_id' => $business->id,
            'document_id' => $validated['document_id'] ?? $business->documents()->value('id'),
            'status' => 'pending',
            'submitted_by' => $request->user()->id,
            'submitted_at' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditLog::record('business_verification_submitted', $verification, null, [
            'business_id' => $business->id,
        ]);

        return $this->successResponse($verification, 'Verification request submitted successfully', 201);
    }

    private function business(Request $request): Business
    {
        $user = $request->user();

        if (empty($user->business_id)) {
            abort(404, 'No business is linked to this account.');
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('view', $business);

        return $business;
    }
}
