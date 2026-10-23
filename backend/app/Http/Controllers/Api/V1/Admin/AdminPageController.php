<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\PageResource;
use App\Models\AuditLog;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminPageController extends ApiController
{
    public function index(): JsonResponse
    {
        $pages = Page::all();
        return $this->successResponse(['items' => PageResource::collection($pages)]);
    }

    public function show(string $id): JsonResponse
    {
        $page = Page::find($id);
        if (!$page) {
            return $this->errorResponse('Page not found', 404);
        }

        return $this->successResponse(['page' => new PageResource($page)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slug' => 'required|string|unique:pages,slug',
            'title_km' => 'required|string|max:255',
            'title_en' => 'required|string|max:255',
            'content_km' => 'required|string',
            'content_en' => 'required|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_published' => 'boolean',
        ]);

        $page = Page::create($validated);
        Cache::flush();
        AuditLog::record('page_created', $page);

        return $this->successResponse(['page' => new PageResource($page)], 'Page created successfully', 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $page = Page::find($id);
        if (!$page) {
            return $this->errorResponse('Page not found', 404);
        }

        $validated = $request->validate([
            'slug' => 'sometimes|required|string|unique:pages,slug,' . $page->id,
            'title_km' => 'sometimes|required|string|max:255',
            'title_en' => 'sometimes|required|string|max:255',
            'content_km' => 'sometimes|required|string',
            'content_en' => 'sometimes|required|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'is_published' => 'boolean',
        ]);

        $page->update($validated);
        Cache::flush();
        AuditLog::record('page_updated', $page);

        return $this->successResponse(['page' => new PageResource($page)], 'Page updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $page = Page::find($id);
        if (!$page) {
            return $this->errorResponse('Page not found', 404);
        }

        $page->delete();
        Cache::flush();
        AuditLog::record('page_deleted', $page);

        return $this->successResponse(null, 'Page deleted');
    }
}
