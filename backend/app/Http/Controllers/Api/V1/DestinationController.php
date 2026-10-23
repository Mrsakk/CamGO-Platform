<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\DestinationDetailResource;
use App\Http\Resources\DestinationListResource;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Province;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DestinationController extends ApiController
{
    /**
     * Display a filtered, sorted, paginated list of destinations.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Destination::query()
            ->published()
            ->with(['province', 'category']);

        // Filter by province (supports province_id or province slug/code)
        if ($request->filled('province_id')) {
            $provinceId = $request->input('province_id');
            if (is_numeric($provinceId)) {
                $query->where('province_id', (int) $provinceId);
            } else {
                $query->whereHas('province', function ($q) use ($provinceId) {
                    $q->where('slug', $provinceId)->orWhere('code', $provinceId);
                });
            }
        } elseif ($request->filled('province')) {
            $provinceVal = $request->input('province');
            if (is_numeric($provinceVal)) {
                $query->where('province_id', (int) $provinceVal);
            } else {
                $query->whereHas('province', function ($q) use ($provinceVal) {
                    $q->where('slug', $provinceVal)->orWhere('code', $provinceVal);
                });
            }
        }

        // Filter by category (supports category_id or category slug)
        if ($request->filled('category_id')) {
            $categoryId = $request->input('category_id');
            if (is_numeric($categoryId)) {
                $query->where('category_id', (int) $categoryId);
            } else {
                $query->whereHas('category', function ($q) use ($categoryId) {
                    $q->where('slug', $categoryId);
                });
            }
        } elseif ($request->filled('category')) {
            $categoryVal = $request->input('category');
            if (is_numeric($categoryVal)) {
                $query->where('category_id', (int) $categoryVal);
            } else {
                $query->whereHas('category', function ($q) use ($categoryVal) {
                    $q->where('slug', $categoryVal);
                });
            }
        }

        // Filter by minimum rating (supports rating or min_rating)
        if ($request->filled('min_rating') || $request->filled('rating')) {
            $minRating = (float) ($request->input('min_rating') ?? $request->input('rating'));
            $query->where('avg_rating', '>=', $minRating);
        }

        // Filter by entry fee type (supports is_free or entry_type)
        if ($request->has('is_free') && $request->input('is_free') !== null && $request->input('is_free') !== '') {
            $val = $request->input('is_free');
            $isFree = filter_var($val, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isFree !== null) {
                $query->where('is_free', $isFree);
            } elseif ($val === '1' || $val === 1) {
                $query->where('is_free', true);
            } elseif ($val === '0' || $val === 0) {
                $query->where('is_free', false);
            }
        } elseif ($request->filled('entry_type')) {
            $type = $request->input('entry_type');
            if ($type === 'free') {
                $query->where('is_free', true);
            } elseif ($type === 'paid') {
                $query->where('is_free', false);
            }
        }

        // Search query (name in English or Khmer)
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('name_km', 'like', "%{$search}%")
                  ->orWhere('excerpt_en', 'like', "%{$search}%")
                  ->orWhere('excerpt_km', 'like', "%{$search}%");
            });
        }

        // Sorting options (supports sort or sort_by)
        $sort = $request->input('sort', $request->input('sort_by', 'popular'));
        switch ($sort) {
            case 'top_rated':
                $query->orderByDesc('avg_rating')->orderByDesc('reviews_count');
                break;
            case 'newest':
                $query->orderByDesc('created_at');
                break;
            case 'name_asc':
                $query->orderBy('name_en');
                break;
            case 'price_low':
                $query->orderBy('entrance_fee_usd', 'asc');
                break;
            case 'popular':
            default:
                $query->orderByDesc('view_count')->orderByDesc('avg_rating');
                break;
        }

        // If map view without pagination is requested, allow larger limit
        if ($request->input('view_mode') === 'map') {
            $limit = min((int) $request->input('limit', 100), 200);
            $items = $query->take($limit)->get();

            return $this->successResponse([
                'items' => DestinationListResource::collection($items),
                'total' => $items->count(),
            ]);
        }

        $perPage = min((int) $request->input('per_page', 12), 50);
        $paginated = $query->paginate($perPage);

        return $this->successResponse([
            'items' => DestinationListResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'has_more_pages' => $paginated->hasMorePages(),
            ],
        ]);
    }

    /**
     * Display the specified destination details by slug or ULID.
     */
    public function show(string $slugOrUlid): JsonResponse
    {
        $destination = Destination::query()
            ->where(function ($q) use ($slugOrUlid) {
                $q->where('slug', $slugOrUlid)
                  ->orWhere('ulid', $slugOrUlid)
                  ->orWhere('id', $slugOrUlid);
            })
            ->published()
            ->with(['province', 'category', 'images', 'approvedReviews.user', 'approvedReviews.images'])
            ->first();

        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        // Increment view count asynchronously
        $destination->incrementQuietly('view_count');

        return $this->successResponse([
            'destination' => new DestinationDetailResource($destination),
        ]);
    }

    /**
     * Get featured destinations (cached for performance).
     */
    public function featured(): JsonResponse
    {
        $items = Cache::remember('destinations_featured', 600, function () {
            $destinations = Destination::query()
                ->published()
                ->featured()
                ->with(['province', 'category'])
                ->orderByDesc('avg_rating')
                ->take(8)
                ->get();

            return DestinationListResource::collection($destinations)->resolve();
        });

        return $this->successResponse([
            'items' => $items,
        ]);
    }

    /**
     * Get popular destinations (cached for performance).
     */
    public function popular(): JsonResponse
    {
        $items = Cache::remember('destinations_popular', 600, function () {
            $destinations = Destination::query()
                ->published()
                ->with(['province', 'category'])
                ->orderByDesc('view_count')
                ->take(6)
                ->get();

            return DestinationListResource::collection($destinations)->resolve();
        });

        return $this->successResponse([
            'items' => $items,
        ]);
    }

    /**
     * Get related destinations in the same province or category.
     */
    public function related(string $id): JsonResponse
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        $related = Destination::query()
            ->published()
            ->where('id', '!=', $destination->id)
            ->where(function ($q) use ($destination) {
                $q->where('province_id', $destination->province_id)
                  ->orWhere('category_id', $destination->category_id);
            })
            ->with(['province', 'category'])
            ->orderByDesc('avg_rating')
            ->take(4)
            ->get();

        return $this->successResponse([
            'items' => DestinationListResource::collection($related),
        ]);
    }

    /**
     * Fast search suggestions endpoint for autocomplete dropdown.
     */
    public function searchSuggestions(Request $request): JsonResponse
    {
        $term = trim($request->input('q', $request->input('search', '')));
        if (strlen($term) < 1) {
            return $this->successResponse(['suggestions' => []]);
        }

        $destinations = Destination::query()
            ->published()
            ->where(function ($q) use ($term) {
                $q->where('name_en', 'like', "%{$term}%")
                  ->orWhere('name_km', 'like', "%{$term}%")
                  ->orWhereHas('province', function ($pq) use ($term) {
                      $pq->where('name_en', 'like', "%{$term}%")
                         ->orWhere('name_km', 'like', "%{$term}%");
                  })
                  ->orWhereHas('category', function ($cq) use ($term) {
                      $cq->where('name_en', 'like', "%{$term}%")
                         ->orWhere('name_km', 'like', "%{$term}%");
                  });
            })
            ->select('id', 'slug', 'name_en', 'name_km', 'cover_image', 'province_id', 'category_id', 'avg_rating')
            ->with(['province:id,name_en,name_km', 'category:id,name_en,name_km'])
            ->take(6)
            ->get();

        return $this->successResponse([
            'suggestions' => $destinations,
        ]);
    }
}
