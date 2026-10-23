<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\Trip;
use App\Models\TripItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TripController extends ApiController
{
    /**
     * Get all trips belonging to the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $trips = $request->user()->trips()
            ->with(['items' => function ($query) {
                $query->orderBy('day_number')->orderBy('order_index');
            }])
            ->latest()
            ->get();

        return $this->successResponse([
            'items' => $trips,
        ]);
    }

    /**
     * Create a new trip itinerary.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:100',
            'days_count' => 'nullable|integer|min:1|max:30',
            'notes' => 'nullable|string',
            'is_public' => 'nullable|boolean',
            'days' => 'nullable|array',
        ]);

        $trip = DB::transaction(function () use ($request, $validated) {
            $trip = Trip::create([
                'user_id' => $request->user()->id,
                'title' => $validated['title'],
                'title_en' => $validated['title_en'] ?? $validated['title'],
                'province' => $validated['province'] ?? 'Siem Reap',
                'days_count' => $validated['days_count'] ?? (isset($validated['days']) ? count($validated['days']) : 1),
                'notes' => $validated['notes'] ?? null,
                'is_public' => $validated['is_public'] ?? false,
            ]);

            if (!empty($validated['days']) && is_array($validated['days'])) {
                foreach ($validated['days'] as $dayData) {
                    $dayNum = (int) ($dayData['day'] ?? 1);
                    $items = $dayData['items'] ?? [];
                    foreach ($items as $idx => $it) {
                        TripItem::create([
                            'trip_id' => $trip->id,
                            'destination_id' => $it['destinationId'] ?? $it['destination_id'] ?? null,
                            'day_number' => $dayNum,
                            'order_index' => $idx,
                            'name_km' => $it['name_km'] ?? $it['name_en'] ?? 'Destination',
                            'name_en' => $it['name_en'] ?? $it['name_km'] ?? 'Destination',
                            'slug' => $it['slug'] ?? null,
                            'category' => $it['category'] ?? 'Attraction',
                            'image' => $it['image'] ?? null,
                            'time' => $it['time'] ?? '09:00 AM',
                            'notes' => $it['notes'] ?? null,
                        ]);
                    }
                }
            }

            return $trip;
        });

        $trip->load(['items' => function ($q) {
            $q->orderBy('day_number')->orderBy('order_index');
        }]);

        return $this->successResponse([
            'trip' => $trip,
        ], 'Trip itinerary created successfully', 201);
    }

    /**
     * Show a single trip by id or ULID.
     */
    public function show(Request $request, string $idOrUlid): JsonResponse
    {
        $trip = Trip::where('id', $idOrUlid)
            ->orWhere('ulid', $idOrUlid)
            ->with(['items' => function ($q) {
                $q->orderBy('day_number')->orderBy('order_index');
            }])
            ->first();

        if (!$trip) {
            return $this->errorResponse('Trip not found', 404);
        }

        // Authorize: owner or public
        if ($trip->user_id !== $request->user()?->id && !$trip->is_public) {
            return $this->errorResponse('Unauthorized access to private trip', 403);
        }

        return $this->successResponse([
            'trip' => $trip,
        ]);
    }

    /**
     * Update trip details and day items.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $trip = $request->user()->trips()->find($id);

        if (!$trip) {
            return $this->errorResponse('Trip not found', 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:100',
            'days_count' => 'nullable|integer|min:1|max:30',
            'notes' => 'nullable|string',
            'is_public' => 'nullable|boolean',
            'days' => 'nullable|array',
        ]);

        DB::transaction(function () use ($trip, $validated) {
            $trip->update(array_filter([
                'title' => $validated['title'] ?? $trip->title,
                'title_en' => $validated['title_en'] ?? $trip->title_en,
                'province' => $validated['province'] ?? $trip->province,
                'days_count' => $validated['days_count'] ?? $trip->days_count,
                'notes' => $validated['notes'] ?? $trip->notes,
                'is_public' => isset($validated['is_public']) ? $validated['is_public'] : $trip->is_public,
            ], fn ($v) => $v !== null));

            // If days structure is sent, replace items
            if (isset($validated['days']) && is_array($validated['days'])) {
                $trip->items()->delete();
                foreach ($validated['days'] as $dayData) {
                    $dayNum = (int) ($dayData['day'] ?? 1);
                    $items = $dayData['items'] ?? [];
                    foreach ($items as $idx => $it) {
                        TripItem::create([
                            'trip_id' => $trip->id,
                            'destination_id' => $it['destinationId'] ?? $it['destination_id'] ?? null,
                            'day_number' => $dayNum,
                            'order_index' => $idx,
                            'name_km' => $it['name_km'] ?? $it['name_en'] ?? 'Destination',
                            'name_en' => $it['name_en'] ?? $it['name_km'] ?? 'Destination',
                            'slug' => $it['slug'] ?? null,
                            'category' => $it['category'] ?? 'Attraction',
                            'image' => $it['image'] ?? null,
                            'time' => $it['time'] ?? '09:00 AM',
                            'notes' => $it['notes'] ?? null,
                        ]);
                    }
                }
            }
        });

        $trip->load(['items' => function ($q) {
            $q->orderBy('day_number')->orderBy('order_index');
        }]);

        return $this->successResponse([
            'trip' => $trip,
        ], 'Trip updated successfully');
    }

    /**
     * Delete a trip.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $trip = $request->user()->trips()->find($id);

        if (!$trip) {
            return $this->errorResponse('Trip not found', 404);
        }

        $trip->delete();

        return $this->successResponse(null, 'Trip deleted successfully');
    }

    /**
     * Sync/merge guest plans created in localStorage on login.
     */
    public function sync(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plans' => 'required|array',
        ]);

        $user = $request->user();
        $importedCount = 0;

        DB::transaction(function () use ($user, $validated, &$importedCount) {
            foreach ($validated['plans'] as $plan) {
                // Skip if default sample plan
                if (isset($plan['id']) && $plan['id'] === 'sample-siem-reap') {
                    continue;
                }

                $trip = Trip::create([
                    'user_id' => $user->id,
                    'title' => $plan['title'] ?? 'Custom Trip',
                    'title_en' => $plan['title_en'] ?? $plan['title'] ?? 'Custom Trip',
                    'province' => $plan['province'] ?? 'Siem Reap',
                    'days_count' => isset($plan['days']) ? count($plan['days']) : 1,
                ]);

                if (!empty($plan['days']) && is_array($plan['days'])) {
                    foreach ($plan['days'] as $dayData) {
                        $dayNum = (int) ($dayData['day'] ?? 1);
                        $items = $dayData['items'] ?? [];
                        foreach ($items as $idx => $it) {
                            TripItem::create([
                                'trip_id' => $trip->id,
                                'destination_id' => $it['destinationId'] ?? $it['destination_id'] ?? null,
                                'day_number' => $dayNum,
                                'order_index' => $idx,
                                'name_km' => $it['name_km'] ?? $it['name_en'] ?? 'Destination',
                                'name_en' => $it['name_en'] ?? $it['name_km'] ?? 'Destination',
                                'slug' => $it['slug'] ?? null,
                                'category' => $it['category'] ?? 'Attraction',
                                'image' => $it['image'] ?? null,
                                'time' => $it['time'] ?? '09:00 AM',
                                'notes' => $it['notes'] ?? null,
                            ]);
                        }
                    }
                }

                $importedCount++;
            }
        });

        $trips = $user->trips()
            ->with(['items' => function ($q) {
                $q->orderBy('day_number')->orderBy('order_index');
            }])
            ->latest()
            ->get();

        return $this->successResponse([
            'imported_count' => $importedCount,
            'items' => $trips,
        ], 'Guest plans successfully synchronized with account');
    }
}
