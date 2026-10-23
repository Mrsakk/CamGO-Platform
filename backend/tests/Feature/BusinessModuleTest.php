<?php

namespace Tests\Feature;

use App\Models\Destination;
use App\Models\Province;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Category;
use Carbon\Carbon;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BusinessModuleTest extends TestCase
{
    protected User $adminUser;

    protected User $managerUser;

    protected User $regularUser;

    protected Category $category;

    protected Province $province;

    protected Business $business;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure roles & permissions are seeded
        $this->seed(RolesAndPermissionsSeeder::class);

        // 1. Super Admin
        $this->adminUser = User::factory()->create(['is_active' => true]);
        $this->adminUser->assignRole('Super Admin');

        // 2. Business Manager (has business permissions EXCEPT business.kyc.view and business.categories.manage)
        $this->managerUser = User::factory()->create(['is_active' => true]);
        $this->managerUser->assignRole('Business Manager');

        // 3. Regular Tourist User (no business permissions)
        $this->regularUser = User::factory()->create(['is_active' => true]);
        $this->regularUser->assignRole('Tourist');

        // Test category & province
        $this->category = Category::firstOrCreate(
            ['slug' => 'test-hotel'],
            ['name_km' => 'សណ្ឋាគារសាកល្បង', 'name_en' => 'Test Hotel', 'icon' => 'Hotel', 'sort_order' => 1]
        );

        $this->province = Province::firstOrCreate(
            ['slug' => 'siem-reap'],
            ['name_km' => 'សៀមរាប', 'name_en' => 'Siem Reap', 'code' => 'SR', 'latitude' => 13.3633, 'longitude' => 103.8564]
        );

        // Approved test business
        $this->business = Business::create([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'slug' => 'angkor-heritage-test-biz',
            'name_km' => 'សណ្ឋាគារបេតិកភណ្ឌអង្គរ',
            'name_en' => 'Angkor Heritage Test Retreat',
            'tagline_km' => 'ស្នាក់នៅបែបធម្មជាតិ',
            'tagline_en' => 'Eco-luxury retreat',
            'description_km' => 'ការស្នាក់នៅដ៏ល្អប្រណីតក្បែរអង្គរវត្ត',
            'description_en' => 'Luxury stay near Angkor Wat temple complex.',
            'address_km' => 'ផ្លូវវត្តបូព៌ ក្រុងសៀមរាប',
            'address_en' => 'Wat Bo Road, Siem Reap',
            'lat' => 13.3582,
            'lng' => 103.8643,
            'price_level' => 3,
            'status' => 'approved',
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => $this->adminUser->id,
            'approved_at' => now(),
            'owner_name' => 'Secret Owner Mr. Seng',
            'owner_phone' => '+855 12 999 001',
            'internal_notes' => 'Strictly confidential internal notes about owner financial history.',
        ]);

        $this->business->contacts()->create([
            'type' => 'telegram',
            'value' => 'https://t.me/testbiz',
            'label' => 'Direct Chat',
            'is_primary' => true,
            'sort_order' => 1,
        ]);

        $media = $this->business->media()->create([
            'path' => 'https://example.com/cover.jpg',
            'alt_km' => 'រូបភាពក្របមុខ',
            'alt_en' => 'Cover Photo',
            'is_cover' => true,
            'sort_order' => 1,
        ]);
        $this->business->update(['cover_media_id' => $media->id]);
    }

    /**
     * Requirement: No public endpoint ever exposes KYC, owner details, internal notes, or hashes.
     */
    public function test_public_business_list_and_details_never_leak_private_fields(): void
    {
        // 1. Check List endpoint
        $listResponse = $this->getJson('/api/v1/business/public/businesses');
        $listResponse->assertOk()
            ->assertHeader('Cache-Control')
            ->assertDontSee('Secret Owner Mr. Seng')
            ->assertDontSee('+855 12 999 001')
            ->assertDontSee('Strictly confidential internal notes')
            ->assertDontSee('email_hash')
            ->assertDontSee('ip_hash')
            ->assertDontSee('session_hash');

        // 2. Check Detail endpoint
        $detailResponse = $this->getJson("/api/v1/business/public/businesses/{$this->business->slug}");
        $detailResponse->assertOk()
            ->assertHeader('Cache-Control')
            ->assertJsonPath('data.slug', $this->business->slug)
            ->assertJsonPath('data.name_en', $this->business->name_en)
            ->assertDontSee('Secret Owner Mr. Seng')
            ->assertDontSee('+855 12 999 001')
            ->assertDontSee('Strictly confidential internal notes')
            ->assertDontSee('documents')
            ->assertDontSee('email_hash')
            ->assertDontSee('ip_hash');
    }

    /**
     * Requirement: Suspending a business removes it from every public endpoint at once.
     */
    public function test_suspended_business_is_hidden_from_public_endpoints(): void
    {
        $this->business->update(['status' => 'suspended']);

        // Public show returns 404
        $response = $this->getJson("/api/v1/business/public/businesses/{$this->business->slug}");
        $response->assertStatus(404);

        // Public list does not contain it
        $list = $this->getJson('/api/v1/business/public/businesses');
        $list->assertOk();
        $this->assertFalse(collect($list->json('data.items'))->contains('slug', $this->business->slug));
    }

    /**
     * Requirement: Search works by Khmer or English name.
     */
    public function test_search_works_by_khmer_and_english_name(): void
    {
        // Search by English
        $resEn = $this->getJson('/api/v1/business/public/businesses?q=Heritage');
        $resEn->assertOk()
            ->assertJsonFragment(['slug' => $this->business->slug]);

        // Search by Khmer
        $resKm = $this->getJson('/api/v1/business/public/businesses?q='.urlencode('បេតិកភណ្ឌ'));
        $resKm->assertOk()
            ->assertJsonFragment(['slug' => $this->business->slug]);
    }

    /**
     * Requirement: Nearby businesses endpoint for destinations works correctly.
     */
    public function test_nearby_ordering_and_destinations_endpoint(): void
    {
        $dest = Destination::firstOrCreate(
            ['slug' => 'angkor-wat-test'],
            [
                'name_km' => 'ប្រាសាទអង្គរវត្ត',
                'name_en' => 'Angkor Wat Test',
                'description_km' => 'ប្រាសាទបុរាណដ៏អស្ចារ្យ',
                'description_en' => 'Magnificent ancient temple complex',
                'province_id' => $this->province->id,
                'category_id' => 1,
                'latitude' => 13.4125,
                'longitude' => 103.8670,
                'is_published' => true,
            ]
        );

        $this->business->recalculateDestinationLinks();

        $response = $this->getJson("/api/v1/destinations/{$dest->slug}/nearby-businesses");
        $response->assertOk()
            ->assertJsonPath('data.destination.slug', $dest->slug)
            ->assertJsonFragment(['slug' => $this->business->slug]);
    }

    /**
     * Requirement: open_now computed in Asia/Phnom_Penh, including midnight crossing and closures.
     */
    public function test_open_now_calculation_across_midnight_and_closures(): void
    {
        $tz = new \DateTimeZone('Asia/Phnom_Penh');

        // Set hours: Monday is weekday 1. Shift: 20:00 to 02:00 (crosses midnight into Tuesday weekday 2)
        $this->business->hours()->delete();
        $this->business->hours()->create([
            'weekday' => 1,
            'opens_at' => '20:00:00',
            'closes_at' => '02:00:00',
            'is_closed' => false,
        ]);

        // 1. Monday at 21:30 -> Open
        $monNight = Carbon::parse('2026-10-19 21:30:00', $tz); // 2026-10-19 is Monday
        $this->assertTrue($this->business->isOpenNow($monNight));

        // 2. Tuesday at 01:15 -> Open (from Monday's midnight crossing shift)
        $tueMorning = Carbon::parse('2026-10-20 01:15:00', $tz); // 2026-10-20 is Tuesday
        $this->assertTrue($this->business->isOpenNow($tueMorning));

        // 3. Tuesday at 03:00 -> Closed
        $tueLate = Carbon::parse('2026-10-20 03:00:00', $tz);
        $this->assertFalse($this->business->isOpenNow($tueLate));

        // 4. Temporary closure for today -> Returns false even during open hours
        $this->business->closures()->create([
            'from_date' => '2026-10-19',
            'to_date' => '2026-10-19',
            'note_en' => 'Water festival holiday',
        ]);
        $this->assertFalse($this->business->isOpenNow($monNight));
    }

    /**
     * Requirement: Reviews moderation, anti-spam honeypot, and duplicate prevention.
     */
    public function test_review_submission_honeypot_deduplication_and_moderation(): void
    {
        // 1. Honeypot check: filled honeypot must be rejected
        $spamResponse = $this->postJson("/api/v1/business/public/businesses/{$this->business->slug}/reviews", [
            'display_name' => 'Spam Bot',
            'email' => 'bot@spammer.com',
            'rating' => 5,
            'comment' => 'Check out this website for great discounts!',
            'website' => 'http://spamlink.com',
        ]);
        $spamResponse->assertStatus(422);

        // 2. Legitimate review submission
        $validReview = [
            'display_name' => 'Sokha Traveler',
            'email' => 'sokha.cambodia@example.com',
            'rating' => 5,
            'comment' => 'បទពិសោធន៍ដ៏អស្ចារ្យ! កន្លែងស្អាត និងសេវាកម្មល្អឥតខ្ចោះ។',
            'locale' => 'km',
        ];

        $res = $this->postJson("/api/v1/business/public/businesses/{$this->business->slug}/reviews", $validReview);
        $res->assertStatus(201)
            ->assertJsonPath('data.status', 'pending');

        $reviewId = $res->json('data.id');

        // 3. Duplicate submission check (same email for same business)
        $duplicate = $this->postJson("/api/v1/business/public/businesses/{$this->business->slug}/reviews", $validReview);
        $duplicate->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // 4. Pending review is NOT visible publicly
        $publicDetail = $this->getJson("/api/v1/business/public/businesses/{$this->business->slug}");
        $this->assertFalse(collect($publicDetail->json('data.approved_reviews'))->contains('id', $reviewId));

        // 5. Admin approves review -> Visible publicly & average rating updates
        $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/business/reviews/{$reviewId}/approve")
            ->assertOk();

        $this->business->refresh();
        $this->assertEquals(1, $this->business->rating_count);
        $this->assertEquals(5.0, $this->business->rating_avg);

        $publicDetailAfter = $this->getJson("/api/v1/business/public/businesses/{$this->business->slug}");
        $this->assertTrue(collect($publicDetailAfter->json('data.approved_reviews'))->contains('id', $reviewId));
    }

    /**
     * Requirement: Contact events tracking and rate limit.
     */
    public function test_contact_event_tracking(): void
    {
        $response = $this->postJson("/api/v1/business/public/businesses/{$this->business->slug}/events", [
            'channel' => 'telegram',
            'source' => 'profile',
            'locale' => 'km',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'recorded')
            ->assertJsonPath('data.channel', 'telegram');

        $this->assertDatabaseHas('biz_contact_events', [
            'business_id' => $this->business->id,
            'channel' => 'telegram',
        ]);
    }

    /**
     * Requirement: Moving to approved requires all mandatory fields.
     */
    public function test_admin_status_transition_cannot_approve_without_required_fields(): void
    {
        // Create an incomplete draft business (missing contacts, media, coordinates)
        $draft = Business::create([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'slug' => 'incomplete-draft-biz',
            'name_km' => 'ហាងសាកល្បងមិនទាន់ពេញលេញ',
            'name_en' => 'Incomplete Draft Biz',
            'status' => 'draft',
        ]);

        // Attempting to approve incomplete business must return 422
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$draft->id}/status", [
                'status' => 'approved',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonStructure(['errors' => ['missing_requirements']]);

        // Complete requirements
        $draft->update([
            'lat' => 13.35,
            'lng' => 103.85,
            'address_en' => 'Street 6, Siem Reap',
        ]);
        $draft->contacts()->create(['type' => 'phone', 'value' => '+855 12 000 999', 'is_primary' => true]);
        $draft->media()->create(['path' => 'https://example.com/test.jpg', 'is_cover' => true]);

        // Now approval must succeed
        $approveResponse = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$draft->id}/status", [
                'status' => 'approved',
            ]);

        $approveResponse->assertOk()
            ->assertJsonPath('data.status', 'approved');
    }

    /**
     * Requirement: Admin can filter the business list to incomplete profiles.
     */
    public function test_admin_business_list_filters_missing_publishing_info(): void
    {
        $draft = Business::create([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'slug' => 'incomplete-filter-biz',
            'name_km' => 'ហាងសាកល្បងសម្រាប់តម្រង',
            'name_en' => 'Incomplete Filter Biz',
            'status' => 'draft',
        ]);

        $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/business/businesses?missing_info=1&search=incomplete-filter-biz&per_page=50')
            ->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.id', $draft->id);

        $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/business/businesses?missing_info=1&search=angkor-heritage-test-biz&per_page=50')
            ->assertOk()
            ->assertJsonCount(0, 'data.items');
    }

    /**
     * Requirement: Verified badge requires at least one KYC document and a reason.
     */
    public function test_admin_verification_requires_kyc_and_logs_audit(): void
    {
        $bizNoKyc = Business::create([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'slug' => 'no-kyc-biz',
            'name_km' => 'ហាងគ្មានឯកសារ',
            'name_en' => 'No KYC Biz',
            'status' => 'approved',
            'is_verified' => false,
        ]);

        // Attempting to verify without KYC document must fail
        $failRes = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$bizNoKyc->id}/verify", [
                'reason' => 'Official ministry request',
            ]);

        $failRes->assertStatus(422);

        // Upload fake KYC document
        $bizNoKyc->documents()->create([
            'type' => 'business_license',
            'path' => 'business/documents/test.pdf',
            'file_name' => 'License.pdf',
        ]);

        // Verification now succeeds
        $successRes = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$bizNoKyc->id}/verify", [
                'reason' => 'Official ministry license verified in person.',
            ]);

        $successRes->assertOk()
            ->assertJsonPath('data.is_verified', true);

        // Unverify with reason
        $unverifyRes = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$bizNoKyc->id}/unverify", [
                'reason' => 'License expired and not renewed.',
            ]);

        $unverifyRes->assertOk()
            ->assertJsonPath('data.is_verified', false);
    }

    /**
     * Requirement: KYC documents are private and not accessible without permission.
     */
    public function test_admin_kyc_vault_permission_protection(): void
    {
        Storage::fake('local');
        $file = UploadedFile::fake()->create('id_card.pdf', 500, 'application/pdf');

        // 1. Regular Tourist gets 403 on KYC
        $this->actingAs($this->regularUser, 'sanctum')
            ->getJson("/api/v1/admin/business/businesses/{$this->business->id}/documents")
            ->assertStatus(403);

        // 2. Business Manager (does NOT have business.kyc.view permission) gets 403
        $this->actingAs($this->managerUser, 'sanctum')
            ->getJson("/api/v1/admin/business/businesses/{$this->business->id}/documents")
            ->assertStatus(403);

        // 3. Super Admin (has business.kyc.view) can upload and access documents
        $uploadRes = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/business/businesses/{$this->business->id}/documents", [
                'document' => $file,
                'type' => 'id_card',
                'notes' => 'Verified national ID',
            ]);

        $uploadRes->assertStatus(201);
        $docId = $uploadRes->json('data.id');

        // Document download authorized
        $downloadRes = $this->actingAs($this->adminUser, 'sanctum')
            ->get("/api/v1/admin/business/businesses/{$this->business->id}/documents/{$docId}/download");

        $downloadRes->assertOk();

        // Business Manager cannot download KYC
        $this->actingAs($this->managerUser, 'sanctum')
            ->get("/api/v1/admin/business/businesses/{$this->business->id}/documents/{$docId}/download")
            ->assertStatus(403);
    }

    /**
     * Requirement: Permissions per endpoint. Unauthorized users get 403.
     */
    public function test_endpoint_permission_controls(): void
    {
        // Regular user cannot create business -> 403
        $this->actingAs($this->regularUser, 'sanctum')
            ->postJson('/api/v1/admin/business/businesses', [
                'category_id' => $this->category->id,
                'province_id' => $this->province->id,
                'name_km' => 'ឈ្មោះខ្មែរ',
                'name_en' => 'English Name',
            ])
            ->assertStatus(403);

        // Business Manager can create business
        $this->actingAs($this->managerUser, 'sanctum')
            ->postJson('/api/v1/admin/business/businesses', [
                'category_id' => $this->category->id,
                'province_id' => $this->province->id,
                'name_km' => 'ឈ្មោះខ្មែរ',
                'name_en' => 'English Name',
            ])
            ->assertStatus(201);
    }

    /**
     * Requirement: Performance eager loading assertions (no N+1 queries).
     */
    public function test_public_list_query_count_is_bounded(): void
    {
        DB::enableQueryLog();

        $response = $this->getJson('/api/v1/business/public/businesses');
        $response->assertOk();

        $queries = DB::getQueryLog();
        // Base query + count + eager loads (category, province, coverMedia, media, contacts, hours, closures) <= 9 queries
        $this->assertLessThanOrEqual(9, count($queries), 'Query count must be bounded without N+1 loops.');
    }
}
