<?php

namespace Tests\Feature;

use App\Models\Province;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Category;
use Database\Seeders\RolesAndPermissionsSeeder;
use Tests\TestCase;

class BusinessPortalSeparationPhase3Test extends TestCase
{
    protected Business $business;
    protected User $owner;
    protected User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $category = Category::create([
            'slug' => 'phase3-portal-' . uniqid(),
            'name_km' => 'Phase 3 Portal Hotel',
            'name_en' => 'Phase 3 Portal Hotel',
            'icon' => 'Hotel',
            'sort_order' => 1,
        ]);

        $province = Province::firstOrCreate(
            ['slug' => 'phase3-phnom-penh'],
            [
                'name_km' => 'Phnom Penh',
                'name_en' => 'Phnom Penh',
                'code' => 'P3',
                'latitude' => 11.5564,
                'longitude' => 104.9282,
            ]
        );

        $this->business = Business::create([
            'category_id' => $category->id,
            'province_id' => $province->id,
            'slug' => 'phase3-portal-business-' . uniqid(),
            'name_km' => 'Phase 3 Portal Business',
            'name_en' => 'Phase 3 Portal Business',
            'address_km' => 'Phnom Penh',
            'address_en' => 'Phnom Penh',
            'lat' => 11.5564,
            'lng' => 104.9282,
            'price_level' => 2,
            'tier' => 'free',
            'status' => 'approved',
            'is_verified' => false,
        ]);

        $this->owner = User::factory()->create([
            'business_id' => $this->business->id,
            'is_active' => true,
        ]);
        $this->owner->assignRole('business_owner');

        $this->staff = User::factory()->create(['is_active' => true]);
        $this->staff->assignRole('Business Manager');
    }

    public function test_staff_cannot_access_owner_portal_endpoints(): void
    {
        $this->actingAs($this->staff, 'sanctum')
            ->getJson('/api/v1/business/owner/my-business')
            ->assertForbidden();

        $this->actingAs($this->staff, 'sanctum')
            ->getJson('/api/v1/business/owner/stats')
            ->assertForbidden();

        $this->actingAs($this->staff, 'sanctum')
            ->getJson('/api/v1/business/owner/subscription')
            ->assertForbidden();
    }

    public function test_owner_cannot_access_staff_portal_endpoints(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/admin/business/businesses')
            ->assertForbidden();

        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/admin/business/stats')
            ->assertForbidden();

        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/admin/business/reviews')
            ->assertForbidden();
    }

    public function test_owner_role_without_linked_business_is_rejected(): void
    {
        $orphan = User::factory()->create([
            'business_id' => null,
            'is_active' => true,
        ]);
        $orphan->assignRole('business_owner');

        $this->actingAs($orphan, 'sanctum')
            ->getJson('/api/v1/business/owner/my-business')
            ->assertForbidden();
    }

    public function test_inactive_owner_is_rejected(): void
    {
        $this->owner->update(['is_active' => false]);

        $this->actingAs($this->owner->fresh(), 'sanctum')
            ->getJson('/api/v1/business/owner/my-business')
            ->assertForbidden();
    }

    public function test_active_owner_can_access_scoped_owner_endpoints(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/business/owner/my-business')
            ->assertOk()
            ->assertJsonPath('data.id', $this->business->id);

        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/business/owner/subscription')
            ->assertOk()
            ->assertJsonPath('data.business.id', $this->business->id);
    }
}
