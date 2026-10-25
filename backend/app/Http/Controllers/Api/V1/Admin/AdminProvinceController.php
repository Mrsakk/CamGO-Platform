<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\ProvinceResource;
use App\Models\AuditLog;
use App\Models\Province;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminProvinceController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Province::query()->withCount('destinations')->ordered();

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where('name_en', 'like', "%{$search}%")
                  ->orWhere('name_km', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
        }

        return $this->successResponse([
            'items' => ProvinceResource::collection($query->get()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $hasImage = $request->hasFile('image');
        $imageRule = $hasImage
            ? 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:10240'
            : 'nullable|string';

        $validated = $request->validate([
            'name_km' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:provinces,code',
            'description_km' => 'nullable|string',
            'description_en' => 'nullable|string',
            'image' => $imageRule,
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'area_km2' => 'nullable|numeric',
            'population' => 'nullable|integer',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ]);

        if ($hasImage) {
            $validated['image'] = \App\Services\StorageService::upload($request->file('image'), 'provinces', 'prov');
        }

        $province = Province::create(array_merge($validated, [
            'slug' => Str::slug($validated['name_en']),
        ]));

        Cache::flush();
        AuditLog::record('province_created', $province);

        return $this->successResponse([
            'province' => new ProvinceResource($province),
        ], 'Province created successfully', 201);
    }

    public function show(string $id): JsonResponse
    {
        $province = Province::withCount('destinations')->find($id);
        if (!$province) {
            return $this->errorResponse('Province not found', 404);
        }

        return $this->successResponse([
            'province' => new ProvinceResource($province),
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $province = Province::find($id);
        if (!$province) {
            return $this->errorResponse('Province not found', 404);
        }

        $hasImage = $request->hasFile('image');
        $imageRule = $hasImage
            ? 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:10240'
            : 'nullable|string';

        $validated = $request->validate([
            'name_km' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:10|unique:provinces,code,' . $province->id,
            'description_km' => 'nullable|string',
            'description_en' => 'nullable|string',
            'image' => $imageRule,
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'area_km2' => 'nullable|numeric',
            'population' => 'nullable|integer',
            'is_featured' => 'boolean',
            'order' => 'integer',
        ]);

        if ($hasImage) {
            $validated['image'] = \App\Services\StorageService::upload($request->file('image'), 'provinces', 'prov');
        }

        $province->update($validated);
        Cache::flush();
        AuditLog::record('province_updated', $province);

        return $this->successResponse([
            'province' => new ProvinceResource($province),
        ], 'Province updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $province = Province::find($id);
        if (!$province) {
            return $this->errorResponse('Province not found', 404);
        }

        $province->delete();
        Cache::flush();
        AuditLog::record('province_deleted', $province);

        return $this->successResponse(null, 'Province deleted');
    }
}
