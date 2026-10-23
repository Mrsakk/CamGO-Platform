<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\CategoryResource;
use App\Models\AuditLog;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminCategoryController extends ApiController
{
    public function index(): JsonResponse
    {
        $categories = Category::query()->withCount('destinations')->ordered()->get();

        return $this->successResponse([
            'items' => CategoryResource::collection($categories),
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
            'icon' => 'nullable|string|max:50',
            'description_km' => 'nullable|string',
            'description_en' => 'nullable|string',
            'image' => $imageRule,
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        if ($hasImage) {
            $path = $request->file('image')->store('categories', 'public');
            $validated['image'] = Storage::url($path);
        }

        $category = Category::create(array_merge($validated, [
            'slug' => Str::slug($validated['name_en']),
        ]));

        Cache::flush();
        AuditLog::record('category_created', $category);

        return $this->successResponse([
            'category' => new CategoryResource($category),
        ], 'Category created successfully', 201);
    }

    public function show(string $id): JsonResponse
    {
        $category = Category::withCount('destinations')->find($id);
        if (!$category) {
            return $this->errorResponse('Category not found', 404);
        }

        return $this->successResponse([
            'category' => new CategoryResource($category),
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) {
            return $this->errorResponse('Category not found', 404);
        }

        $hasImage = $request->hasFile('image');
        $imageRule = $hasImage
            ? 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:10240'
            : 'nullable|string';

        $validated = $request->validate([
            'name_km' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|required|string|max:255',
            'icon' => 'nullable|string|max:50',
            'description_km' => 'nullable|string',
            'description_en' => 'nullable|string',
            'image' => $imageRule,
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        if ($hasImage) {
            $path = $request->file('image')->store('categories', 'public');
            $validated['image'] = Storage::url($path);
        }

        $category->update($validated);
        Cache::flush();
        AuditLog::record('category_updated', $category);

        return $this->successResponse([
            'category' => new CategoryResource($category),
        ], 'Category updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) {
            return $this->errorResponse('Category not found', 404);
        }

        $category->delete();
        Cache::flush();
        AuditLog::record('category_deleted', $category);

        return $this->successResponse(null, 'Category deleted');
    }
}
