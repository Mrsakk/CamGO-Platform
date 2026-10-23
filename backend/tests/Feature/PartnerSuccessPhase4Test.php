<?php

namespace Tests\Feature;

use App\Models\Province;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessDocument;
use App\Modules\Business\Models\BusinessHour;
use App\Modules\Business\Models\BusinessMedia;
use App\Modules\Business\Models\BusinessMember;
use App\Modules\Business\Models\BusinessReview;
use App\Modules\Business\Models\Category;
use App\Modules\Business\Models\Contact;
use App\Modules\Business\Models\Lead;
use App\Modules\Business\Models\Plan;
use Database\Seeders\RolesAndPermissionsSeeder;
use Tests\TestCase;

class PartnerSuccessPhase4Test extends TestCase
{
    protected Business $business;
    protected User $owner;
    protected User $manager;
    protected User $viewer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $category = Category::create([
            'slug' => 'phase4-hotel-' . uniqid(),
            'name_km' => 'សណ្ឋាគារដំណាក់កាល 4',
            'name_en' => 'Phase 4 Hotel',
            'icon' => 'Hotel',
            'profile_schema' => [
                ['key' => 'room_types', 'label_km' => 'ប្រភេទបន្ទប់', 'label_en' => 'Room types', 'type' => 'tags'],
                ['key' => 'amenities', 'label_km' => 'សេវាកម្ម', 'label_en' => 'Amenities', 'type' => 'tags'],
            ],
            'sort_order' => 1,
        ]);

        $province = Province::firstOrCreate(
            ['slug' => 'phase4-phnom-penh'],
            [
                'name_km' => 'ភ្នំពេញ',
                'name_en' => 'Phnom Penh',
                'code' => 'P4',
                'latitude' => 11.5564,
                'longitude' => 104.9282,
            ]
        );

        $this->business = Business::create([
            'category_id' => $category->id,
            'province_id' => $province->id,
            'slug' => 'phase4-business-' . uniqid(),
            'name_km' => 'អាជីវកម្មដំណាក់កាល 4',
            'name_en' => 'Phase 4 Business',
            'description_km' => 'ការពិពណ៌នាអាជីវកម្មសម្រាប់ការធ្វើតេស្តដំណាក់កាលទី 4 ។',
            'description_en' => 'A complete business description used for Phase 4 testing.',
            'profile_data' => ['room_types' => ['Deluxe'], 'amenities' => ['Wi-Fi']],
            'address_km' => 'ភ្នំពេញ',
            'address_en' => 'Phnom Penh',
            'lat' => 11.5564,
            'lng' => 104.9282,
            'price_level' => 2,
            'tier' => 'free',
            'status' => 'approved',
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        Contact::create([
            'business_id' => $this->business->id,
            'type' => 'phone',
            'value' => '+855 12 345 678',
            'label' => 'Hotline',
            'is_primary' => true,
            'sort_order' => 1,
        ]);

        BusinessHour::create([
            'business_id' => $this->business->id,
            'weekday' => 1,
            'opens_at' => '08:00',
            'closes_at' => '17:00',
            'is_closed' => false,
        ]);

        for ($i = 0; $i < 3; $i++) {
            $media = BusinessMedia::create([
                'business_id' => $this->business->id,
                'path' => "business/phase4/photo-{$i}.jpg",
                'path_800' => "business/phase4/photo-{$i}.jpg",
                'path_400' => "business/phase4/photo-{$i}.jpg",
                'alt_en' => 'Phase 4 photo',
                'alt_km' => 'រូបភាព',
                'sort_order' => $i + 1,
                'is_cover' => $i === 0,
            ]);

            if ($i === 0) {
                $this->business->update(['cover_media_id' => $media->id]);
            }
        }

        BusinessDocument::create([
            'business_id' => $this->business->id,
            'type' => 'business_license',
            'path' => 'business/phase4/license.pdf',
            'file_name' => 'license.pdf',
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
        ]);

        $this->owner = $this->member('owner');
        $this->manager = $this->member('manager');
        $this->viewer = $this->member('viewer');

        $this->owner->assignRole('business_owner');
    }

    public function test_owner_capabilities_separate_viewer_manager_and_owner_access(): void
    {
        $this->actingAs($this->viewer, 'sanctum')
            ->getJson('/api/v1/business/owner/stats')
            ->assertOk()
            ->assertJsonPath('data.profile.score', 100);

        $this->actingAs($this->viewer, 'sanctum')
            ->putJson('/api/v1/business/owner/my-business', $this->profilePayload())
            ->assertForbidden();

        $this->actingAs($this->viewer, 'sanctum')
            ->getJson('/api/v1/business/owner/team')
            ->assertForbidden();

        $this->actingAs($this->manager, 'sanctum')
            ->getJson('/api/v1/business/owner/leads')
            ->assertOk();

        $this->actingAs($this->manager, 'sanctum')
            ->getJson('/api/v1/business/owner/subscription')
            ->assertForbidden();

        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/business/owner/team')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_owner_profile_update_keeps_only_category_schema_fields(): void
    {
        $payload = $this->profilePayload();
        $payload['profile_data'] = [
            'room_types' => ['Suite'],
            'amenities' => ['Pool'],
            'unexpected_field' => 'must not persist',
        ];

        $this->actingAs($this->owner, 'sanctum')
            ->putJson('/api/v1/business/owner/my-business', $payload)
            ->assertOk()
            ->assertJsonPath('data.profile_data.room_types.0', 'Suite')
            ->assertJsonMissingPath('data.profile_data.unexpected_field');

        $this->assertArrayNotHasKey('unexpected_field', $this->business->fresh()->profile_data);
    }

    public function test_public_contact_creates_lead_and_owner_notification(): void
    {
        $this->postJson("/api/v1/business/public/businesses/{$this->business->slug}/events", [
            'channel' => 'phone',
            'source' => 'profile',
            'locale' => 'km',
        ])->assertOk();

        $this->assertDatabaseHas('biz_leads', [
            'business_id' => $this->business->id,
            'primary_channel' => 'phone',
            'status' => 'new',
        ]);

        $this->assertDatabaseHas('biz_owner_notifications', [
            'business_id' => $this->business->id,
            'user_id' => $this->owner->id,
            'type' => 'lead.created',
        ]);

        $lead = Lead::where('business_id', $this->business->id)->firstOrFail();

        $this->actingAs($this->manager, 'sanctum')
            ->putJson("/api/v1/business/owner/leads/{$lead->id}", [
                'status' => 'contacted',
                'note' => 'Called the customer.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'contacted');

        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/business/owner/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 1);
    }

    public function test_manager_can_reply_to_approved_review_but_viewer_cannot(): void
    {
        $review = BusinessReview::create([
            'business_id' => $this->business->id,
            'display_name' => 'Sokha',
            'rating' => 5,
            'comment' => 'Great service.',
            'locale' => 'en',
            'email_hash' => hash('sha256', 'sokha@example.com'),
            'ip_hash' => hash('sha256', '127.0.0.1'),
            'status' => 'approved',
        ]);

        $this->actingAs($this->manager, 'sanctum')
            ->putJson("/api/v1/business/owner/reviews/{$review->id}/reply", [
                'owner_reply' => 'Thank you for visiting us!',
            ])
            ->assertOk()
            ->assertJsonPath('data.owner_reply', 'Thank you for visiting us!');

        $this->actingAs($this->viewer, 'sanctum')
            ->putJson("/api/v1/business/owner/reviews/{$review->id}/reply", [
                'owner_reply' => 'Not allowed.',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('biz_reviews', [
            'id' => $review->id,
            'owner_replied_by' => $this->manager->id,
        ]);
    }

    public function test_team_invitation_acceptance_links_business_and_role(): void
    {
        $invitee = User::factory()->create([
            'business_id' => null,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/business/owner/team/invite', [
                'email' => $invitee->email,
                'role' => 'viewer',
            ])
            ->assertCreated();

        $token = $response->json('data.invite_token');
        $memberId = $response->json('data.member.id');

        $this->actingAs($invitee, 'sanctum')
            ->postJson("/api/v1/business/team/accept/{$token}")
            ->assertOk()
            ->assertJsonPath('data.business_id', $this->business->id)
            ->assertJsonPath('data.role', 'viewer');

        $this->assertDatabaseHas('biz_business_members', [
            'id' => $memberId,
            'user_id' => $invitee->id,
            'business_id' => $this->business->id,
            'role' => 'viewer',
            'status' => 'active',
        ]);

        $this->assertSame($this->business->id, $invitee->fresh()->business_id);
        $this->assertTrue($invitee->fresh()->hasRole('business_owner'));

        $this->actingAs($invitee->fresh(), 'sanctum')
            ->getJson('/api/v1/business/owner/stats')
            ->assertOk();

        $this->actingAs($invitee->fresh(), 'sanctum')
            ->putJson('/api/v1/business/owner/my-business', $this->profilePayload())
            ->assertForbidden();

        $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/business/owner/team/invite', [
                'email' => $invitee->email,
                'role' => 'manager',
            ])
            ->assertUnprocessable();
    }

    public function test_suspended_and_removed_members_lose_owner_portal_access(): void
    {
        $invitee = User::factory()->create([
            'business_id' => null,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/business/owner/team/invite', [
                'email' => $invitee->email,
                'role' => 'viewer',
            ])
            ->assertCreated();

        $token = $response->json('data.invite_token');
        $memberId = $response->json('data.member.id');

        $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/business/owner/team/{$memberId}", ['status' => 'active'])
            ->assertUnprocessable();

        $this->actingAs($invitee, 'sanctum')
            ->postJson("/api/v1/business/team/accept/{$token}")
            ->assertOk();

        $this->actingAs($invitee->fresh(), 'sanctum')
            ->getJson('/api/v1/business/owner/stats')
            ->assertOk();

        $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/business/owner/team/{$memberId}", ['status' => 'suspended'])
            ->assertOk();

        $invitee->refresh();
        $this->assertNull($invitee->businessRole());

        $this->actingAs($invitee, 'sanctum')
            ->getJson('/api/v1/business/owner/my-business')
            ->assertForbidden();

        $this->actingAs($this->owner, 'sanctum')
            ->putJson("/api/v1/business/owner/team/{$memberId}", [
                'role' => 'viewer',
                'status' => 'active',
            ])
            ->assertOk();

        $this->actingAs($invitee->fresh(), 'sanctum')
            ->getJson('/api/v1/business/owner/stats')
            ->assertOk();

        $this->actingAs($this->owner, 'sanctum')
            ->deleteJson("/api/v1/business/owner/team/{$memberId}")
            ->assertOk();

        $invitee->refresh();
        $this->assertNull($invitee->business_id);
        $this->assertNull($invitee->businessRole());

        $this->actingAs($invitee, 'sanctum')
            ->getJson('/api/v1/business/owner/my-business')
            ->assertForbidden();
    }

    public function test_pro_trial_requires_complete_profile_and_can_only_start_once(): void
    {
        Plan::firstOrCreate(
            ['code' => 'pro'],
            [
                'name_km' => 'Pro',
                'name_en' => 'Pro',
                'price_usd' => 9,
                'billing_cycle' => 'monthly',
                'features' => [],
                'trial_days' => 30,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/business/owner/subscription')
            ->assertOk()
            ->assertJsonPath('data.trial.can_start', true)
            ->assertJsonPath('data.trial.profile_completion.score', 100);

        $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/business/owner/subscription/trial')
            ->assertCreated()
            ->assertJsonPath('data.business.is_on_trial', true);

        $this->assertDatabaseHas('biz_subscriptions', [
            'business_id' => $this->business->id,
            'is_trial' => true,
            'status' => 'trialing',
        ]);

        $this->assertNotNull($this->business->fresh()->trial_started_at);
        $this->assertNotNull($this->business->fresh()->trial_ends_at);
        $this->assertTrue(
            $this->business->fresh()->trial_ends_at->between(
                now()->addDays(29),
                now()->addDays(31),
            )
        );

        $this->actingAs($this->owner->fresh(), 'sanctum')
            ->postJson('/api/v1/business/owner/subscription/trial')
            ->assertUnprocessable();
    }

    public function test_notification_settings_can_enable_telegram_and_lead_alerts(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->putJson('/api/v1/business/owner/notifications/settings', [
                'telegram_chat_id' => '123456789',
                'notification_preferences' => [
                    'telegram' => true,
                    'leads' => false,
                ],
            ])
            ->assertOk()
            ->assertJsonPath('data.telegram_chat_id', '123456789')
            ->assertJsonPath('data.notification_preferences.telegram', true)
            ->assertJsonPath('data.notification_preferences.leads', false);

        $this->assertSame('123456789', $this->owner->fresh()->telegram_chat_id);
        $this->assertFalse($this->owner->fresh()->notificationPreference('leads', true));
    }

    public function test_admin_business_stats_overview_includes_review_totals(): void
    {
        BusinessReview::create([
            'business_id' => $this->business->id,
            'display_name' => 'Admin Stats Reviewer',
            'rating' => 4,
            'comment' => 'Review used to verify admin statistics.',
            'locale' => 'en',
            'email_hash' => hash('sha256', 'admin-stats-reviewer@example.com'),
            'ip_hash' => hash('sha256', '127.0.0.1'),
            'status' => 'pending',
        ]);

        $admin = User::factory()->create(['is_active' => true]);
        $admin->assignRole('Super Admin');

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/business/stats')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'overview' => ['total_reviews', 'pending_reviews'],
                ],
            ]);

        $this->assertSame(BusinessReview::count(), $response->json('data.overview.total_reviews'));
        $this->assertSame(
            BusinessReview::where('status', 'pending')->count(),
            $response->json('data.overview.pending_reviews')
        );
    }

    private function member(string $role): User
    {
        $user = User::factory()->create([
            'business_id' => $this->business->id,
            'is_active' => true,
        ]);

        BusinessMember::create([
            'business_id' => $this->business->id,
            'user_id' => $user->id,
            'role' => $role,
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        return $user;
    }

    private function profilePayload(): array
    {
        return [
            'name_km' => $this->business->name_km,
            'name_en' => $this->business->name_en,
            'description_km' => $this->business->description_km,
            'description_en' => $this->business->description_en,
            'address_km' => $this->business->address_km,
            'address_en' => $this->business->address_en,
            'lat' => $this->business->lat,
            'lng' => $this->business->lng,
            'price_level' => 2,
        ];
    }
}
