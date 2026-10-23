<?php

namespace App\Modules\Business\Http\Controllers\Public;

use App\Http\Controllers\Api\ApiController;
use App\Models\Destination;
use App\Modules\Business\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NearbyBusinessController extends ApiController
{
    /**
     * Compact nearby businesses endpoint for Travel destination pages.
     */
    public function forDestination(Request $request, string $slug): JsonResponse
    {
        $destination = Destination::where('slug', $slug)->first();
        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        $limit = min((int) $request->input('limit', 6), 20);

        // Fetch businesses linked by distance
        $linked = Business::query()->published()
            ->join('biz_destination_links', 'biz_businesses.id', '=', 'biz_destination_links.business_id')
            ->where('biz_destination_links.destination_id', $destination->id)
            ->with(['category', 'coverMedia', 'media'])
            ->select('biz_businesses.*', 'biz_destination_links.distance_km')
            ->orderBy('biz_destination_links.distance_km')
            ->take($limit)
            ->get();

        // If no precalculated links or fewer than limit, fallback to province businesses
        if ($linked->count() < $limit && $destination->province_id) {
            $existingIds = $linked->pluck('id')->toArray();
            $more = Business::query()->published()
                ->where('province_id', $destination->province_id)
                ->whereNotIn('id', $existingIds)
                ->with(['category', 'coverMedia', 'media'])
                ->take($limit - count($existingIds))
                ->get()
                ->map(function ($b) {
                    $b->distance_km = null;
                    return $b;
                });

            $linked = $linked->concat($more);
        }

        $items = $linked->map(function ($b) {
            $cover = $b->coverMedia ?: $b->media->firstWhere('is_cover', true) ?: $b->media->first();

            return [
                'slug' => $b->slug,
                'name_km' => $b->name_km,
                'name_en' => $b->name_en,
                'category' => $b->category ? [
                    'slug' => $b->category->slug,
                    'name_km' => $b->category->name_km,
                    'name_en' => $b->category->name_en,
                    'icon' => $b->category->icon,
                ] : null,
                'thumb' => $cover?->url_400 ?: $cover?->url,
                'rating_avg' => (float) $b->rating_avg,
                'rating_count' => (int) $b->rating_count,
                'is_verified' => (bool) $b->is_verified,
                'distance_km' => isset($b->distance_km) ? (float) $b->distance_km : null,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Nearby businesses retrieved',
            'data' => [
                'destination' => [
                    'id' => $destination->id,
                    'slug' => $destination->slug,
                    'name_km' => $destination->name_km,
                    'name_en' => $destination->name_en,
                ],
                'businesses' => $items,
            ],
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
    }
}
