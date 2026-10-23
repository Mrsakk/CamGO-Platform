<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Branch;
use App\Modules\Business\Services\EntitlementsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerBranchController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $business = $this->business($request);

        return $this->successResponse(
            $business->branches()->orderByDesc('is_primary')->orderBy('id')->get()
        );
    }

    public function store(Request $request, EntitlementsService $entitlements): JsonResponse
    {
        $business = $this->business($request);

        if (! $entitlements->canAdd($business, 'branches', 'max_branches')) {
            return $this->errorResponse('Your current plan does not allow more branches. Upgrade to add another branch.', 422);
        }

        $validated = $this->validated($request);
        $branch = $business->branches()->create($validated);

        AuditLog::record('business_branch_created', $branch, null, $branch->toArray());

        return $this->successResponse($branch, 'Branch created successfully', 201);
    }

    public function update(Request $request, int $branchId): JsonResponse
    {
        $business = $this->business($request);
        $branch = $business->branches()->findOrFail($branchId);

        $old = $branch->toArray();
        $branch->update($this->validated($request, true));

        AuditLog::record('business_branch_updated', $branch, $old, $branch->toArray());

        return $this->successResponse($branch, 'Branch updated successfully');
    }

    public function destroy(Request $request, int $branchId): JsonResponse
    {
        $business = $this->business($request);
        $branch = $business->branches()->findOrFail($branchId);

        if ($branch->is_primary) {
            return $this->errorResponse('The primary branch cannot be removed.', 422);
        }

        $branch->delete();

        return $this->successResponse(null, 'Branch removed successfully');
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $prefix = $partial ? 'sometimes|' : '';

        return $request->validate([
            'name_km' => $prefix.'required|string|max:255',
            'name_en' => $prefix.'required|string|max:255',
            'address_km' => 'nullable|string|max:500',
            'address_en' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:30',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'hours' => 'nullable|array',
            'is_primary' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);
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
