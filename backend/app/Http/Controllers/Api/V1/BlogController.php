<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\BlogPostResource;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BlogController extends ApiController
{
    /**
     * List published blog posts with optional tag filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = BlogPost::query()
            ->published()
            ->with('author')
            ->recent();

        if ($request->filled('tag')) {
            $tag = $request->input('tag');
            $query->whereJsonContains('tags', $tag);
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                  ->orWhere('title_km', 'like', "%{$search}%")
                  ->orWhere('excerpt_en', 'like', "%{$search}%")
                  ->orWhere('excerpt_km', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 9), 30);
        $paginated = $query->paginate($perPage);

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

    /**
     * Show single blog post details.
     */
    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::query()
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug);
                if (is_numeric($slug)) {
                    $q->orWhere('id', (int) $slug);
                }
            })
            ->published()
            ->with('author')
            ->first();

        if (!$post) {
            return $this->errorResponse('Blog post not found', 404);
        }

        $post->incrementQuietly('view_count');

        $related = BlogPost::query()
            ->published()
            ->where('id', '!=', $post->id)
            ->recent()
            ->take(3)
            ->get();

        return $this->successResponse([
            'post' => new BlogPostResource($post),
            'related' => BlogPostResource::collection($related),
        ]);
    }

    /**
     * Recent blog posts for homepage.
     */
    public function recent(): JsonResponse
    {
        $posts = Cache::remember('blog_recent_home', 600, function () {
            return BlogPost::query()
                ->published()
                ->with('author')
                ->recent()
                ->take(3)
                ->get();
        });

        return $this->successResponse([
            'items' => BlogPostResource::collection($posts),
        ]);
    }
}
