<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Http\Resources\CategoryResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminBusinessCategoryController extends ApiController
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Business::class);

        $categories = Category::withCount('businesses')
            ->orderBy('sort_order')
            ->orderBy('name_en')
            ->get();

        return $this->successResponse(CategoryResource::collection($categories));
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('manageCategories', Business::class);

        $validated = $request->validate([
            'name_km' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:biz_categories,slug',
            'icon' => 'nullable|string|max:100',
            'sort_order' => 'integer',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name_en']);
        }

        $category = Category::create($validated);
        AuditLog::record('business_category_created', 'Category', null, $category->toArray());

        return $this->successResponse(new CategoryResource($category), 'Category created successfully', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $this->authorize('manageCategories', Business::class);

        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name_km' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('biz_categories', 'slug')->ignore($category->id),
            ],
            'icon' => 'nullable|string|max:100',
            'sort_order' => 'integer',
        ]);

        $category->update($validated);
        AuditLog::record('business_category_updated', 'Category', null, $category->toArray());

        return $this->successResponse(new CategoryResource($category), 'Category updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->authorize('manageCategories', Business::class);

        $category = Category::withCount('businesses')->findOrFail($id);

        if ($category->businesses_count > 0) {
            return $this->errorResponse(
                "Cannot delete category with {$category->businesses_count} assigned businesses. Please reassign them first.",
                422
            );
        }

        $category->delete();
        AuditLog::record('business_category_deleted', 'Category', ['id' => $id]);

        return $this->successResponse(null, 'Category deleted successfully');
    }
}
