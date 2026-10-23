<?php

namespace Tests\Feature;

use App\Models\Province;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Category;
use App\Modules\Business\Models\Plan;
use App\Modules\Business\Services\SubscriptionService;
use Database\Seeders\PlanSeeder;
use Tests\TestCase;

class BusinessEntitlementsPhase2Test extends TestCase
{
    protected Category $category;
    protected Province $province;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PlanSeeder::class);

        $this->category = Category::create([
            'slug' => 'phase2-entitlement-' . uniqid(),
            'name_km' => 'Phase 2 Entitlement Hotel',
            'name_en' => 'Phase 2 Entitlement Hotel',
            'icon' => 'Hotel',
            'sort_order' => 1,
        ]);

        $this->province = Province::firstOrCreate(
            ['slug' => 'phase2-phnom-penh-' . uniqid()],
            [
                'name_km' => 'Phnom Penh',
                'name_en' => 'Phnom Penh',
                'code' => 'P2',
                'latitude' => 11.5564,
                'longitude' => 104.9282,
            ]
        );
    }

    public function test_expired_paid_subscription_loses_all_paid_entitlements(): void
    {
        $business = $this->makeBusiness([
            'tier' => 'premium',
            'is_verified' => true,
            'subscription_expires_at' => now()->subDay(),
            'featured_until' => now()->addMonth(),
            'sponsored_category_until' => now()->addMonth(),
            'sponsored_province_until' => now()->addMonth(),
        ]);

        $this->assertSame('free', $business->effectiveTier());
        $this->assertFalse($business->isSubscriptionActive());
        $this->assertFalse($business->isFeatured());
        $this->assertFalse($business->isSponsoredCategory());
        $this->assertFalse($business->isSponsoredProvince());
        $this->assertTrue($business->is_verified);
        $this->assertSame('free', $business->entitlements()['effective_tier']);

        $this->getJson('/api/v1/business/public/businesses?category=' . $this->category->slug)
            ->assertOk()
            ->assertJsonPath('data.items.0.tier', 'free')
            ->assertJsonPath('data.items.0.is_featured', false)
            ->assertJsonPath('data.items.0.is_sponsored_category', false)
            ->assertJsonPath('data.items.0.is_sponsored_province', false);
    }

    public function test_category_sponsorship_outranks_featured_inside_matching_category(): void
    {
        $sponsored = $this->makeBusiness([
            'name_en' => 'Phase 2 Sponsored Business',
            'tier' => 'pro',
            'subscription_expires_at' => now()->addMonth(),
            'sponsored_category_until' => now()->addMonth(),
            'rating_avg' => 1.0,
        ]);

        $featured = $this->makeBusiness([
            'name_en' => 'Phase 2 Featured Business',
            'tier' => 'premium',
            'subscription_expires_at' => now()->addMonth(),
            'featured_until' => now()->addMonth(),
            'rating_avg' => 5.0,
        ]);

        $items = $this->getJson('/api/v1/business/public/businesses?category=' . $this->category->slug)
            ->assertOk()
            ->json('data.items');

        $this->assertSame($sponsored->id, $items[0]['id']);
        $this->assertTrue($items[0]['is_sponsored_category']);
        $this->assertSame($featured->id, $items[1]['id']);
        $this->assertTrue($items[1]['is_featured']);
    }

    public function test_province_sponsorship_outranks_featured_inside_matching_province(): void
    {
        $sponsored = $this->makeBusiness([
            'name_en' => 'Phase 2 Province Sponsor',
            'tier' => 'pro',
            'subscription_expires_at' => now()->addMonth(),
            'sponsored_province_until' => now()->addMonth(),
            'rating_avg' => 1.0,
        ]);

        $featured = $this->makeBusiness([
            'name_en' => 'Phase 2 Province Featured',
            'tier' => 'premium',
            'subscription_expires_at' => now()->addMonth(),
            'featured_until' => now()->addMonth(),
            'rating_avg' => 5.0,
        ]);

        $items = $this->getJson('/api/v1/business/public/businesses?province=' . $this->province->slug)
            ->assertOk()
            ->json('data.items');

        $this->assertSame($sponsored->id, $items[0]['id']);
        $this->assertTrue($items[0]['is_sponsored_province']);
        $this->assertSame($featured->id, $items[1]['id']);
        $this->assertTrue($items[1]['is_featured']);
    }

    public function test_category_sponsorship_does_not_boost_without_category_context(): void
    {
        $sponsored = $this->makeBusiness([
            'name_en' => 'Phase 2 Context Sponsored',
            'tier' => 'pro',
            'subscription_expires_at' => now()->addMonth(),
            'sponsored_category_until' => now()->addMonth(),
            'rating_avg' => 1.0,
        ]);

        $featured = $this->makeBusiness([
            'name_en' => 'Phase 2 Context Featured',
            'tier' => 'premium',
            'subscription_expires_at' => now()->addMonth(),
            'featured_until' => now()->addMonth(),
            'rating_avg' => 5.0,
        ]);

        $items = $this->getJson('/api/v1/business/public/businesses?q=Phase%202%20Context')
            ->assertOk()
            ->json('data.items');

        $this->assertSame($featured->id, $items[0]['id']);
        $this->assertSame($sponsored->id, $items[1]['id']);
        $this->assertTrue($items[1]['is_sponsored_category']);
    }

    public function test_expired_category_sponsorship_is_ignored(): void
    {
        $expiredSponsor = $this->makeBusiness([
            'name_en' => 'Phase 2 Expired Sponsor',
            'tier' => 'pro',
            'subscription_expires_at' => now()->addMonth(),
            'sponsored_category_until' => now()->subDay(),
            'rating_avg' => 5.0,
        ]);

        $sponsored = $this->makeBusiness([
            'name_en' => 'Phase 2 Active Sponsor',
            'tier' => 'pro',
            'subscription_expires_at' => now()->addMonth(),
            'sponsored_category_until' => now()->addMonth(),
            'rating_avg' => 1.0,
        ]);

        $items = $this->getJson('/api/v1/business/public/businesses?category=' . $this->category->slug)
            ->assertOk()
            ->json('data.items');

        $this->assertSame($sponsored->id, $items[0]['id']);
        $expiredItem = collect($items)->firstWhere('id', $expiredSponsor->id);
        $this->assertFalse($expiredItem['is_sponsored_category']);
    }

    public function test_sponsorship_is_capped_to_subscription_end_date(): void
    {
        $business = $this->makeBusiness();
        $plan = Plan::where('code', 'pro')->firstOrFail();
        $endsAt = now()->addDays(10)->startOfSecond();

        $result = app(SubscriptionService::class)->activate($business, $plan, [
            'starts_at' => now()->toIso8601String(),
            'ends_at' => $endsAt->toIso8601String(),
            'sponsored_category_until' => now()->addDays(60)->toIso8601String(),
            'sponsored_province_until' => now()->addDays(60)->toIso8601String(),
        ]);

        $business = $result['business'];

        $this->assertTrue($business->sponsored_category_until->equalTo($endsAt));
        $this->assertTrue($business->sponsored_province_until->equalTo($endsAt));
        $this->assertTrue($business->isSponsoredCategory());
        $this->assertTrue($business->isSponsoredProvince());
    }

    public function test_free_plan_activation_clears_sponsorship_dates_and_warns(): void
    {
        $business = $this->makeBusiness([
            'tier' => 'pro',
            'subscription_expires_at' => now()->addMonth(),
            'sponsored_category_until' => now()->addMonth(),
            'sponsored_province_until' => now()->addMonth(),
        ]);

        $free = Plan::where('code', 'free')->firstOrFail();

        $result = app(SubscriptionService::class)->activate($business, $free, [
            'sponsored_category_until' => now()->addMonth()->toIso8601String(),
            'sponsored_province_until' => now()->addMonth()->toIso8601String(),
        ]);

        $business = $result['business'];

        $this->assertSame('free', $business->tier);
        $this->assertNull($business->sponsored_category_until);
        $this->assertNull($business->sponsored_province_until);
        $this->assertStringContainsString('Sponsored placement is only available on paid plans', $result['warning']);
        $this->assertFalse($business->isSponsoredCategory());
        $this->assertFalse($business->isSponsoredProvince());
    }

    private function makeBusiness(array $overrides = []): Business
    {
        return Business::create(array_merge([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'slug' => 'phase2-entitlement-' . uniqid(),
            'name_km' => 'Phase 2 Entitlement Business',
            'name_en' => 'Phase 2 Entitlement Business',
            'address_km' => 'Phnom Penh',
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
