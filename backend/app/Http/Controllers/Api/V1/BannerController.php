<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class BannerController extends ApiController
{
    /**
     * Get active homepage banners and slides.
     */
    public function index(): JsonResponse
    {
        $items = Cache::remember('banners_active', 600, function () {
            $banners = Banner::query()
                ->active()
                ->ordered()
                ->get();

            return BannerResource::collection($banners)->resolve();
        });

        return $this->successResponse([
            'items' => $items,
        ]);
    }
}
