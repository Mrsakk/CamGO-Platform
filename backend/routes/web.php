<?php

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Event;
use App\Models\Province;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return response()->json([
        'name' => 'CamGO Travel API',
        'version' => '1.0.0',
        'status' => 'operational',
    ]);
});

Route::get('/logo.png', function () {
    $candidates = [
        public_path('logo.png'),
        base_path('storage/app/public/settings/v90ORpDANwMmycKmo3ytkVA1bg2fvKYxac02YzWK.png'),
        storage_path('app/public/settings/v90ORpDANwMmycKmo3ytkVA1bg2fvKYxac02YzWK.png'),
    ];

    foreach ($candidates as $file) {
        if (file_exists($file) && is_file($file)) {
            return response()->file($file, [
                'Content-Type' => 'image/png',
                'Cache-Control' => 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin' => '*',
            ]);
        }
    }

    abort(404);
});

Route::get('/media/{path}', function (string $path) {
    $candidates = [
        base_path('storage/app/public/'.$path),
        storage_path('app/public/'.$path),
        '/tmp/storage/app/public/'.$path,
        public_path('storage/'.$path),
    ];

    foreach ($candidates as $file) {
        if (file_exists($file) && is_file($file)) {
            $mime = mime_content_type($file) ?: 'application/octet-stream';
            return response()->file($file, [
                'Content-Type' => $mime,
                'Cache-Control' => 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin' => '*',
            ]);
        }
    }

    abort(404);
})->where('path', '.*');

Route::get('/storage/{path}', function (string $path) {
    $candidates = [
        base_path('storage/app/public/'.$path),
        storage_path('app/public/'.$path),
        '/tmp/storage/app/public/'.$path,
        public_path('storage/'.$path),
    ];

    foreach ($candidates as $file) {
        if (file_exists($file) && is_file($file)) {
            $mime = mime_content_type($file) ?: 'application/octet-stream';
            return response()->file($file, [
                'Content-Type' => $mime,
                'Cache-Control' => 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin' => '*',
            ]);
        }
    }

    abort(404);
})->where('path', '.*');

Route::get('/sitemap.xml', function () {
    $baseUrl = config('app.frontend_url', 'http://localhost:5173');

    $xml = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // 1. Static Core Pages
    $staticPages = [
        ['loc' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
        ['loc' => '/destinations', 'priority' => '0.9', 'changefreq' => 'daily'],
        ['loc' => '/provinces', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['loc' => '/categories', 'priority' => '0.8', 'changefreq' => 'weekly'],
        ['loc' => '/events', 'priority' => '0.8', 'changefreq' => 'daily'],
        ['loc' => '/blog', 'priority' => '0.8', 'changefreq' => 'daily'],
        ['loc' => '/map', 'priority' => '0.7', 'changefreq' => 'weekly'],
        ['loc' => '/trip-planner', 'priority' => '0.7', 'changefreq' => 'weekly'],
        ['loc' => '/about', 'priority' => '0.6', 'changefreq' => 'monthly'],
        ['loc' => '/contact', 'priority' => '0.6', 'changefreq' => 'monthly'],
        ['loc' => '/faq', 'priority' => '0.5', 'changefreq' => 'monthly'],
        ['loc' => '/terms', 'priority' => '0.4', 'changefreq' => 'monthly'],
        ['loc' => '/privacy', 'priority' => '0.4', 'changefreq' => 'monthly'],
    ];

    foreach ($staticPages as $page) {
        $xml .= '<url>';
        $xml .= '<loc>' . htmlspecialchars($baseUrl . $page['loc']) . '</loc>';
        $xml .= '<changefreq>' . $page['changefreq'] . '</changefreq>';
        $xml .= '<priority>' . $page['priority'] . '</priority>';
        $xml .= '</url>';
    }

    // 2. Destinations
    $destinations = Destination::published()->select('slug', 'updated_at')->get();
    foreach ($destinations as $d) {
        $xml .= '<url>';
        $xml .= '<loc>' . htmlspecialchars($baseUrl . '/destinations/' . $d->slug) . '</loc>';
        $xml .= '<lastmod>' . $d->updated_at->toAtomString() . '</lastmod>';
        $xml .= '<changefreq>weekly</changefreq>';
        $xml .= '<priority>0.85</priority>';
        $xml .= '</url>';
    }

    // 3. Provinces
    $provinces = Province::select('slug', 'updated_at')->get();
    foreach ($provinces as $p) {
        $xml .= '<url>';
        $xml .= '<loc>' . htmlspecialchars($baseUrl . '/provinces/' . $p->slug) . '</loc>';
        $xml .= '<lastmod>' . ($p->updated_at ? $p->updated_at->toAtomString() : now()->toAtomString()) . '</lastmod>';
        $xml .= '<changefreq>weekly</changefreq>';
        $xml .= '<priority>0.75</priority>';
        $xml .= '</url>';
    }

    // 4. Categories
    $categories = Category::select('slug', 'updated_at')->get();
    foreach ($categories as $c) {
        $xml .= '<url>';
        $xml .= '<loc>' . htmlspecialchars($baseUrl . '/categories/' . $c->slug) . '</loc>';
        $xml .= '<lastmod>' . ($c->updated_at ? $c->updated_at->toAtomString() : now()->toAtomString()) . '</lastmod>';
        $xml .= '<changefreq>weekly</changefreq>';
        $xml .= '<priority>0.75</priority>';
        $xml .= '</url>';
    }

    // 5. Blog Posts
    $posts = BlogPost::published()->select('slug', 'updated_at')->get();
    foreach ($posts as $post) {
        $xml .= '<url>';
        $xml .= '<loc>' . htmlspecialchars($baseUrl . '/blog/' . $post->slug) . '</loc>';
        $xml .= '<lastmod>' . $post->updated_at->toAtomString() . '</lastmod>';
        $xml .= '<changefreq>weekly</changefreq>';
        $xml .= '<priority>0.7</priority>';
        $xml .= '</url>';
    }

    // 6. Events
    $events = Event::published()->select('slug', 'updated_at')->get();
    foreach ($events as $evt) {
        $xml .= '<url>';
        $xml .= '<loc>' . htmlspecialchars($baseUrl . '/events/' . $evt->slug) . '</loc>';
        $xml .= '<lastmod>' . $evt->updated_at->toAtomString() . '</lastmod>';
        $xml .= '<changefreq>weekly</changefreq>';
        $xml .= '<priority>0.7</priority>';
        $xml .= '</url>';
    }

    $xml .= '</urlset>';

    return Response::make($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
});
