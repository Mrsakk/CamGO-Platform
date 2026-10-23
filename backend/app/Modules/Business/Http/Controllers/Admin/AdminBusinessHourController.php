<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Http\Resources\BusinessHourResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessClosure;
use App\Modules\Business\Models\BusinessHour;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBusinessHourController extends ApiController
{
    public function getHours(int $businessId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('view', $business);

        $hours = $business->hours()->get();
        return $this->successResponse(BusinessHourResource::collection($hours));
    }

    public function syncHours(Request $request, int $businessId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('update', $business);

        $validated = $request->validate([
            'hours' => 'required|array',
            'hours.*.weekday' => 'required|integer|between:0,6',
            'hours.*.opens_at' => 'nullable|string',
            'hours.*.closes_at' => 'nullable|string',
            'hours.*.is_closed' => 'boolean',
        ]);

        $business->hours()->delete();

        foreach ($validated['hours'] as $h) {
            $business->hours()->create([
                'weekday' => $h['weekday'],
                'opens_at' => !empty($h['is_closed']) ? null : ($h['opens_at'] ?? null),
                'closes_at' => !empty($h['is_closed']) ? null : ($h['closes_at'] ?? null),
                'is_closed' => !empty($h['is_closed']),
            ]);
        }

        AuditLog::record('business_hours_synced', $business);

        return $this->successResponse(
            BusinessHourResource::collection($business->hours()->get()),
            'Operating hours updated successfully'
        );
    }

    public function getClosures(int $businessId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('view', $business);

        $closures = $business->closures()->latest('from_date')->get();
        return $this->successResponse($closures);
    }

    public function storeClosure(Request $request, int $businessId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('update', $business);

        $validated = $request->validate([
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'note_km' => 'nullable|string|max:255',
            'note_en' => 'nullable|string|max:255',
        ]);

        $closure = $business->closures()->create($validated);
        AuditLog::record('business_closure_created', $business, null, $closure->toArray());

        return $this->successResponse($closure, 'Temporary closure recorded', 201);
    }

    public function destroyClosure(int $businessId, int $closureId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('update', $business);

        $closure = $business->closures()->findOrFail($closureId);
        $closure->delete();

        AuditLog::record('business_closure_deleted', $business, ['closure_id' => $closureId]);

        return $this->successResponse(null, 'Closure deleted successfully');
    }
}
