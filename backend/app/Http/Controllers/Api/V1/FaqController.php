<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FaqController extends ApiController
{
    /**
     * Get active FAQs with optional category filter.
     */
    public function index(Request $request): JsonResponse
    {
        $category = $request->input('category');

        $cacheKey = 'faqs_' . ($category ?? 'all');
        $faqs = Cache::remember($cacheKey, 600, function () use ($category) {
            $query = Faq::query()->active()->ordered();
            if ($category) {
                $query->where('category', $category);
            }
            return $query->get();
        });

        return $this->successResponse([
            'items' => FaqResource::collection($faqs),
        ]);
    }
}
