<?php

namespace Tests\Feature;

use App\Models\Province;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Category;
use Database\Seeders\RolesAndPermissionsSeeder;
use Tests\TestCase;

class BusinessServiceTest extends TestCase
{
    protected User $ownerUser;

    protected User $otherOwnerUser;

    protected Business $businessA;

    protected Business $businessB;

    protected Category $category;

    protected Province $province;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $this->category = Category::firstOrCreate(
            ['slug' => 'service-test-hotel'],
            [
                'name_km' => 'Hotel',
                'name_en' => 'Hotel',
                'icon' => 'Hotel',
                'sort_order' => 1,
                'service_presets' => [
                    'label_km' => 'Room',
                    'label_en' => 'Room or stay package',
                    'examples' => ['Deluxe Room'],
                ],
            ]
        );

        $this->province = Province::firstOrCreate(
            ['slug' => 'service-test-phnom-penh'],
            [
                'name_km' => 'Phnom Penh',
                'name_en' => 'Phnom Penh',
                'code' => 'STPP',
                'latitude' => 11.5564,
                'longitude' => 104.9282,
            ]
        );

        $this->businessA = $this->makeBusiness('Service Test Hotel A');
        $this->businessB = $this->makeBusiness('Service Test Hotel B');

        $this->ownerUser = User::factory()->create([
            'business_id' => $this->businessA->id,
            'is_active' => true,
        ]);
        $this->ownerUser->assignRole('business_owner');

        $this->otherOwnerUser = User::factory()->create([
            'business_id' => $this->businessB->id,
            'is_active' => true,
        ]);
        $this->otherOwnerUser->assignRole('business_owner');
    }

    public function test_owner_can_create_and_view_services(): void
    {
        $response = $this->actingAs($this->ownerUser, 'sanctum')
            ->postJson('/api/v1/business/owner/services', $this->payload());

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name_en', 'Deluxe Room')
            ->assertJsonPath('data.price_usd', 25)
            ->assertJsonPath('data.duration_minutes', 90)
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.sort_order', 1);

        $second = $this->actingAs($this->ownerUser, 'sanctum')
            ->postJson('/api/v1/business/owner/services', $this->payload([
                'name_en' => 'Family Suite',
                'price_usd' => null,
            ]));

        $second->assertStatus(201)
            ->assertJsonPath('data.sort_order', 2);

        $this->actingAs($this->ownerUser, 'sanctum')
            ->getJson('/api/v1/business/owner/my-business')
            ->assertOk()
            ->assertJsonPath('data.services.0.name_en', 'Deluxe Room')
            ->assertJsonPath('data.services.1.name_en', 'Family Suite')
            ->assertJsonPath(
                'data.category.service_presets.label_en',
                'Room or stay package'
            );
    }

    public function test_free_plan_service_limit_is_enforced(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $this->businessA->services()->create($this->payload([
                'name_en' => "Room {$i}",
            ]));
        }

        $this->actingAs($this->ownerUser, 'sanctum')
            ->postJson('/api/v1/business/owner/services', $this->payload([
                'name_en' => 'Room 6',
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['service']);
    }

    public function test_service_validation_rejects_invalid_payload(): void
    {
        $this->actingAs($this->ownerUser, 'sanctum')
            ->postJson('/api/v1/business/owner/services', [
                'name_km' => '',
                'name_en' => '',
                'price_usd' => -1,
                'duration_minutes' => 0,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'name_km',
                'name_en',
                'price_usd',
                'duration_minutes',
            ]);
    }

    public function test_owner_cannot_modify_another_business_service(): void
    {
        $foreignService = $this->businessB->services()->create($this->payload([
            'name_en' => 'Foreign Service',
        ]));

        $this->actingAs($this->ownerUser, 'sanctum')
            ->putJson(
                "/api/v1/business/owner/services/{$foreignService->id}",
                $this->payload(['name_en' => 'Hijacked Service'])
            )
            ->assertStatus(404);

        $this->actingAs($this->ownerUser, 'sanctum')
            ->deleteJson("/api/v1/business/owner/services/{$foreignService->id}")
            ->assertStatus(404);

        $this->assertDatabaseHas('biz_services', [
            'id' => $foreignService->id,
            'name_en' => 'Foreign Service',
        ]);
    }

    public function test_owner_can_update_service_and_toggle_visibility(): void
    {
        $service = $this->businessA->services()->create($this->payload([
            'name_en' => 'Old Room Name',
        ]));

        $this->actingAs($this->ownerUser, 'sanctum')
            ->putJson(
                "/api/v1/business/owner/services/{$service->id}",
                $this->payload([
                    'name_en' => 'Renovated Suite',
                    'price_usd' => 42.75,
                    'is_active' => false,
                ])
            )
            ->assertOk()
            ->assertJsonPath('data.name_en', 'Renovated Suite')
            ->assertJsonPath('data.price_usd', 42.75)
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('biz_services', [
            'id' => $service->id,
            'name_en' => 'Renovated Suite',
            'is_active' => false,
        ]);
    }

    public function test_owner_can_delete_a_service(): void
    {
        $service = $this->businessA->services()->create($this->payload());

        $this->actingAs($this->ownerUser, 'sanctum')
            ->deleteJson("/api/v1/business/owner/services/{$service->id}")
            ->assertOk();

        $this->assertDatabaseMissing('biz_services', ['id' => $service->id]);
    }

    public function test_public_profile_only_exposes_active_services(): void
    {
        $this->businessA->services()->create($this->payload([
            'name_en' => 'Visible Room',
            'is_active' => true,
            'sort_order' => 1,
        ]));

        $this->businessA->services()->create($this->payload([
            'name_en' => 'Hidden Room',
            'is_active' => false,
            'sort_order' => 2,
        ]));

        $this->getJson("/api/v1/business/public/businesses/{$this->businessA->slug}")
            ->assertOk()
            ->assertJsonCount(1, 'data.services')
            ->assertJsonPath('data.services.0.name_en', 'Visible Room')
            ->assertJsonPath(
                'data.category.service_presets.label_en',
                'Room or stay package'
            );
    }

    public function test_unauthenticated_user_cannot_manage_services(): void
    {
        $this->postJson('/api/v1/business/owner/services', $this->payload())
            ->assertStatus(401);
    }

    private function makeBusiness(string $name): Business
    {
        return Business::create([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'name_km' => $name,
            'name_en' => $name,
            'slug' => str()->slug($name).'-'.uniqid(),
            'address_km' => 'Test Address',
            'address_en' => 'Test Address',
            'lat' => 11.5564,
            'lng' => 104.9282,
            'price_level' => 2,
            'tier' => 'free',
            'status' => 'approved',
            'is_verified' => false,
        ]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name_km' => 'បន្ទប់ឌីឡុកស៍',
            'name_en' => 'Deluxe Room',
            'description_km' => 'បន្ទប់ទំនើប',
            'description_en' => 'Modern room',
            'price_usd' => 25,
            'duration_minutes' => 90,
            'is_active' => true,
        ], $overrides);
    }
}
