<?php

namespace Tests\Feature;

use App\Models\Trip;
use App\Models\User;
use Tests\TestCase;

class TripTest extends TestCase
{
    public function test_authenticated_user_can_create_trip(): void
    {
        $user = User::where('email', 'sokha@example.com')->first() ?? User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/trips', [
            'title' => 'ដំណើរកម្សាន្តសៀមរាប',
            'title_en' => 'Siem Reap Exploration',
            'province' => 'Siem Reap',
            'days_count' => 2,
            'days' => [
                [
                    'day' => 1,
                    'items' => [
                        [
                            'name_km' => 'ប្រាសាទអង្គរវត្ត',
                            'name_en' => 'Angkor Wat',
                            'time' => '08:00 AM',
                            'category' => 'Heritage',
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.trip.title', 'ដំណើរកម្សាន្តសៀមរាប');

        $this->assertDatabaseHas('trips', [
            'user_id' => $user->id,
            'title' => 'ដំណើរកម្សាន្តសៀមរាប',
        ]);
    }

    public function test_user_can_update_trip_items(): void
    {
        $user = User::where('email', 'sokha@example.com')->first() ?? User::factory()->create();
        $trip = Trip::create([
            'user_id' => $user->id,
            'title' => 'Original Trip',
            'province' => 'Siem Reap',
            'days_count' => 1,
        ]);

        $response = $this->actingAs($user)->putJson("/api/v1/trips/{$trip->id}", [
            'title' => 'Updated Trip Title',
            'days' => [
                [
                    'day' => 1,
                    'items' => [
                        [
                            'name_km' => 'ប្រាសាទបាយ័ន',
                            'name_en' => 'Bayon Temple',
                            'time' => '09:00 AM',
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.trip.title', 'Updated Trip Title');

        $this->assertDatabaseHas('trip_items', [
            'trip_id' => $trip->id,
            'name_km' => 'ប្រាសាទបាយ័ន',
        ]);
    }

    public function test_user_cannot_access_another_users_private_trip(): void
    {
        $owner = User::where('email', 'sokha@example.com')->first() ?? User::factory()->create();
        $otherUser = User::where('email', 'john@example.com')->first() ?? User::factory()->create();

        $trip = Trip::create([
            'user_id' => $owner->id,
            'title' => 'Private Trip',
            'is_public' => false,
        ]);

        $response = $this->actingAs($otherUser)->getJson("/api/v1/trips/{$trip->id}");
        $response->assertStatus(403);
    }

    public function test_user_can_sync_guest_plans_on_login(): void
    {
        $user = User::where('email', 'sokha@example.com')->first() ?? User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/trips/sync', [
            'plans' => [
                [
                    'id' => 'temp-guest-1',
                    'title' => 'Guest Trip 1',
                    'province' => 'Kampot',
                    'days' => [
                        [
                            'day' => 1,
                            'items' => [
                                [
                                    'name_km' => 'ភ្នំបូកគោ',
                                    'name_en' => 'Bokor Mountain',
                                    'time' => '10:00 AM',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.imported_count', 1);

        $this->assertDatabaseHas('trips', [
            'user_id' => $user->id,
            'title' => 'Guest Trip 1',
        ]);
    }
}
