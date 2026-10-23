<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Destination;
use App\Models\Province;
use Tests\TestCase;

class DestinationTest extends TestCase
{
    public function test_can_list_destinations_with_pagination(): void
    {
        $response = $this->getJson('/api/v1/destinations');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    'items',
                    'meta' => ['current_page', 'last_page', 'per_page', 'total'],
                ],
            ]);
    }

    public function test_can_view_single_destination_details(): void
    {
        $destination = Destination::published()->first();

        $this->assertNotNull($destination, 'Database should have at least one seeded destination');

        $response = $this->getJson('/api/v1/destinations/' . $destination->slug);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'destination' => [
                        'id' => $destination->id,
                        'slug' => $destination->slug,
                        'name_en' => $destination->name_en,
                    ],
                ],
            ]);
    }

    public function test_can_filter_destinations_by_province(): void
    {
        $province = Province::where('code', 'SRP')->first();
        $this->assertNotNull($province);

        $response = $this->getJson('/api/v1/destinations?province=' . $province->slug);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $items = $response->json('data.items');
        foreach ($items as $item) {
            $this->assertEquals($province->slug, $item['province']['slug']);
        }
    }

    public function test_can_get_featured_and_popular_destinations(): void
    {
        $featuredRes = $this->getJson('/api/v1/destinations/featured');
        $featuredRes->assertStatus(200)->assertJson(['success' => true]);

        $popularRes = $this->getJson('/api/v1/destinations/popular');
        $popularRes->assertStatus(200)->assertJson(['success' => true]);
    }
}
