<?php

namespace Tests\Feature;

use App\Models\Destination;
use App\Models\Favorite;
use App\Models\User;
use Tests\TestCase;

class FavoriteTest extends TestCase
{
    public function test_guest_cannot_toggle_favorite(): void
    {
        $destination = Destination::first();
        $this->assertNotNull($destination);

        $response = $this->postJson("/api/v1/destinations/{$destination->id}/favorite");
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_toggle_favorite(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Tourist');

        $destination = Destination::first();
        $this->assertNotNull($destination);

        // 1. Add to favorites
        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/destinations/{$destination->id}/favorite");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'destination_id' => $destination->id,
                    'is_favorited' => true,
                ],
            ]);

        $this->assertDatabaseHas('favorites', [
            'user_id' => $user->id,
            'destination_id' => $destination->id,
        ]);

        // 2. Remove from favorites
        $response2 = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/destinations/{$destination->id}/favorite");

        $response2->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'destination_id' => $destination->id,
                    'is_favorited' => false,
                ],
            ]);

        $this->assertDatabaseMissing('favorites', [
            'user_id' => $user->id,
            'destination_id' => $destination->id,
        ]);
    }
}
