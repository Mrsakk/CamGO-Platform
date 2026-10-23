<?php

namespace App\Modules\Business\Http\Controllers\Public;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Business\Http\Resources\CategoryResource;
use App\Modules\Business\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PublicCategoryController extends ApiController
{
    public function index(): JsonResponse
    {
        $categories = Cache::remember('biz:public:categories', 600, function () {
            return Category::withCount(['businesses' => function ($q) {
                    $q->published();
                }])
                ->orderBy('sort_order')
                ->orderBy('name_en')
                ->get();
        });

        return response()->json([
            'success' => true,
            'message' => 'Categories retrieved',
            'data' => CategoryResource::collection($categories),
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
    }
}
