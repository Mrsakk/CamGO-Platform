<?php

namespace Tests\Feature;

use App\Models\Province;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Category;
use Tests\TestCase;

class BusinessSubscriptionExpiryTest extends TestCase
{
    protected Category $category;
    protected Province $province;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::create([
            'slug' => 'expiry-test-' . uniqid(),
            'name_km' => 'សណ្ឋាគារសាកល្បង',
            'name_en' => 'Expiry Test Hotel',
            'icon' => 'Hotel',
            'sort_order' => 1,
        ]);

        $this->province = Province::firstOrCreate(
            ['slug' => 'phnom-penh'],
            [
                'name_km' => 'ភ្នំពេញ',
                'name_en' => 'Phnom Penh',
                'code' => 'PP',
                'latitude' => 11.5564,
                'longitude' => 104.9282,
            ]
        );
    }

    public function test_featured_requires_an_active_subscription(): void
    {
        $active = $this->makeBusiness([
            'tier' => 'premium',
            'subscription_expires_at' => now()->addMonth(),
            'featured_until' => now()->addMonth(),
        ]);

        $expired = $this->makeBusiness([
            'tier' => 'premium',
            'subscription_expires_at' => now()->subDay(),
            'featured_until' => now()->addMonth(),
        ]);

        $missingExpiry = $this->makeBusiness([
            'tier' => 'premium',
            'subscription_expires_at' => null,
            'featured_until' => now()->addMonth(),
        ]);

        $freePromotion = $this->makeBusiness([
            'tier' => 'free',
            'subscription_expires_at' => null,
            'featured_until' => now()->addMonth(),
        ]);

        $expiredFreePromotion = $this->makeBusiness([
            'tier' => 'free',
            'subscription_expires_at' => null,
            'featured_until' => now()->subDay(),
        ]);

        $this->assertTrue($active->isSubscriptionActive());
        $this->assertTrue($active->isFeatured());

        $this->assertFalse($expired->isSubscriptionActive());
        $this->assertFalse($expired->isFeatured());

        $this->assertFalse($missingExpiry->isSubscriptionActive());
        $this->assertFalse($missingExpiry->isFeatured());

        $this->assertTrue($freePromotion->isFeatured());
        $this->assertFalse($expiredFreePromotion->isFeatured());
    }

    public function test_public_directory_ranks_active_featured_above_expired_featured(): void
    {
        $active = $this->makeBusiness([
            'tier' => 'premium',
            'subscription_expires_at' => now()->addMonth(),
            'featured_until' => now()->addMonth(),
        ]);

        $expired = $this->makeBusiness([
            'tier' => 'premium',
            'subscription_expires_at' => now()->subDay(),
            'featured_until' => now()->addMonth(),
        ]);

        $missingExpiry = $this->makeBusiness([
            'tier' => 'premium',
            'subscription_expires_at' => null,
            'featured_until' => now()->addMonth(),
        ]);

        $response = $this->getJson(
            '/api/v1/business/public/businesses?category=' . $this->category->slug
        );

        $response->assertOk()->assertJsonPath('success', true);

        $items = collect($response->json('data.items'));
        $ids = $items->pluck('id')->all();

        $this->assertCount(3, $items);
        $this->assertLessThan(
            array_search($expired->id, $ids, true),
            array_search($active->id, $ids, true),
            'Active featured business should rank above an expired featured business.'
        );

        $activeItem = $items->firstWhere('id', $active->id);
        $expiredItem = $items->firstWhere('id', $expired->id);
        $missingItem = $items->firstWhere('id', $missingExpiry->id);

        $this->assertTrue($activeItem['is_featured']);
        $this->assertFalse($expiredItem['is_featured']);
        $this->assertFalse($missingItem['is_featured']);
    }

    private function makeBusiness(array $overrides = []): Business
    {
        return Business::create(array_merge([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'slug' => 'expiry-test-' . uniqid(),
            'name_km' => 'សណ្ឋាគារសាកល្បង',
            'name_en' => 'Expiry Test Hotel',
            'address_km' => 'ភ្នំពេញ',
            'address_en' => 'Phnom Penh',
            'lat' => 11.5564,
            'lng' => 104.9282,
            'price_level' => 2,
            'tier' => 'free',
            'status' => 'approved',
            'is_verified' => false,
            'approved_at' => now(),
        ], $overrides));
    }
}
