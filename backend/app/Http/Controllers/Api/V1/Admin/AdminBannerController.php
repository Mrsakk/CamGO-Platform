<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\BannerResource;
use App\Models\AuditLog;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminBannerController extends ApiController
{
    public function index(): JsonResponse
    {
        $banners = Banner::query()->ordered()->get();
        return $this->successResponse(['items' => BannerResource::collection($banners)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title_km' => 'required|string|max:255',
            'title_en' => 'required|string|max:255',
            'subtitle_km' => 'nullable|string',
            'subtitle_en' => 'nullable|string',
            'image_url' => 'required|string',
            'button_text_km' => 'nullable|string',
            'button_text_en' => 'nullable|string',
            'link_url' => 'nullable|string',
            'order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $banner = Banner::create($validated);
        Cache::flush();
        AuditLog::record('banner_created', $banner);

        return $this->successResponse(['banner' => new BannerResource($banner)], 'Banner created successfully', 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return $this->errorResponse('Banner not found', 404);
        }

        $validated = $request->validate([
            'title_km' => 'sometimes|required|string|max:255',
            'title_en' => 'sometimes|required|string|max:255',
            'subtitle_km' => 'nullable|string',
            'subtitle_en' => 'nullable|string',
            'image_url' => 'sometimes|required|string',
            'button_text_km' => 'nullable|string',
            'button_text_en' => 'nullable|string',
            'link_url' => 'nullable|string',
            'order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $banner->update($validated);
        Cache::flush();
        AuditLog::record('banner_updated', $banner);

        return $this->successResponse(['banner' => new BannerResource($banner)], 'Banner updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return $this->errorResponse('Banner not found', 404);
        }

        $banner->delete();
        Cache::flush();
        AuditLog::record('banner_deleted', $banner);

        return $this->successResponse(null, 'Banner deleted');
    }
}
