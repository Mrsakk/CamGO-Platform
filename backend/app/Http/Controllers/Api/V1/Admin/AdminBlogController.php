<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\BlogPostResource;
use App\Models\AuditLog;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminBlogController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = BlogPost::query()->with('author');

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                  ->orWhere('title_km', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $paginated = $query->latest()->paginate($perPage);

        return $this->successResponse([
            'items' => BlogPostResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $hasCover = $request->hasFile('cover_image') || $request->hasFile('image');
        $coverFileKey = $request->hasFile('cover_image') ? 'cover_image' : 'image';
        $coverRule = $hasCover
            ? 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:10240'
            : 'nullable|string';

        $validated = $request->validate([
            'title_km' => 'required|string|max:255',
            'title_en' => 'required|string|max:255',
            'excerpt_km' => 'nullable|string|max:500',
            'excerpt_en' => 'nullable|string|max:500',
            'content_km' => 'required|string',
            'content_en' => 'required|string',
            'cover_image' => $coverRule,
            'image' => 'nullable',
            'tags' => 'nullable|array',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        if ($hasCover) {
            $validated['cover_image'] = \App\Services\StorageService::upload($request->file($coverFileKey), 'blog', 'blog');
        }
        unset($validated['image']);

        $post = BlogPost::create(array_merge($validated, [
            'slug' => Str::slug($validated['title_en']) . '-' . Str::random(5),
            'author_id' => $request->user()->id,
            'published_at' => $validated['published_at'] ?? now(),
        ]));

        Cache::flush();
        AuditLog::record('blog_post_created', $post);

        return $this->successResponse([
            'post' => new BlogPostResource($post->load('author')),
        ], 'Blog post created successfully', 201);
    }

    public function show(string $id): JsonResponse
    {
        $post = BlogPost::with('author')->find($id);
        if (!$post) {
            return $this->errorResponse('Blog post not found', 404);
        }

        return $this->successResponse([
            'post' => new BlogPostResource($post),
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $post = BlogPost::find($id);
        if (!$post) {
            return $this->errorResponse('Blog post not found', 404);
        }

        $hasCover = $request->hasFile('cover_image') || $request->hasFile('image');
        $coverFileKey = $request->hasFile('cover_image') ? 'cover_image' : 'image';
        $coverRule = $hasCover
            ? 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:10240'
            : 'nullable|string';

        $validated = $request->validate([
            'title_km' => 'sometimes|required|string|max:255',
            'title_en' => 'sometimes|required|string|max:255',
            'excerpt_km' => 'nullable|string|max:500',
            'excerpt_en' => 'nullable|string|max:500',
            'content_km' => 'sometimes|required|string',
            'content_en' => 'sometimes|required|string',
            'cover_image' => $coverRule,
            'image' => 'nullable',
            'tags' => 'nullable|array',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        if ($hasCover) {
            $validated['cover_image'] = \App\Services\StorageService::upload($request->file($coverFileKey), 'blog', 'blog');
        }
        unset($validated['image']);

        $post->update($validated);
        Cache::flush();
        AuditLog::record('blog_post_updated', $post);

        return $this->successResponse([
            'post' => new BlogPostResource($post->load('author')),
        ], 'Blog post updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $post = BlogPost::find($id);
        if (!$post) {
            return $this->errorResponse('Blog post not found', 404);
        }

        $post->delete();
        Cache::flush();
        AuditLog::record('blog_post_deleted', $post);

        return $this->successResponse(null, 'Blog post deleted');
    }
}
