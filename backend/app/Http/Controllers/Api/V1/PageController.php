<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PageController extends ApiController
{
    /**
     * Get published static page content by slug (about, terms, privacy-policy).
     */
    public function show(string $slug): JsonResponse
    {
        $page = Cache::remember("page_{$slug}", 600, function () use ($slug) {
            return Page::query()->published()->where('slug', $slug)->first();
        });

        if (!$page) {
            return $this->errorResponse('Page not found', 404);
        }

        return $this->successResponse([
            'page' => new PageResource($page),
        ]);
    }
}
