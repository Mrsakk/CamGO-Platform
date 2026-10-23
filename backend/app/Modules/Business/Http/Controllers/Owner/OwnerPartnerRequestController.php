<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\PartnerRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerPartnerRequestController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $business = $this->business($request);

        return $this->successResponse(
            PartnerRequest::where('business_id', $business->id)->latest('id')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $business = $this->business($request);

        $validated = $request->validate([
            'type' => 'required|in:featured,verification,partnership,other',
            'message' => 'required|string|min:10|max:2000',
        ]);

        $partnerRequest = PartnerRequest::create([
            'business_id' => $business->id,
            'type' => $validated['type'],
            'message' => $validated['message'],
            'status' => 'pending',
            'requested_by' => $request->user()->id,
        ]);

        AuditLog::record('partner_request_created', $partnerRequest, null, $partnerRequest->toArray());

        return $this->successResponse($partnerRequest, 'Partner request submitted successfully', 201);
    }

    private function business(Request $request): Business
    {
        $user = $request->user();

        if (empty($user->business_id)) {
            abort(404, 'No business is linked to this account.');
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        return $business;
    }
}
