<?php

namespace App\Modules\Business\Http\Controllers\Public;

use App\Http\Controllers\Api\ApiController;
use App\Models\Destination;
use App\Models\Province;
use App\Modules\Business\Http\Resources\BusinessPublicDetailResource;
use App\Modules\Business\Http\Resources\BusinessPublicListResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicBusinessController extends ApiController
{
    /**
     * Public Directory Listing with rich filters.
     * 12 items per page.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Business::query()
            ->published()
            ->with(['category', 'province', 'coverMedia', 'media', 'contacts', 'hours', 'closures']);

        // 1. Text Search (Khmer and English)
        if ($request->filled('q')) {
            $q = trim($request->input('q'));
            $query->where(function ($b) use ($q) {
                $b->where('name_km', 'like', "%{$q}%")
                    ->orWhere('name_en', 'like', "%{$q}%")
                    ->orWhere('tagline_km', 'like', "%{$q}%")
                    ->orWhere('tagline_en', 'like', "%{$q}%")
                    ->orWhere('description_km', 'like', "%{$q}%")
                    ->orWhere('description_en', 'like', "%{$q}%");
            });
        }

        // 2. Category Filter (by slug or id)
        if ($request->filled('category')) {
            $catSlug = $request->input('category');
            $query->whereHas('category', function ($q) use ($catSlug) {
                if (is_numeric($catSlug)) {
                    $q->where('id', $catSlug);
                } else {
                    $q->where('slug', $catSlug);
                }
            });
        }

        // 3. Province Filter (by slug, code or id)
        if ($request->filled('province')) {
            $provSlug = $request->input('province');
            $query->whereHas('province', function ($q) use ($provSlug) {
                if (is_numeric($provSlug)) {
                    $q->where('id', $provSlug);
                } else {
                    $q->where('slug', $provSlug)->orWhere('code', $provSlug);
                }
            });
        }

        // 4. Verified Badge Filter
        if ($request->filled('verified') && $request->boolean('verified')) {
            $query->where('is_verified', true);
        }

        // 5. Price Level Filter (1 to 4)
        if ($request->filled('price_level')) {
            $query->where('price_level', (int) $request->input('price_level'));
        }

        // 6. Destination Proximity Filter
        if ($request->filled('destination')) {
            $destSlug = $request->input('destination');
            $dest = Destination::where('slug', $destSlug)->first();
            if ($dest) {
                $query->join('biz_destination_links', 'biz_businesses.id', '=', 'biz_destination_links.business_id')
                    ->where('biz_destination_links.destination_id', $dest->id)
                    ->addSelect('biz_businesses.*', 'biz_destination_links.distance_km as destination_distance_km');
            }
        }

        // 7. Geo Location (Near lat,lng & radius_km)
        $hasGeo = false;
        if ($request->filled('near')) {
            $coords = explode(',', $request->input('near'));
            if (count($coords) === 2 && is_numeric($coords[0]) && is_numeric($coords[1])) {
                $lat = (float) $coords[0];
                $lng = (float) $coords[1];
                $radius = (float) $request->input('radius_km', 30);

                // Haversine formula in KM
                $haversine = "(6371 * acos(least(1.0, greatest(-1.0, cos(radians({$lat})) * cos(radians(lat)) * cos(radians(lng) - radians({$lng})) + sin(radians({$lat})) * sin(radians(lat))))))";

                $query->selectRaw("biz_businesses.*, {$haversine} AS distance_km")
                    ->whereNotNull('lat')
                    ->whereNotNull('lng')
                    ->whereRaw("{$haversine} <= ?", [$radius]);

                $hasGeo = true;
            }
        }

        // 8. Sorting
        $sort = $request->input('sort', 'relevance');
        if ($sort === 'rating') {
            $query->orderByDesc('rating_avg')->orderByDesc('rating_count');
        } elseif ($sort === 'newest') {
            $query->orderByDesc('approved_at')->orderByDesc('id');
        } elseif ($sort === 'distance' && $hasGeo) {
            $query->orderBy('distance_km');
        } elseif ($sort === 'distance' && $request->filled('destination')) {
            $query->orderBy('destination_distance_km');
        } else {
            // Default: context sponsors, then featured, then verified, then rating.
            // Sponsored/featured placement without a valid paid subscription is ignored.
            $categoryId = null;
            if ($request->filled('category')) {
                $categorySlug = $request->input('category');
                $categoryId = Category::query()
                    ->when(is_numeric($categorySlug), fn ($q) => $q->where('id', $categorySlug))
                    ->when(! is_numeric($categorySlug), fn ($q) => $q->where('slug', $categorySlug))
                    ->value('id');
            }

            $provinceId = null;
            if ($request->filled('province')) {
                $provinceSlug = $request->input('province');
                $provinceId = Province::query()
                    ->when(is_numeric($provinceSlug), fn ($q) => $q->where('id', $provinceSlug))
                    ->when(! is_numeric($provinceSlug), function ($q) use ($provinceSlug) {
                        $q->where('slug', $provinceSlug)->orWhere('code', $provinceSlug);
                    })
                    ->value('id');
            }

            $query->orderByPublicPriority($categoryId, $provinceId);
        }

        $perPage = 12;

        // If open_now filter is requested, filter in collection or handle gracefully
        if ($request->boolean('open_now')) {
            $allApproved = $query->get();
            $filtered = $allApproved->filter(fn (Business $b) => $b->isOpenNow());

            $page = (int) $request->input('page', 1);
            $total = $filtered->count();
            $items = $filtered->forPage($page, $perPage)->values();

            $paginatedData = [
                'items' => BusinessPublicListResource::collection($items),
                'meta' => [
                    'current_page' => $page,
                    'last_page' => max(1, (int) ceil($total / $perPage)),
                    'per_page' => $perPage,
                    'total' => $total,
                ],
            ];
        } else {
            $paginated = $query->paginate($perPage);
            $paginatedData = [
                'items' => BusinessPublicListResource::collection($paginated->items()),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                ],
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Businesses retrieved successfully',
            'data' => $paginatedData,
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
    }

    /**
     * Public Business Detail.
     */
    public function show(string $slug): JsonResponse
    {
        $business = Business::where('slug', $slug)
            ->published()
            ->with([
                'category',
                'province',
                'contacts',
                'activeServices',
                'hours',
                'closures',
                'media',
                'approvedReviews',
                'nearbyDestinations',
                'branches' => fn ($query) => $query->where('is_active', true)->orderByDesc('is_primary'),
            ])
            ->first();

        if (! $business) {
            return $this->errorResponse('Business not found or is currently not publicly active', 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Business profile retrieved',
            'data' => new BusinessPublicDetailResource($business),
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
    }

    /**
     * Home page aggregated pool for client-side rotation.
     */
    public function home(): JsonResponse
    {
        $payload = Cache::remember('biz:public:home', 600, function () {
            // Verified businesses pool
            $verified = Business::query()->published()
                ->where('is_verified', true)
                ->with(['category', 'province', 'coverMedia', 'media', 'contacts', 'hours', 'closures'])
                ->orderByDesc('rating_avg')
                ->take(16)
                ->get();

            // Newest businesses pool
            $newest = Business::query()->published()
                ->with(['category', 'province', 'coverMedia', 'media', 'contacts', 'hours', 'closures'])
                ->orderByDesc('id')
                ->take(16)
                ->get();

            // Categories with top sample businesses
            $categories = Category::withCount(['businesses' => fn ($q) => $q->published()])
                ->orderBy('sort_order')
                ->get();

            $categoriesWithItems = [];
            foreach ($categories as $cat) {
                $items = Business::query()->published()
                    ->where('category_id', $cat->id)
                    ->with(['category', 'province', 'coverMedia', 'media', 'contacts', 'hours', 'closures'])
                    ->orderByPublicPriority($cat->id)
                    ->take(8)
                    ->get();

                $categoriesWithItems[] = [
                    'id' => $cat->id,
                    'slug' => $cat->slug,
                    'name_km' => $cat->name_km,
                    'name_en' => $cat->name_en,
                    'icon' => $cat->icon,
                    'businesses_count' => $cat->businesses_count,
                    'businesses' => BusinessPublicListResource::collection($items),
                ];
            }

            // Key provinces
            $provinces = Province::whereNull('deleted_at')
                ->get()
                ->map(function ($p) {
                    $cnt = Business::where('province_id', $p->id)->published()->count();

                    return [
                        'id' => $p->id,
                        'slug' => $p->slug,
                        'name_km' => $p->name_km,
                        'name_en' => $p->name_en,
                        'image' => $p->image,
                        'businesses_count' => $cnt,
                    ];
                })
                ->filter(fn ($p) => $p['businesses_count'] > 0)
                ->values();

            return [
                'verified_pool' => BusinessPublicListResource::collection($verified),
                'newest_pool' => BusinessPublicListResource::collection($newest),
                'categories' => $categoriesWithItems,
                'provinces' => $provinces,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Home directory pool retrieved',
            'data' => $payload,
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
    }
}
