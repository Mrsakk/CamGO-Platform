<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\DestinationListResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends ApiController
{
    /**
     * List all 7 categories with destination counts.
     */
    public function index(): JsonResponse
    {
        $items = Cache::remember('categories_all', 600, function () {
            $categories = Category::query()
                ->active()
                ->withCount(['destinations' => function ($q) {
                    $q->published();
                }])
                ->ordered()
                ->get();

            return CategoryResource::collection($categories)->resolve();
        });

        return $this->successResponse([
            'items' => $items,
        ]);
    }

    /**
     * Show single category details and its destinations.
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::query()
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug);
                if (is_numeric($slug)) {
                    $q->orWhere('id', (int) $slug);
                }
            })
            ->withCount(['destinations' => function ($q) {
                $q->published();
            }])
            ->first();

        if (!$category) {
            return $this->errorResponse('Category not found', 404);
        }

        $destinations = $category->destinations()
            ->published()
            ->with(['province', 'category'])
            ->orderByDesc('avg_rating')
            ->get();

        return $this->successResponse([
            'category' => new CategoryResource($category),
            'destinations' => DestinationListResource::collection($destinations),
        ]);
    }
}
