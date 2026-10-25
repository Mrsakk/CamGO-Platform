<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\FeaturedSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminFeaturedSlotController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('manageBilling', Business::class);

        $query = FeaturedSlot::with(['business:id,slug,name_km,name_en', 'category:id,name_en', 'province:id,name_en'])
            ->latest('id');

        if ($request->filled('slot')) {
            $query->where('slot', $request->input('slot'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return $this->paginateResponse(
            $query->paginate(min(max((int) $request->input('per_page', 20), 1), 100)),
            'Featured slots retrieved successfully'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('feature', Business::class);

        $validated = $request->validate([
            'business_id' => 'required|integer|exists:biz_businesses,id',
            'slot' => 'required|in:homepage,category,province',
            'category_id' => 'nullable|integer|exists:biz_categories,id',
            'province_id' => 'nullable|integer|exists:provinces,id',
            'amount_cents' => 'nullable|integer|min:0',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
        ]);

        $startsAt = $validated['starts_at'];
        $endsAt = $validated['ends_at'];
        $slotType = $validated['slot'];

        $overlapQuery = FeaturedSlot::where('status', 'active')
            ->where('slot', $slotType)
            ->where(function ($q) use ($startsAt, $endsAt) {
                $q->where('starts_at', '<', $endsAt)
                  ->where('ends_at', '>', $startsAt);
            });

        if ($slotType === 'category') {
            $overlapQuery->where('category_id', $validated['category_id'] ?? null);
        } elseif ($slotType === 'province') {
            $overlapQuery->where('province_id', $validated['province_id'] ?? null);
        }

        if ($overlapQuery->exists()) {
            return $this->errorResponse('An active featured slot already exists for this placement and date range', 422);
        }

        $slot = FeaturedSlot::create(array_merge($validated, [
            'status' => 'active',
            'created_by' => $request->user()->id,
        ]));

        AuditLog::record('featured_slot_created', $slot, null, $slot->toArray());

        return $this->successResponse($slot->load('business'), 'Featured slot created successfully', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $this->authorize('feature', Business::class);

        $slot = FeaturedSlot::find($id);
        if (! $slot) {
            return $this->errorResponse('Featured slot not found', 404);
        }

        $validated = $request->validate([
            'status' => 'sometimes|required|in:active,expired,canceled',
            'starts_at' => 'sometimes|required|date',
            'ends_at' => 'sometimes|required|date|after:starts_at',
            'amount_cents' => 'nullable|integer|min:0',
        ]);

        $newStatus = $validated['status'] ?? $slot->status;
        $startsAt = $validated['starts_at'] ?? $slot->starts_at;
        $endsAt = $validated['ends_at'] ?? $slot->ends_at;

        if ($newStatus === 'active') {
            $overlapQuery = FeaturedSlot::where('id', '!=', $slot->id)
                ->where('status', 'active')
                ->where('slot', $slot->slot)
                ->where(function ($q) use ($startsAt, $endsAt) {
                    $q->where('starts_at', '<', $endsAt)
                      ->where('ends_at', '>', $startsAt);
                });

            if ($slot->slot === 'category') {
                $overlapQuery->where('category_id', $slot->category_id);
            } elseif ($slot->slot === 'province') {
                $overlapQuery->where('province_id', $slot->province_id);
            }

            if ($overlapQuery->exists()) {
                return $this->errorResponse('An active featured slot already exists for this placement and date range', 422);
            }
        }

        $old = $slot->only(['status', 'starts_at', 'ends_at', 'amount_cents']);
        $slot->update($validated);

        AuditLog::record('featured_slot_updated', $slot, $old, $slot->only(['status', 'starts_at', 'ends_at', 'amount_cents']));

        return $this->successResponse($slot->fresh('business'), 'Featured slot updated successfully');
    }
}
