<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Event;
use App\Models\Province;
use Illuminate\Support\Facades\Cache;

/**
 * HomeController – serves a single aggregated payload for the travel homepage.
 *
 * ASSUMPTIONS (one per line):
 * - Destination uses is_published (boolean) for published status (not `status = 'published'`).
 * - BlogPost uses is_published + published_at for published status (scopePublished).
 * - Event uses is_published for published status (scopePublished + scopeUpcoming).
 * - Province does NOT have an is_published column; all rows are shown.
 * - cover_image on Destination is a raw path/URL stored in the column (accessor not defined, use getImageUrl on frontend).
 * - avg_rating is a denormalized float column on Destination (updated by Review observer).
 * - Category has is_active column (not is_published).
 * - Cache driver is 'array' in local dev (no Redis). Switch CACHE_STORE=redis in production.
 * - DB indexes migration runs separately via `php artisan migrate`.
 */
class HomeController extends Controller
{
    /** Cache key and TTL */
    private const CACHE_KEY = 'home:v1';
    private const CACHE_TTL = 600; // 10 minutes in seconds

    public function index()
    {
        $data = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return $this->buildPayload();
        });

        return response()->json([
            'success' => true,
            'data'    => $data,
        ])
        ->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600')
        ->header('Vary', 'Accept-Encoding');
    }

    private function buildPayload(): array
    {
        // ── FEATURED & BY_CATEGORY POOL (Batched to prevent remote roundtrips) ─
        $destCols = [
            'id', 'slug', 'name_km', 'name_en', 'excerpt_km', 'excerpt_en',
            'cover_image', 'avg_rating', 'reviews_count', 'is_free', 'is_featured',
            'province_id', 'category_id',
        ];

        $categories = Category::active()
            ->ordered()
            ->get(['id', 'slug', 'name_km', 'name_en', 'icon', 'image']);

        $allDestinations = Destination::published()
            ->whereNotNull('cover_image')
            ->where('cover_image', '!=', '')
            ->orderByDesc('is_featured')
            ->orderByDesc('avg_rating')
            ->with([
                'province:id,slug,name_km,name_en,code',
                'category:id,slug,name_km,name_en,icon',
            ])
            ->get($destCols);

        $featured = $allDestinations
            ->take(40)
            ->map(fn($d) => $this->formatDestination($d))
            ->values()
            ->all();

        $byCategory = [];
        foreach ($categories as $cat) {
            $items = $allDestinations
                ->where('category_id', $cat->id)
                ->take(16)
                ->map(fn($d) => $this->formatDestination($d))
                ->values()
                ->all();

            if (!empty($items)) {
                $byCategory[$cat->slug] = $items;
            }
        }

        // ── PROVINCES (all, with destination count) ───────────────────────────
        $provinces = Province::ordered()
            ->withCount(['destinations' => fn($q) => $q->published()])
            ->get([
                'id', 'slug', 'name_km', 'name_en', 'code',
                'image', 'is_featured', 'latitude', 'longitude',
            ])
            ->map(fn($p) => [
                'id'                 => $p->id,
                'slug'               => $p->slug,
                'name_km'            => $p->name_km,
                'name_en'            => $p->name_en,
                'code'               => $p->code,
                'image'              => $p->image,
                'image_url'          => $p->image_url ?? $p->image,
                'is_featured'        => $p->is_featured,
                'latitude'           => $p->latitude,
                'longitude'          => $p->longitude,
                'destinations_count' => $p->destinations_count,
            ])
            ->values()
            ->all();

        // ── EVENTS (published, ordered by start_date, identical to Events page) ────
        $events = Event::published()
            ->with('province')
            ->orderBy('start_date', 'asc')
            ->limit(24)
            ->get();
        $eventsFormatted = EventResource::collection($events)->resolve();

        // ── BLOG POSTS (latest 24, published) ────────────────────────────────
        $posts = BlogPost::published()
            ->recent()
            ->limit(24)
            ->get([
                'id', 'slug', 'title_km', 'title_en',
                'excerpt_km', 'excerpt_en', 'cover_image',
                'published_at', 'view_count',
            ])
            ->map(fn($p) => [
                'id'           => $p->id,
                'slug'         => $p->slug,
                'title_km'     => $p->title_km,
                'title_en'     => $p->title_en,
                'excerpt_km'   => $p->excerpt_km,
                'excerpt_en'   => $p->excerpt_en,
                'cover_image'  => $p->cover_image,
                'image_url'    => $p->cover_image,
                'published_at' => $p->published_at?->toIso8601String(),
                'view_count'   => $p->view_count,
            ])
            ->values()
            ->all();

        // ── CATEGORIES (formatted for frontend use) ──────────────────────────
        $categoriesFormatted = $categories->map(fn($c) => [
            'id'        => $c->id,
            'slug'      => $c->slug,
            'name_km'   => $c->name_km,
            'name_en'   => $c->name_en,
            'icon'      => $c->icon,
            'image'     => $c->image,
            'image_url' => $c->image,
        ])
        ->values()
        ->all();

        return [
            'featured'    => $featured,
            'by_category' => $byCategory,
            'provinces'   => $provinces,
            'events'      => $eventsFormatted,
            'posts'       => $posts,
            'categories'  => $categoriesFormatted,
        ];
    }

    private function formatDestination(Destination $d): array
    {
        return [
            'id'             => $d->id,
            'slug'           => $d->slug,
            'name_km'        => $d->name_km,
            'name_en'        => $d->name_en,
            'excerpt_km'     => $d->excerpt_km,
            'excerpt_en'     => $d->excerpt_en,
            'cover_image'    => $d->cover_image,
            'image_url'      => $d->cover_image,
            'image'          => $d->cover_image,
            'avg_rating'     => $d->avg_rating,
            'reviews_count'  => $d->reviews_count,
            'is_free'        => $d->is_free,
            'is_featured'    => $d->is_featured,
            'province'       => $d->province ? [
                'id'      => $d->province->id,
                'slug'    => $d->province->slug,
                'name_km' => $d->province->name_km,
                'name_en' => $d->province->name_en,
                'code'    => $d->province->code,
            ] : null,
            'category'       => $d->category ? [
                'id'      => $d->category->id,
                'slug'    => $d->category->slug,
                'name_km' => $d->category->name_km,
                'name_en' => $d->category->name_en,
                'icon'    => $d->category->icon,
            ] : null,
        ];
    }
}
