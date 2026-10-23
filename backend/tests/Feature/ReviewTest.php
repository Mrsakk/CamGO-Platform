<?php

namespace Tests\Feature;

use App\Models\Destination;
use App\Models\Review;
use App\Models\User;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    public function test_guest_cannot_submit_review(): void
    {
        $destination = Destination::first();
        $this->assertNotNull($destination);

        $response = $this->postJson("/api/v1/destinations/{$destination->id}/reviews", [
            'rating' => 5,
            'comment' => 'Unauthorized review attempt',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_submit_review(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Tourist');

        // Pick a destination that the new user has not reviewed
        $destination = Destination::first();
        $this->assertNotNull($destination);

        $payload = [
            'rating' => 5,
            'comment' => 'Exceptional historic place! Wonderful sunset views.',
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/destinations/{$destination->id}/reviews", $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Review submitted successfully',
            ]);

        $this->assertDatabaseHas('reviews', [
            'user_id' => $user->id,
            'reviewable_id' => $destination->id,
            'reviewable_type' => Destination::class,
            'rating' => 5,
        ]);
    }
}
