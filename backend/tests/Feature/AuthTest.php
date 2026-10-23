<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Tourist', 'guard_name' => 'web']);
    }

    public function test_tourist_can_register_successfully(): void
    {
        $payload = [
            'name' => 'Test Traveler',
            'email' => 'traveler_' . uniqid() . '@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'phone' => '+855 12 345 678',
            'country' => 'Cambodia',
        ];

        $response = $this->postJson('/api/v1/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Registration successful',
            ])
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', ['email' => $payload['email']]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'login_user_' . uniqid() . '@example.com',
            'password' => Hash::make('Secret123!'),
            'is_active' => true,
        ]);
        $user->assignRole('Tourist');

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Secret123!',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'data' => [
                    'user',
                    'token',
                ],
            ]);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'wrong_pass_' . uniqid() . '@example.com',
            'password' => Hash::make('CorrectPassword123!'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_access_me_profile(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Tourist');

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                    ],
                ],
            ]);
    }
}
