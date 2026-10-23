<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Event;
use App\Models\Province;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HomeEndpointTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_home_endpoint_returns_expected_structure(): void
    {
        $response = $this->getJson('/api/v1/home');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'featured',
                    'by_category',
                    'provinces',
                    'events',
                    'posts',
                    'categories',
                ],
            ])
            ->assertJson(['success' => true]);
    }

    public function test_home_endpoint_returns_only_published_destinations(): void
    {
        $province  = Province::first();
        $category  = Category::first();

        // Create one published destination with cover image
        $published = Destination::create([
            'slug'           => 'test-published-destination-' . uniqid(),
            'name_km'        => 'ទីតាំងទេសចរណ៍សាកល្បង',
            'name_en'        => 'Test Published Sanctuary',
            'description_km' => 'ការពិពណ៌នាអំពីទីតាំងទេសចរណ៍សាកល្បង',
            'description_en' => 'Description for test published sanctuary',
            'latitude'       => 13.3633,
            'longitude'      => 103.8564,
            'is_published'   => true,
            'is_featured'    => true,
            'cover_image'    => 'destinations/test-image.jpg',
            'province_id'    => $province->id,
            'category_id'    => $category->id,
            'avg_rating'     => 4.8,
        ]);

        // Create one unpublished destination
        $unpublished = Destination::create([
            'slug'           => 'test-unpublished-destination-' . uniqid(),
            'name_km'        => 'ទីតាំងទេសចរណ៍មិនទាន់ផ្សាយ',
            'name_en'        => 'Test Unpublished Sanctuary',
            'description_km' => 'ការពិពណ៌នាមិនទាន់ផ្សាយ',
            'description_en' => 'Description for unpublished sanctuary',
            'latitude'       => 13.3633,
            'longitude'      => 103.8564,
            'is_published'   => false,
            'is_featured'    => true,
            'cover_image'    => 'destinations/test-image-2.jpg',
            'province_id'    => $province->id,
            'category_id'    => $category->id,
            'avg_rating'     => 4.9,
        ]);

        Cache::flush(); // force rebuild

        $response = $this->getJson('/api/v1/home');
        $response->assertOk();

        $featured = collect($response->json('data.featured'));

        $this->assertTrue(
            $featured->contains('id', $published->id),
            'Published destination should appear in featured pool'
        );
        $this->assertFalse(
            $featured->contains('id', $unpublished->id),
            'Unpublished destination must NOT appear in featured pool'
        );
    }

    public function test_home_endpoint_uses_cache_on_second_call(): void
    {
        // First call – builds and caches
        $this->getJson('/api/v1/home')->assertOk();

        // Count queries on the second call – should hit cache (0 queries)
        $queryCount = 0;
        DB::listen(function () use (&$queryCount) {
            $queryCount++;
        });

        $this->getJson('/api/v1/home')->assertOk();

        $this->assertEquals(
            0,
            $queryCount,
            "Second call to /api/v1/home should hit cache and make 0 DB queries, got {$queryCount}"
        );
    }

    public function test_home_endpoint_sets_cache_control_header(): void
    {
        $response = $this->getJson('/api/v1/home');
        $response->assertOk();
        $cacheControl = $response->headers->get('Cache-Control');
        $this->assertNotNull($cacheControl);
        $this->assertStringContainsString('public', $cacheControl);
        $this->assertStringContainsString('max-age=60', $cacheControl);
        $this->assertStringContainsString('stale-while-revalidate=600', $cacheControl);
    }

    public function test_home_endpoint_only_returns_published_events(): void
    {
        $province = Province::first();

        $publishedEvent = Event::create([
            'slug'           => 'test-published-event-' . uniqid(),
            'title_km'       => 'ពិធីបុណ្យសាកល្បង',
            'title_en'       => 'Test Published Festival',
            'description_km' => 'ការពិពណ៌នាអំពីពិធីបុណ្យ',
            'description_en' => 'Description for festival',
            'is_published'   => true,
            'start_date'     => now()->addDays(5),
            'end_date'       => now()->addDays(7),
            'province_id'    => $province->id,
        ]);

        $unpublishedEvent = Event::create([
            'slug'           => 'test-unpublished-event-' . uniqid(),
            'title_km'       => 'ពិធីបុណ្យមិនទាន់ផ្សាយ',
            'title_en'       => 'Test Unpublished Festival',
            'description_km' => 'ការពិពណ៌នាមិនទាន់ផ្សាយ',
            'description_en' => 'Description unpublished',
            'is_published'   => false,
            'start_date'     => now()->addDays(10),
            'end_date'       => now()->addDays(12),
            'province_id'    => $province->id,
        ]);

        Cache::flush();

        $response = $this->getJson('/api/v1/home');
        $response->assertOk();

        $events = collect($response->json('data.events'));
        $this->assertTrue(
            $events->contains('id', $publishedEvent->id),
            'Published event should appear in events pool'
        );
        $this->assertFalse(
            $events->contains('id', $unpublishedEvent->id),
            'Unpublished event must NOT appear in events pool'
        );
    }
}
