<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\DestinationDetailResource;
use App\Http\Resources\DestinationListResource;
use App\Models\AuditLog;
use App\Models\Destination;
use App\Models\DestinationImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminDestinationController extends ApiController
{
    /**
     * List destinations for admin management.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Destination::query()->with(['province', 'category']);

        if ($request->filled('province_id')) {
            $query->where('province_id', $request->input('province_id'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        if ($request->filled('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('name_km', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $paginated = $query->latest()->paginate($perPage);

        return $this->successResponse([
            'items' => DestinationListResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * Store new destination.
     */
    public function store(Request $request): JsonResponse
    {
        $hasCover = $request->hasFile('cover_image') || $request->hasFile('image');
        $coverFileKey = $request->hasFile('cover_image') ? 'cover_image' : 'image';
        $coverRule = $hasCover
            ? 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:10240'
            : 'nullable|string';

        $validated = $request->validate([
            'province_id' => 'required|exists:provinces,id',
            'category_id' => 'required|exists:categories,id',
            'name_km' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'excerpt_km' => 'nullable|string|max:500',
            'excerpt_en' => 'nullable|string|max:500',
            'description_km' => 'required|string',
            'description_en' => 'required|string',
            'highlights_km' => 'nullable|array',
            'highlights_en' => 'nullable|array',
            'cover_image' => $coverRule,
            'image' => 'nullable',
            'opening_hours_km' => 'nullable|string|max:255',
            'opening_hours_en' => 'nullable|string|max:255',
            'entrance_fee_km' => 'nullable|string|max:255',
            'entrance_fee_en' => 'nullable|string|max:255',
            'entrance_fee_usd' => 'nullable|numeric|min:0',
            'is_free' => 'boolean',
            'best_time_km' => 'nullable|string|max:255',
            'best_time_en' => 'nullable|string|max:255',
            'how_to_get_there_km' => 'nullable|string',
            'how_to_get_there_en' => 'nullable|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address_km' => 'nullable|string|max:255',
            'address_en' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if ($hasCover) {
            $validated['cover_image'] = \App\Services\StorageService::upload($request->file($coverFileKey), 'destinations', 'cover');
        }
        unset($validated['image']);

        $ulid = (string) Str::ulid();
        $slug = Str::slug($validated['name_en']) . '-' . substr($ulid, -6);

        $destination = Destination::create(array_merge($validated, [
            'ulid' => $ulid,
            'slug' => $slug,
        ]));

        if (!empty($destination->cover_image)) {
            DestinationImage::create([
                'destination_id' => $destination->id,
                'image_path' => $destination->cover_image,
                'caption_en' => 'Cover Photo',
                'caption_km' => 'រូបភាពក្របមុខ',
                'is_cover' => true,
                'order' => 1,
            ]);
        }

        Cache::flush();
        AuditLog::record('destination_created', $destination);

        return $this->successResponse([
            'destination' => new DestinationDetailResource($destination->load(['province', 'category', 'images'])),
        ], 'Destination created successfully', 201);
    }

    /**
     * Show single destination for edit.
     */
    public function show(string $id): JsonResponse
    {
        $destination = Destination::with(['province', 'category', 'images'])->find($id);
        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        return $this->successResponse([
            'destination' => new DestinationDetailResource($destination),
        ]);
    }

    /**
     * Update destination.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        $hasCover = $request->hasFile('cover_image') || $request->hasFile('image');
        $coverFileKey = $request->hasFile('cover_image') ? 'cover_image' : 'image';
        $coverRule = $hasCover
            ? 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:10240'
            : 'nullable|string';

        $validated = $request->validate([
            'province_id' => 'sometimes|required|exists:provinces,id',
            'category_id' => 'sometimes|required|exists:categories,id',
            'name_km' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|required|string|max:255',
            'excerpt_km' => 'nullable|string|max:500',
            'excerpt_en' => 'nullable|string|max:500',
            'description_km' => 'sometimes|required|string',
            'description_en' => 'sometimes|required|string',
            'highlights_km' => 'nullable|array',
            'highlights_en' => 'nullable|array',
            'cover_image' => $coverRule,
            'image' => 'nullable',
            'opening_hours_km' => 'nullable|string|max:255',
            'opening_hours_en' => 'nullable|string|max:255',
            'entrance_fee_km' => 'nullable|string|max:255',
            'entrance_fee_en' => 'nullable|string|max:255',
            'entrance_fee_usd' => 'nullable|numeric|min:0',
            'is_free' => 'boolean',
            'best_time_km' => 'nullable|string|max:255',
            'best_time_en' => 'nullable|string|max:255',
            'how_to_get_there_km' => 'nullable|string',
            'how_to_get_there_en' => 'nullable|string',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'address_km' => 'nullable|string|max:255',
            'address_en' => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if ($hasCover) {
            $validated['cover_image'] = \App\Services\StorageService::upload($request->file($coverFileKey), 'destinations', 'cover');

            DestinationImage::updateOrCreate(
                ['destination_id' => $destination->id, 'is_cover' => true],
                ['image_path' => $validated['cover_image'], 'caption_en' => 'Cover Photo', 'caption_km' => 'រូបភាពក្របមុខ']
            );
        }
        unset($validated['image']);

        $oldValues = $destination->toArray();
        $destination->update($validated);

        Cache::flush();
        AuditLog::record('destination_updated', $destination, $oldValues, $destination->toArray());

        return $this->successResponse([
            'destination' => new DestinationDetailResource($destination->load(['province', 'category', 'images'])),
        ], 'Destination updated successfully');
    }

    /**
     * Delete destination.
     */
    public function destroy(string $id): JsonResponse
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        $destination->delete();
        Cache::flush();
        AuditLog::record('destination_deleted', $destination);

        return $this->successResponse(null, 'Destination deleted successfully');
    }

    /**
     * Toggle publish status.
     */
    public function togglePublish(string $id): JsonResponse
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        $destination->is_published = !$destination->is_published;
        $destination->save();

        Cache::flush();
        AuditLog::record('destination_toggle_publish', $destination, null, ['is_published' => $destination->is_published]);

        return $this->successResponse([
            'id' => $destination->id,
            'is_published' => $destination->is_published,
        ], 'Publication status updated');
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(string $id): JsonResponse
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        $destination->is_featured = !$destination->is_featured;
        $destination->save();

        Cache::flush();
        AuditLog::record('destination_toggle_featured', $destination, null, ['is_featured' => $destination->is_featured]);

        return $this->successResponse([
            'id' => $destination->id,
            'is_featured' => $destination->is_featured,
        ], 'Featured status updated');
    }

    /**
     * Upload photo to destination gallery.
     */
    public function uploadImage(Request $request, string $id): JsonResponse
    {
        $destination = Destination::find($id);
        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        $request->validate([
            'image' => 'required_without:images|image|mimes:jpeg,png,jpg,webp,gif|max:10240',
            'images' => 'required_without:image|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp,gif|max:10240',
            'caption_en' => 'nullable|string|max:255',
            'caption_km' => 'nullable|string|max:255',
            'is_cover' => 'boolean',
        ]);

        $files = $request->hasFile('images')
            ? $request->file('images')
            : [$request->file('image')];

        $maxOrder = $destination->images()->max('order') ?? 0;
        $created = [];

        foreach ($files as $index => $file) {
            $imageUrl = \App\Services\StorageService::upload($file, 'destinations', 'dest_' . $destination->id);
            $isCover = $index === 0 && $request->boolean('is_cover');

            $created[] = DestinationImage::create([
                'destination_id' => $destination->id,
                'image_path' => $imageUrl,
                'caption_en' => $request->input('caption_en'),
                'caption_km' => $request->input('caption_km'),
                'is_cover' => $isCover,
                'order' => ++$maxOrder,
            ]);

            if ($isCover) {
                $destination->update(['cover_image' => $imageUrl]);
            }
        }

        Cache::flush();
        AuditLog::record('destination_image_uploaded', $destination);

        return $this->successResponse([
            'image' => $created[0] ?? null,
            'images' => $created,
        ], 'Gallery image uploaded successfully');
    }

    /**
     * Delete image from destination gallery.
     */
    public function deleteImage(string $destinationId, string $imageId): JsonResponse
    {
        $image = DestinationImage::where('destination_id', $destinationId)->where('id', $imageId)->first();
        if (!$image) {
            return $this->errorResponse('Image not found', 404);
        }

        $image->delete();

        return $this->successResponse(null, 'Gallery image deleted');
    }
}
