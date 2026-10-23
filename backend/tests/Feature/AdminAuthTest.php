<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    public function test_non_admin_gets_403_on_admin_routes(): void
    {
        $regularUser = User::where('email', 'sokha@example.com')->first();
        if (!$regularUser) {
            $regularUser = User::factory()->create();
        }

        $response = $this->actingAs($regularUser)->getJson('/api/v1/admin/dashboard/stats');
        $response->assertStatus(403);
    }

    public function test_super_admin_can_access_admin_routes(): void
    {
        $admin = User::where('email', 'admin@khemaramorodok.com')->first();
        $this->assertNotNull($admin, 'Admin user should exist from seeder');

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/dashboard/stats');
        $response->assertStatus(200);
    }
}
