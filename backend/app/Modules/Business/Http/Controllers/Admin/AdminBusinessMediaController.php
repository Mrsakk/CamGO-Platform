<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Actions\ProcessMediaAction;
use App\Modules\Business\Http\Resources\BusinessMediaResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminBusinessMediaController extends ApiController
{
    public function upload(Request $request, int $businessId, ProcessMediaAction $processMedia): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('update', $business);

        $request->validate([
            'image' => 'required_without:images|file|mimes:jpeg,png,webp,jpg|max:5120',
            'images' => 'required_without:image|array',
            'images.*' => 'file|mimes:jpeg,png,webp,jpg|max:5120',
            'alt_km' => 'nullable|string|max:255',
            'alt_en' => 'nullable|string|max:255',
            'is_cover' => 'boolean',
        ]);

        $files = $request->hasFile('images')
            ? $request->file('images')
            : [$request->file('image')];

        $currentMaxOrder = $business->media()->max('sort_order') ?? 0;
        $created = [];

        foreach ($files as $idx => $file) {
            $paths = $processMedia->execute($file, $business->id);
            $isCover = ($idx === 0 && $request->boolean('is_cover')) || $business->media()->count() === 0;

            if ($isCover) {
                $business->media()->update(['is_cover' => false]);
            }

            $media = $business->media()->create([
                'path' => $paths['path'],
                'path_800' => $paths['path_800'],
                'path_400' => $paths['path_400'],
                'alt_km' => $request->input('alt_km'),
                'alt_en' => $request->input('alt_en'),
                'sort_order' => $currentMaxOrder + $idx + 1,
                'is_cover' => $isCover,
            ]);

            if ($isCover) {
                $business->update(['cover_media_id' => $media->id]);
            }

            $created[] = $media;
        }

        AuditLog::record('business_media_uploaded', $business, null, ['count' => count($created)]);

        return $this->successResponse(
            BusinessMediaResource::collection($created),
            'Images uploaded and processed to WebP successfully',
            201
        );
    }

    public function setCover(int $businessId, int $mediaId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('update', $business);

        $media = $business->media()->findOrFail($mediaId);

        $business->media()->update(['is_cover' => false]);
        $media->update(['is_cover' => true]);
        $business->update(['cover_media_id' => $media->id]);

        AuditLog::record('business_cover_updated', $business, null, ['cover_media_id' => $mediaId]);

        return $this->successResponse(new BusinessMediaResource($media), 'Cover photo updated');
    }

    public function reorder(Request $request, int $businessId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('update', $business);

        $request->validate([
            'order' => 'required|array',
            'order.*.id' => 'required|integer',
            'order.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->input('order') as $item) {
            $business->media()->where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return $this->successResponse(
            BusinessMediaResource::collection($business->media()->orderBy('sort_order')->get()),
            'Media order updated'
        );
    }

    public function destroy(int $businessId, int $mediaId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('update', $business);

        $media = $business->media()->findOrFail($mediaId);

        // Delete physical files
        $disk = Storage::disk('public');
        if ($media->path && !str_starts_with($media->path, 'http')) $disk->delete($media->path);
        if ($media->path_800 && !str_starts_with($media->path_800, 'http')) $disk->delete($media->path_800);
        if ($media->path_400 && !str_starts_with($media->path_400, 'http')) $disk->delete($media->path_400);

        $wasCover = $media->is_cover || $business->cover_media_id === $media->id;
        $media->delete();

        if ($wasCover) {
            $next = $business->media()->first();
            if ($next) {
                $next->update(['is_cover' => true]);
                $business->update(['cover_media_id' => $next->id]);
            } else {
                $business->update(['cover_media_id' => null]);
            }
        }

        AuditLog::record('business_media_deleted', $business, ['media_id' => $mediaId]);

        return $this->successResponse(null, 'Media item deleted');
    }
}
