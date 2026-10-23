<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Http\Resources\BusinessContactResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBusinessContactController extends ApiController
{
    public function index(int $businessId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('view', $business);

        $contacts = $business->contacts()->get();
        return $this->successResponse(BusinessContactResource::collection($contacts));
    }

    public function store(Request $request, int $businessId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('update', $business);

        $validated = $request->validate([
            'type' => 'required|string|in:phone,telegram,whatsapp,messenger,email,website,facebook',
            'value' => 'required|string|max:500',
            'label' => 'nullable|string|max:100',
            'is_primary' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if (!empty($validated['is_primary'])) {
            $business->contacts()->update(['is_primary' => false]);
        }

        $contact = $business->contacts()->create($validated);
        AuditLog::record('business_contact_created', $business, null, $contact->toArray());

        return $this->successResponse(new BusinessContactResource($contact), 'Contact added successfully', 201);
    }

    public function update(Request $request, int $businessId, int $contactId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('update', $business);

        $contact = $business->contacts()->findOrFail($contactId);

        $validated = $request->validate([
            'type' => 'sometimes|required|string|in:phone,telegram,whatsapp,messenger,email,website,facebook',
            'value' => 'sometimes|required|string|max:500',
            'label' => 'nullable|string|max:100',
            'is_primary' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if (!empty($validated['is_primary'])) {
            $business->contacts()->where('id', '!=', $contact->id)->update(['is_primary' => false]);
        }

        $contact->update($validated);
        AuditLog::record('business_contact_updated', $business, null, $contact->toArray());

        return $this->successResponse(new BusinessContactResource($contact), 'Contact updated successfully');
    }

    public function destroy(int $businessId, int $contactId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('update', $business);

        $contact = $business->contacts()->findOrFail($contactId);
        $contact->delete();

        AuditLog::record('business_contact_deleted', $business, ['contact_id' => $contactId]);
        return $this->successResponse(null, 'Contact deleted successfully');
    }
}
