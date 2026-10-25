<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\DestinationListResource;
use App\Http\Resources\ProvinceResource;
use App\Models\Province;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProvinceController extends ApiController
{
    /**
     * List all 25 provinces/municipalities with destination counts.
     */
    public function index(Request $request): JsonResponse
    {
        $featuredOnly = $request->boolean('featured');

        $items = Cache::remember("provinces_all_" . ($featuredOnly ? 'featured' : 'all'), 600, function () use ($featuredOnly) {
            $query = Province::query()
                ->withCount(['destinations' => function ($q) {
                    $q->published();
                }])
                ->ordered();

            if ($featuredOnly) {
                $query->featured();
            }

            return ProvinceResource::collection($query->get())->resolve();
        });

        return $this->successResponse([
            'items' => $items,
        ]);
    }

    /**
     * Show single province details and its destinations.
     */
    public function show(string $slugOrCode): JsonResponse
    {
        $province = Province::query()
            ->where(function ($q) use ($slugOrCode) {
                $q->where('slug', $slugOrCode)
                  ->orWhere('code', strtoupper($slugOrCode));
                if (is_numeric($slugOrCode)) {
                    $q->orWhere('id', (int) $slugOrCode);
                }
            })
            ->withCount(['destinations' => function ($q) {
                $q->published();
            }])
            ->first();

        if (!$province) {
            return $this->errorResponse('Province not found', 404);
        }

        $destinations = $province->destinations()
            ->published()
            ->with(['province', 'category'])
            ->orderByDesc('avg_rating')
            ->get();

        return $this->successResponse([
            'province' => new ProvinceResource($province),
            'destinations' => DestinationListResource::collection($destinations),
        ]);
    }
}
