<?php

namespace Tests\Feature;

use App\Models\Province;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Category;
use App\Modules\Business\Models\FeaturedSlot;
use App\Modules\Business\Models\Plan;
use Database\Seeders\PlanSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Tests\TestCase;

class PredeployAuthorizationAndBusinessRulesTest extends TestCase
{
    protected User $superAdmin;
    protected User $businessAdmin;
    protected User $tourist;
    protected User $ownerA;
    protected User $ownerB;
    protected Business $businessA;
    protected Business $businessB;
    protected Category $category;
    protected Province $province;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RolesAndPermissionsSeeder::class, PlanSeeder::class]);

        $this->category = Category::firstOrCreate(
            ['slug' => 'predeploy-hotel'],
            ['name_km' => 'សណ្ឋាគារ', 'name_en' => 'Hotel', 'icon' => 'Hotel', 'sort_order' => 1]
        );

        $this->province = Province::firstOrCreate(
            ['slug' => 'predeploy-phnom-penh'],
            ['name_km' => 'ភ្នំពេញ', 'name_en' => 'Phnom Penh', 'code' => 'PDPP', 'latitude' => 11.5564, 'longitude' => 104.9282]
        );

        // Super Admin
        $this->superAdmin = User::factory()->create(['is_active' => true]);
        $this->superAdmin->assignRole('Super Admin');

        // Business Admin (Staff)
        $this->businessAdmin = User::factory()->create(['is_active' => true]);
        $this->businessAdmin->assignRole('business_admin');

        // Tourist
        $this->tourist = User::factory()->create(['is_active' => true]);
        $this->tourist->assignRole('tourist');

        // Business A & Owner A
        $this->businessA = Business::create([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'slug' => 'predeploy-biz-a-' . uniqid(),
            'name_km' => 'អាជីវកម្ម ក',
            'name_en' => 'Business A',
            'address_km' => 'ភ្នំពេញ',
            'address_en' => 'Phnom Penh',
            'lat' => 11.5564,
            'lng' => 104.9282,
            'price_level' => 2,
            'tier' => 'free',
            'status' => 'approved',
            'is_verified' => false,
        ]);
        $this->ownerA = User::factory()->create([
            'business_id' => $this->businessA->id,
            'is_active' => true,
        ]);
        $this->ownerA->assignRole('business_owner');

        // Business B & Owner B
        $this->businessB = Business::create([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'slug' => 'predeploy-biz-b-' . uniqid(),
            'name_km' => 'អាជីវកម្ម ខ',
            'name_en' => 'Business B',
            'address_km' => 'ភ្នំពេញ',
            'address_en' => 'Phnom Penh',
            'lat' => 11.5564,
            'lng' => 104.9282,
            'price_level' => 2,
            'tier' => 'free',
            'status' => 'approved',
            'is_verified' => false,
        ]);
        $this->ownerB = User::factory()->create([
            'business_id' => $this->businessB->id,
            'is_active' => true,
        ]);
        $this->ownerB->assignRole('business_owner');
    }

    public function test_tourist_cannot_call_admin_endpoints(): void
    {
        $this->actingAs($this->tourist, 'sanctum')
            ->getJson('/api/v1/admin/dashboard/stats')
            ->assertForbidden();

        $this->actingAs($this->tourist, 'sanctum')
            ->getJson('/api/v1/admin/business/businesses')
            ->assertForbidden();

        $this->actingAs($this->tourist, 'sanctum')
            ->getJson('/api/v1/business/owner/my-business')
            ->assertForbidden();
    }

    public function test_owner_a_cannot_read_or_update_owner_b_business(): void
    {
        // Owner A accessing their own business succeeds
        $resA = $this->actingAs($this->ownerA, 'sanctum')
            ->getJson('/api/v1/business/owner/my-business');
        $resA->assertOk()->assertJsonPath('data.id', $this->businessA->id);

        // Owner A cannot call admin edit for Business B
        $this->actingAs($this->ownerA, 'sanctum')
            ->putJson("/api/v1/admin/business/businesses/{$this->businessB->id}", [
                'name_en' => 'Hacked by Owner A',
            ])
            ->assertForbidden();

        // Business B was not modified
        $this->businessB->refresh();
        $this->assertSame('Business B', $this->businessB->name_en);
    }

    public function test_suspended_user_is_blocked_by_middleware(): void
    {
        // Active user can access
        $this->actingAs($this->ownerA, 'sanctum')
            ->getJson('/api/v1/business/owner/my-business')
            ->assertOk();

        // Suspend user
        $this->ownerA->update(['is_active' => false]);

        // Suspended user receives 403 Forbidden
        $this->actingAs($this->ownerA->fresh(), 'sanctum')
            ->getJson('/api/v1/business/owner/my-business')
            ->assertForbidden()
            ->assertJsonPath('message', 'Your account has been deactivated. Please contact support.');
    }

    public function test_staff_cannot_change_plan_prices_but_super_admin_can(): void
    {
        $proPlan = Plan::where('code', 'pro')->firstOrFail();

        // Business admin cannot update plan price
        $this->actingAs($this->businessAdmin, 'sanctum')
            ->putJson("/api/v1/admin/business/billing/plans/{$proPlan->id}", [
                'code' => 'pro',
                'name_km' => 'Pro KM',
                'name_en' => 'Pro EN',
                'price_usd' => 15,
                'billing_cycle' => 'monthly',
            ])
            ->assertForbidden();

        // Super Admin can update plan price
        $this->actingAs($this->superAdmin, 'sanctum')
            ->putJson("/api/v1/admin/business/billing/plans/{$proPlan->id}", [
                'code' => 'pro',
                'name_km' => 'Pro KM',
                'name_en' => 'Pro EN',
                'price_usd' => 15,
                'billing_cycle' => 'monthly',
            ])
            ->assertOk()
            ->assertJsonPath('data.price_usd', 15);
    }

    public function test_30_day_pro_trial_created_once_per_business(): void
    {
        // Simulate a business that has already used its trial
        $this->businessA->update([
            'trial_started_at' => now()->subDays(40),
            'trial_ends_at' => now()->subDays(10),
        ]);

        $this->assertTrue($this->businessA->hasUsedTrial());

        // Attempting to start trial again must return 422
        $response = $this->actingAs($this->ownerA, 'sanctum')
            ->postJson('/api/v1/business/owner/subscription/trial');

        $response->assertStatus(422)
            ->assertJsonPath('message', 'This business has already used its free trial.');
    }

    public function test_overlapping_featured_slots_are_rejected(): void
    {
        $startsAt = now()->addDay();
        $endsAt = now()->addDays(8);

        // First featured slot succeeds
        $first = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/business/featured-slots', [
                'business_id' => $this->businessA->id,
                'slot' => 'homepage',
                'starts_at' => $startsAt->toIso8601String(),
                'ends_at' => $endsAt->toIso8601String(),
            ]);

        $first->assertStatus(201);
        $this->assertDatabaseHas('biz_featured_slots', [
            'business_id' => $this->businessA->id,
            'slot' => 'homepage',
            'status' => 'active',
        ]);

        // Second featured slot overlapping the same date range must be rejected with 422
        $second = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/v1/admin/business/featured-slots', [
                'business_id' => $this->businessB->id,
                'slot' => 'homepage',
                'starts_at' => $startsAt->copy()->addDays(2)->toIso8601String(),
                'ends_at' => $endsAt->copy()->addDays(2)->toIso8601String(),
            ]);

        $second->assertStatus(422)
            ->assertJsonPath('message', 'An active featured slot already exists for this placement and date range');
    }

    public function test_invalid_or_expired_password_reset_token_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'invalid-expired-token-12345',
            'email' => $this->tourist->email,
            'password' => 'NewSecurePassword123!',
            'password_confirmation' => 'NewSecurePassword123!',
        ]);

        $response->assertStatus(422);
    }
}
