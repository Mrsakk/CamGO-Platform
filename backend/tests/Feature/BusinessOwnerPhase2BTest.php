<?php

namespace Tests\Feature;

use App\Models\Province;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessContactEvent;
use App\Modules\Business\Models\BusinessDocument;
use App\Modules\Business\Models\Category;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BusinessOwnerPhase2BTest extends TestCase
{
    protected User $superAdmin;
    protected User $ownerUser;
    protected User $otherOwnerUser;
    protected Business $businessA;
    protected Business $businessB;
    protected Category $category;
    protected Province $province;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->category = Category::firstOrCreate(
            ['slug' => 'phase2b-hotel'],
            ['name_km' => 'សណ្ឋាគារ', 'name_en' => 'Hotel', 'icon' => 'Hotel', 'sort_order' => 1]
        );

        $this->province = Province::firstOrCreate(
            ['slug' => 'phnom-penh'],
            ['name_km' => 'ភ្នំពេញ', 'name_en' => 'Phnom Penh', 'code' => 'PP', 'latitude' => 11.5564, 'longitude' => 104.9282]
        );

        // Super Admin
        $this->superAdmin = User::factory()->create(['is_active' => true]);
        $this->superAdmin->assignRole('Super Admin');

        // Business A
        $this->businessA = Business::create([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'name_km' => 'សណ្ឋាគារ ភ្នំពេញ A',
            'name_en' => 'Phnom Penh Hotel A',
            'slug' => 'phnom-penh-hotel-a-' . uniqid(),
            'address_km' => 'ផ្ទះលេខ ១ ផ្លូវ ១០',
            'address_en' => '#1 St 10, Phnom Penh',
            'lat' => 11.5564,
            'lng' => 104.9282,
            'price_level' => 2,
            'tier' => 'free',
            'status' => 'approved',
            'is_verified' => false,
        ]);

        // Business B
        $this->businessB = Business::create([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'name_km' => 'សណ្ឋាគារ ភ្នំពេញ B',
            'name_en' => 'Phnom Penh Hotel B',
            'slug' => 'phnom-penh-hotel-b-' . uniqid(),
            'address_km' => 'ផ្ទះលេខ ២ ផ្លូវ ២០',
            'address_en' => '#2 St 20, Phnom Penh',
            'lat' => 11.5564,
            'lng' => 104.9282,
            'price_level' => 3,
            'tier' => 'premium',
            'subscription_expires_at' => now()->addMonth(),
            'featured_until' => now()->addMonth(),
            'status' => 'approved',
            'is_verified' => true,
        ]);

        // Owner A (linked to Business A)
        $this->ownerUser = User::factory()->create([
            'business_id' => $this->businessA->id,
            'is_active' => true,
        ]);
        $this->ownerUser->assignRole('business_owner');

        // Owner B (linked to Business B)
        $this->otherOwnerUser = User::factory()->create([
            'business_id' => $this->businessB->id,
            'is_active' => true,
        ]);
        $this->otherOwnerUser->assignRole('business_owner');
    }

    /**
     * Test Super Admin can provision owner account linked to business.
     */
    public function test_super_admin_can_create_business_owner_account(): void
    {
        $payload = [
            'name' => 'John Owner',
            'email' => 'john.owner.' . uniqid() . '@example.com',
            'phone' => '+85512345678',
        ];

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$this->businessA->id}/owner-account", $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.must_change_password', true)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'phone', 'business_id', 'roles', 'must_change_password'],
                    'setup_token',
                    'expires_at',
                ],
            ]);

        $this->assertArrayNotHasKey('credentials', $response->json('data'));
        $this->assertNotEmpty($response->json('data.setup_token'));

        $createdEmail = $payload['email'];
        $createdUser = User::where('email', $createdEmail)->first();
        $this->assertNotNull($createdUser);
        $this->assertEquals($this->businessA->id, $createdUser->business_id);
        $this->assertTrue($createdUser->hasRole('business_owner'));
        $this->assertTrue($createdUser->must_change_password);
        $this->assertNull($createdUser->email_verified_at);
    }

    public function test_owner_can_complete_setup_with_one_time_link(): void
    {
        $email = 'setup.owner.' . uniqid() . '@example.com';

        $createResponse = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$this->businessA->id}/owner-account", [
                'name' => 'Setup Owner',
                'email' => $email,
                'phone' => '+85512345678',
            ])
            ->assertCreated();

        $token = $createResponse->json('data.setup_token');
        $newPassword = 'SecureOwnerPass123!';

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => $email,
            'password' => $newPassword,
            'password_confirmation' => $newPassword,
        ])->assertOk();

        $owner = User::where('email', $email)->firstOrFail();
        $owner->refresh();

        $this->assertFalse($owner->must_change_password);
        $this->assertNotNull($owner->email_verified_at);
        $this->assertTrue(Hash::check($newPassword, $owner->password));

        $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => $newPassword,
        ])->assertOk();
    }

    public function test_owner_cannot_login_before_setup_is_complete(): void
    {
        $email = 'pending.owner.' . uniqid() . '@example.com';
        $temporaryPassword = 'TemporaryPass123!';

        $owner = User::factory()->create([
            'email' => $email,
            'password' => Hash::make($temporaryPassword),
            'business_id' => $this->businessA->id,
            'must_change_password' => true,
            'is_active' => true,
        ]);
        $owner->assignRole('business_owner');

        $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => $temporaryPassword,
        ])->assertStatus(403);
    }

    public function test_invalid_setup_token_cannot_set_password(): void
    {
        $email = 'invalid.setup.' . uniqid() . '@example.com';

        $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$this->businessA->id}/owner-account", [
                'name' => 'Invalid Setup Owner',
                'email' => $email,
            ])
            ->assertCreated();

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'not-a-valid-token',
            'email' => $email,
            'password' => 'SecureOwnerPass123!',
            'password_confirmation' => 'SecureOwnerPass123!',
        ])->assertStatus(422);
    }

    public function test_admin_can_regenerate_setup_link_only_while_setup_is_pending(): void
    {
        $email = 'resend.owner.' . uniqid() . '@example.com';

        $createResponse = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$this->businessA->id}/owner-account", [
                'name' => 'Resend Owner',
                'email' => $email,
            ])
            ->assertCreated();

        $ownerId = $createResponse->json('data.user.id');

        $resend = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$this->businessA->id}/owner-accounts/{$ownerId}/setup-link")
            ->assertOk();

        $this->assertNotSame($createResponse->json('data.setup_token'), $resend->json('data.setup_token'));

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $resend->json('data.setup_token'),
            'email' => $email,
            'password' => 'SecureOwnerPass123!',
            'password_confirmation' => 'SecureOwnerPass123!',
        ])->assertOk();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$this->businessA->id}/owner-accounts/{$ownerId}/setup-link")
            ->assertStatus(422);
    }

    /**
     * Test Super Admin can update subscription tier & expiry dates.
     */
    public function test_super_admin_can_update_subscription_tier_and_promotions(): void
    {
        $payload = [
            'tier' => 'premium',
            'subscription_expires_at' => now()->addDays(30)->toIso8601String(),
            'featured_until' => now()->addDays(30)->toIso8601String(),
            'note' => 'Paid via KHQR Bakong invoice #1001',
        ];

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$this->businessA->id}/subscription", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.tier', 'premium')
            ->assertJsonPath('data.is_featured', true)
            ->assertJsonPath('data.is_subscription_active', true);

        $this->businessA->refresh();
        $this->assertEquals('premium', $this->businessA->tier);
        $this->assertTrue($this->businessA->isFeatured());
    }

    /**
     * Test business owner can view their own scoped business profile.
     */
    public function test_business_owner_can_view_own_business(): void
    {
        $this->businessA->update([
            'owner_name' => 'Private Owner Contact',
            'owner_phone' => '+855 99 000 111',
            'internal_notes' => 'Strictly confidential internal notes',
        ]);

        $response = $this->actingAs($this->ownerUser, 'sanctum')
            ->getJson('/api/v1/business/owner/my-business');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $this->businessA->id)
            ->assertJsonPath('data.name_km', $this->businessA->name_km);

        $payload = $response->json('data');
        $this->assertArrayNotHasKey('owner_name', $payload);
        $this->assertArrayNotHasKey('owner_phone', $payload);
        $this->assertArrayNotHasKey('internal_notes', $payload);
        $this->assertArrayNotHasKey('owner_accounts', $payload);
    }

    public function test_business_owner_can_create_closure_with_canonical_fields(): void
    {
        $payload = [
            'from_date' => now()->addDay()->toDateString(),
            'to_date' => now()->addDays(3)->toDateString(),
            'note_en' => 'Public holiday',
            'note_km' => 'ថ្ងៃឈប់សម្រាក',
        ];

        $this->actingAs($this->ownerUser, 'sanctum')
            ->postJson('/api/v1/business/owner/closures', $payload)
            ->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('biz_closures', [
            'business_id' => $this->businessA->id,
            'from_date' => $payload['from_date'],
            'to_date' => $payload['to_date'],
            'note_en' => 'Public holiday',
        ]);
    }

    public function test_owner_can_manage_own_kyc_documents_in_private_vault(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('business-license.pdf', 120, 'application/pdf');

        $upload = $this->actingAs($this->ownerUser, 'sanctum')
            ->post('/api/v1/business/owner/kyc', [
                'document' => $file,
                'type' => 'business_license',
                'expires_at' => now()->addYear()->toDateString(),
                'notes' => 'Submitted for owner verification',
            ]);

        $upload->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.type', 'business_license')
            ->assertJsonPath('data.file_name', 'business-license.pdf');

        $documentId = $upload->json('data.id');
        $document = BusinessDocument::findOrFail($documentId);

        $this->assertEquals($this->businessA->id, $document->business_id);
        $this->assertEquals($this->ownerUser->id, $document->uploaded_by);
        Storage::disk('local')->assertExists($document->path);

        $this->actingAs($this->ownerUser, 'sanctum')
            ->getJson('/api/v1/business/owner/kyc')
            ->assertOk()
            ->assertJsonPath('data.0.id', $documentId);

        $this->actingAs($this->ownerUser, 'sanctum')
            ->get("/api/v1/business/owner/kyc/{$documentId}/download")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->actingAs($this->ownerUser, 'sanctum')
            ->deleteJson("/api/v1/business/owner/kyc/{$documentId}")
            ->assertOk();

        $this->assertDatabaseMissing('biz_documents', ['id' => $documentId]);
        Storage::disk('local')->assertMissing($document->path);
    }

    public function test_owner_cannot_manage_another_business_or_admin_uploaded_kyc(): void
    {
        Storage::fake('local');

        $adminDocument = BusinessDocument::create([
            'business_id' => $this->businessA->id,
            'type' => 'id_card',
            'path' => 'business/documents/admin-verified.pdf',
            'file_name' => 'admin-verified.pdf',
            'file_size' => 100,
            'mime_type' => 'application/pdf',
            'uploaded_by' => $this->superAdmin->id,
        ]);
        Storage::disk('local')->put($adminDocument->path, 'verified');

        $this->actingAs($this->ownerUser, 'sanctum')
            ->deleteJson("/api/v1/business/owner/kyc/{$adminDocument->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('biz_documents', ['id' => $adminDocument->id]);

        $this->actingAs($this->otherOwnerUser, 'sanctum')
            ->deleteJson("/api/v1/business/owner/kyc/{$adminDocument->id}")
            ->assertStatus(404);
    }

    public function test_lead_export_requires_entitlement_and_exports_scoped_leads(): void
    {
        $this->actingAs($this->ownerUser, 'sanctum')
            ->get('/api/v1/business/owner/leads/export')
            ->assertStatus(403);

        $response = $this->actingAs($this->otherOwnerUser, 'sanctum')
            ->get('/api/v1/business/owner/leads/export');

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Lead ID', $response->streamedContent());
    }

    /**
     * Test business owner cannot view or access general admin routes.
     */
    public function test_business_owner_cannot_access_general_admin_directory(): void
    {
        // Owner should be rejected from /admin/business/businesses
        $response = $this->actingAs($this->ownerUser, 'sanctum')
            ->getJson('/api/v1/admin/business/businesses');

        $response->assertStatus(403);
    }

    /**
     * Test business owner cannot verify or publish their own business.
     */
    public function test_business_owner_cannot_verify_or_publish_business(): void
    {
        // Try verifying
        $verifyRes = $this->actingAs($this->ownerUser, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$this->businessA->id}/verify", [
                'reason' => 'I am the owner',
            ]);
        $verifyRes->assertStatus(403);

        // Try status change to approved
        $statusRes = $this->actingAs($this->ownerUser, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$this->businessA->id}/status", [
                'status' => 'approved',
            ]);
        $statusRes->assertStatus(403);
    }

    /**
     * Test updating core fields by owner sets status to pending_review.
     */
    public function test_business_owner_updating_core_fields_transitions_status_to_pending_review(): void
    {
        $payload = [
            'name_km' => 'សណ្ឋាគារ ភ្នំពេញ ឈ្មោះថ្មី',
            'name_en' => 'Phnom Penh Hotel New Name',
            'address_km' => 'អាសយដ្ឋានថ្មី',
            'address_en' => 'New address',
        ];

        $response = $this->actingAs($this->ownerUser, 'sanctum')
            ->putJson('/api/v1/business/owner/my-business', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->businessA->refresh();
        $this->assertEquals('pending', $this->businessA->status);
        $this->assertEquals('សណ្ឋាគារ ភ្នំពេញ ឈ្មោះថ្មី', $this->businessA->name_km);
    }

    /**
     * Test business owner can view real-time contact clicks for their business only.
     */
    public function test_business_owner_can_view_scoped_contact_stats(): void
    {
        // Seed 3 events for Business A
        BusinessContactEvent::create([
            'business_id' => $this->businessA->id,
            'channel' => 'call',
            'source' => 'card',
            'session_hash' => hash('sha256', 'session1'),
            'occurred_at' => now(),
        ]);
        BusinessContactEvent::create([
            'business_id' => $this->businessA->id,
            'channel' => 'telegram',
            'source' => 'profile',
            'session_hash' => hash('sha256', 'session2'),
            'occurred_at' => now(),
        ]);
        BusinessContactEvent::create([
            'business_id' => $this->businessA->id,
            'channel' => 'profile_view',
            'source' => 'list',
            'session_hash' => hash('sha256', 'session3'),
            'occurred_at' => now(),
        ]);

        // Seed 1 event for Business B
        BusinessContactEvent::create([
            'business_id' => $this->businessB->id,
            'channel' => 'call',
            'source' => 'card',
            'session_hash' => hash('sha256', 'session4'),
            'occurred_at' => now(),
        ]);

        $response = $this->actingAs($this->ownerUser, 'sanctum')
            ->getJson('/api/v1/business/owner/stats?range=30d');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.business_id', $this->businessA->id)
            ->assertJsonPath('data.totals.views', 1)
            ->assertJsonPath('data.totals.contacts', 2)
            ->assertJsonPath('data.channels.call', 1)
            ->assertJsonPath('data.channels.telegram', 1);
    }

    /**
     * Test public directory sorts featured businesses first.
     */
    public function test_featured_businesses_appear_first_in_public_directory(): void
    {
        $response = $this->getJson('/api/v1/business/public/businesses');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $items = $response->json('data.items');
        $this->assertNotEmpty($items);

        // First item should be featured business B
        $firstItem = $items[0];
        $this->assertEquals($this->businessB->id, $firstItem['id']);
        $this->assertTrue($firstItem['is_featured']);
    }
}
