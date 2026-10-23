<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Http\Resources\BusinessServiceResource;
use App\Modules\Business\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OwnerServiceController extends ApiController
{
    public function store(Request $request): JsonResponse
    {
        $business = $this->businessFor($request);

        if (! $business) {
            return $this->errorResponse('No business linked', 404);
        }

        $this->authorize('update', $business);

        $maxServices = $business->planLimit('max_services');
        if (is_numeric($maxServices) && $business->services()->count() >= (int) $maxServices) {
            throw ValidationException::withMessages([
                'service' => "Your current plan allows up to {$maxServices} services. Upgrade your plan to add more.",
            ]);
        }

        $validated = $request->validate($this->rules());
        $validated['is_active'] = $request->has('is_active') ? $request->boolean('is_active') : true;

        if (! array_key_exists('sort_order', $validated)) {
            $validated['sort_order'] = ((int) $business->services()->max('sort_order')) + 1;
        }

        $service = $business->services()->create($validated);

        AuditLog::record('business_service_created', $business, null, $service->toArray());

        return $this->successResponse(
            new BusinessServiceResource($service),
            'Service created successfully',
            201
        );
    }

    public function update(Request $request, int $serviceId): JsonResponse
    {
        $business = $this->businessFor($request);

        if (! $business) {
            return $this->errorResponse('No business linked', 404);
        }

        $this->authorize('update', $business);

        $service = $business->services()->findOrFail($serviceId);
        $validated = $request->validate($this->rules());

        if ($request->has('is_active')) {
            $validated['is_active'] = $request->boolean('is_active');
        }

        $old = $service->toArray();
        $service->update($validated);

        AuditLog::record('business_service_updated', $business, $old, $service->fresh()->toArray());

        return $this->successResponse(
            new BusinessServiceResource($service->fresh()),
            'Service updated successfully'
        );
    }

    public function destroy(Request $request, int $serviceId): JsonResponse
    {
        $business = $this->businessFor($request);

        if (! $business) {
            return $this->errorResponse('No business linked', 404);
        }

        $this->authorize('update', $business);

        $service = $business->services()->findOrFail($serviceId);

        AuditLog::record('business_service_deleted', $business, $service->toArray());
        $service->delete();

        return $this->successResponse(null, 'Service deleted successfully');
    }

    private function businessFor(Request $request): ?Business
    {
        $businessId = $request->user()?->business_id;

        if (empty($businessId)) {
            return null;
        }

        return Business::find($businessId);
    }

    private function rules(): array
    {
        return [
            'name_km' => ['required', 'string', 'max:255'],
            'name_en' => ['required', 'string', 'max:255'],
            'description_km' => ['nullable', 'string', 'max:2000'],
            'description_en' => ['nullable', 'string', 'max:2000'],
            'price_usd' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:10080'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ];
    }
}
