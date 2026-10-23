<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Province;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessDocument;
use App\Modules\Business\Models\Category;
use App\Modules\Business\Models\Lead;
use App\Modules\Business\Models\OwnerNotification;
use App\Modules\Business\Models\Payment;
use App\Modules\Business\Models\Plan;
use App\Modules\Business\Models\Subscription;
use App\Modules\Business\Models\SubscriptionRequest;
use Database\Seeders\PlanSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Tests\TestCase;

class BusinessBillingPhase1Test extends TestCase
{
    protected User $superAdmin;
    protected User $owner;
    protected Business $business;
    protected Category $category;
    protected Province $province;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RolesAndPermissionsSeeder::class, PlanSeeder::class]);

        $this->category = Category::firstOrCreate(
            ['slug' => 'billing-test-hotel'],
            ['name_km' => 'Billing Test Hotel', 'name_en' => 'Hotel', 'icon' => 'Hotel', 'sort_order' => 1]
        );

        $this->province = Province::firstOrCreate(
            ['slug' => 'billing-test-phnom-penh'],
            ['name_km' => 'Phnom Penh', 'name_en' => 'Phnom Penh', 'code' => 'BTPP', 'latitude' => 11.5564, 'longitude' => 104.9282]
        );

        $this->superAdmin = User::factory()->create(['is_active' => true]);
        $this->superAdmin->assignRole('Super Admin');

        $this->business = Business::create([
            'category_id' => $this->category->id,
            'province_id' => $this->province->id,
            'name_km' => 'Billing Test Business',
            'name_en' => 'Billing Test Business',
            'slug' => 'billing-test-business-' . uniqid(),
            'address_km' => 'Phnom Penh',
            'address_en' => 'Phnom Penh',
            'lat' => 11.5564,
            'lng' => 104.9282,
            'price_level' => 2,
            'tier' => 'free',
            'status' => 'published',
            'is_verified' => false,
        ]);

        $this->owner = User::factory()->create([
            'business_id' => $this->business->id,
            'is_active' => true,
        ]);
        $this->owner->assignRole('business_owner');
    }

    public function test_super_admin_can_list_and_update_plans(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/business/billing/plans')
            ->assertOk()
            ->assertJsonCount(3, 'data');

        $pro = Plan::where('code', 'pro')->firstOrFail();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->putJson("/api/v1/admin/business/billing/plans/{$pro->id}", [
                'code' => 'pro',
                'name_km' => 'ផ្ទៀងផ្ទាត់',
                'name_en' => 'Verified Plus',
                'price_usd' => 9,
                'billing_cycle' => 'monthly',
                'features' => ['Verified badge', 'Priority placement'],
                'is_active' => true,
                'sort_order' => 1,
            ])
            ->assertOk()
            ->assertJsonPath('data.price_usd', 9)
            ->assertJsonPath('data.name_en', 'Verified Plus');

        $this->assertDatabaseHas('biz_plans', [
            'id' => $pro->id,
            'price_usd' => 9,
            'name_en' => 'Verified Plus',
        ]);
    }

    public function test_owner_plan_catalog_includes_limits_and_pro_trial(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/business/owner/plans')
            ->assertOk()
            ->assertJsonPath('data.1.code', 'pro')
            ->assertJsonPath('data.1.name_en', 'Pro')
            ->assertJsonPath('data.1.trial_days', 30)
            ->assertJsonPath('data.1.limits.max_photos', 30)
            ->assertJsonPath('data.2.name_en', 'Premium')
            ->assertJsonPath('data.2.limits.sponsored_placement', true);
    }

    public function test_activation_records_subscription_payment_and_verifies_with_kyc(): void
    {
        BusinessDocument::create([
            'business_id' => $this->business->id,
            'type' => 'business_license',
            'path' => 'kyc/billing-test-license.pdf',
            'file_name' => 'license.pdf',
            'uploaded_by' => $this->superAdmin->id,
        ]);

        $premium = Plan::where('code', 'premium')->firstOrFail();

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/billing/businesses/{$this->business->id}/activate", [
                'plan_id' => $premium->id,
                'starts_at' => now()->toIso8601String(),
                'ends_at' => now()->addMonth()->toIso8601String(),
                'payment' => [
                    'amount_usd' => 18,
                    'currency' => 'USD',
                    'method' => 'khqr',
                    'reference_no' => 'KHQR-TEST-1001',
                    'paid_at' => now()->toIso8601String(),
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.business.tier', 'premium')
            ->assertJsonPath('data.business.is_verified', true)
            ->assertJsonPath('data.warning', null)
            ->assertJsonPath('data.subscription.plan.code', 'premium');

        $this->assertNotNull($response->json('data.subscription.payments.0.receipt_no'));

        $this->business->refresh();
        $this->assertSame('premium', $this->business->tier);
        $this->assertTrue($this->business->is_verified);
        $this->assertTrue($this->business->isSubscriptionActive());
        $this->assertTrue($this->business->isFeatured());

        $this->assertDatabaseHas('biz_subscriptions', [
            'business_id' => $this->business->id,
            'plan_id' => $premium->id,
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('biz_payments', [
            'amount_usd' => 18,
            'method' => 'khqr',
            'reference_no' => 'KHQR-TEST-1001',
            'status' => 'recorded',
        ]);

        $this->assertTrue(AuditLog::where('action', 'subscription_activated')->exists());
    }

    public function test_activation_without_kyc_does_not_grant_verified_badge(): void
    {
        $pro = Plan::where('code', 'pro')->firstOrFail();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/billing/businesses/{$this->business->id}/activate", [
                'plan_id' => $pro->id,
                'ends_at' => now()->addMonth()->toIso8601String(),
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.business.tier', 'pro')
            ->assertJsonPath('data.business.is_verified', false);

        $this->business->refresh();
        $this->assertSame('pro', $this->business->tier);
        $this->assertFalse($this->business->is_verified);
        $this->assertTrue($this->business->isSubscriptionActive());
    }

    public function test_super_admin_can_record_an_additional_payment(): void
    {
        $pro = Plan::where('code', 'pro')->firstOrFail();

        $activation = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/billing/businesses/{$this->business->id}/activate", [
                'plan_id' => $pro->id,
                'ends_at' => now()->addMonth()->toIso8601String(),
            ])
            ->assertStatus(201);

        $subscriptionId = $activation->json('data.subscription.id');

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/billing/subscriptions/{$subscriptionId}/payments", [
                'amount_usd' => 10,
                'method' => 'cash',
                'reference_no' => 'CASH-TEST-2001',
                'paid_at' => now()->toIso8601String(),
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.amount_usd', 10)
            ->assertJsonPath('data.method', 'cash')
            ->assertJsonPath('data.status', 'recorded');

        $this->assertNotNull($response->json('data.receipt_no'));

        $this->assertDatabaseHas('biz_payments', [
            'subscription_id' => $subscriptionId,
            'amount_usd' => 10,
            'method' => 'cash',
            'reference_no' => 'CASH-TEST-2001',
        ]);
    }

    public function test_expiry_command_expires_subscription_and_downgrades_business(): void
    {
        BusinessDocument::create([
            'business_id' => $this->business->id,
            'type' => 'business_license',
            'path' => 'kyc/billing-expiry-license.pdf',
            'file_name' => 'license.pdf',
            'uploaded_by' => $this->superAdmin->id,
        ]);

        $premium = Plan::where('code', 'premium')->firstOrFail();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/billing/businesses/{$this->business->id}/activate", [
                'plan_id' => $premium->id,
                'starts_at' => now()->subMonth()->toIso8601String(),
                'ends_at' => now()->subDay()->toIso8601String(),
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.business.is_verified', true);

        $this->artisan('biz:expire-subscriptions')->assertExitCode(0);

        $this->assertDatabaseHas('biz_subscriptions', [
            'business_id' => $this->business->id,
            'status' => 'past_due',
        ]);

        $this->business->refresh();
        $this->assertSame('premium', $this->business->tier);

        Subscription::where('business_id', $this->business->id)
            ->where('status', 'past_due')
            ->update(['grace_ends_at' => now()->subMinute()]);

        $this->artisan('biz:expire-subscriptions')->assertExitCode(0);

        $this->assertDatabaseHas('biz_subscriptions', [
            'business_id' => $this->business->id,
            'status' => 'expired',
        ]);

        $this->business->refresh();
        $this->assertSame('free', $this->business->tier);
        $this->assertNull($this->business->subscription_expires_at);
        $this->assertNull($this->business->featured_until);
        $this->assertFalse($this->business->isFeatured());
        $this->assertTrue($this->business->is_verified);
        $this->assertNotNull($this->business->verified_at);
    }

    public function test_yearly_plan_activation_uses_annual_expiry(): void
    {
        $pro = Plan::where('code', 'pro')->firstOrFail();
        $pro->update(['billing_cycle' => 'yearly']);

        $startsAt = now()->startOfSecond();

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/billing/businesses/{$this->business->id}/activate", [
                'plan_id' => $pro->id,
                'starts_at' => $startsAt->toIso8601String(),
            ])
            ->assertStatus(201);

        $endsAt = \Carbon\Carbon::parse($response->json('data.subscription.ends_at'));

        $this->assertSame($startsAt->copy()->addYear()->toDateString(), $endsAt->toDateString());
        $this->assertSame('yearly', $response->json('data.subscription.plan.billing_cycle'));
    }

    public function test_subscription_reminder_is_sent_once_per_billing_milestone(): void
    {
        $pro = Plan::where('code', 'pro')->firstOrFail();

        $subscription = Subscription::create([
            'business_id' => $this->business->id,
            'plan_id' => $pro->id,
            'status' => 'active',
            'starts_at' => now()->subDays(27),
            'ends_at' => now()->addDays(3),
            'price_usd' => 9,
            'currency' => 'USD',
            'auto_renew' => false,
            'is_trial' => true,
        ]);

        $this->artisan('biz:send-subscription-reminders')->assertExitCode(0);
        $this->artisan('biz:send-subscription-reminders')->assertExitCode(0);

        $this->assertSame(1, OwnerNotification::where('business_id', $this->business->id)
            ->where('type', 'billing.trial_ending')
            ->count());

        $this->assertDatabaseHas('biz_owner_notifications', [
            'business_id' => $this->business->id,
            'user_id' => $this->owner->id,
            'type' => 'billing.trial_ending',
            'dedupe_key' => "billing:{$subscription->id}:3",
        ]);
    }

    public function test_owner_can_request_upgrade_and_super_admin_can_approve(): void
    {
        $pro = Plan::where('code', 'pro')->firstOrFail();

        $requestResponse = $this->actingAs($this->owner, 'sanctum')
            ->postJson('/api/v1/business/owner/subscription/request', [
                'plan_id' => $pro->id,
                'contact_phone' => '+85512345678',
                'note' => 'Please upgrade our listing.',
            ]);

        $requestResponse->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.requested_plan.code', 'pro');

        $requestId = $requestResponse->json('data.id');

        $this->assertSame(1, SubscriptionRequest::where('business_id', $this->business->id)->count());

        $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/billing/subscription-requests/{$requestId}/approve", [
                'admin_note' => 'Approved for the pilot.',
                'ends_at' => now()->addMonth()->toIso8601String(),
            ])
            ->assertOk()
            ->assertJsonPath('data.request.status', 'approved')
            ->assertJsonPath('data.subscription.plan.code', 'pro');

        $this->business->refresh();
        $this->assertSame('pro', $this->business->tier);
        $this->assertSame('approved', SubscriptionRequest::findOrFail($requestId)->status);
        $this->assertTrue(Subscription::where('business_id', $this->business->id)->where('status', 'active')->exists());
        $this->assertTrue(AuditLog::where('action', 'subscription_request_approved')->exists());
    }

    public function test_owner_stats_include_plan_usage_and_follow_up_leads(): void
    {
        $lead = Lead::create([
            'business_id' => $this->business->id,
            'session_hash' => 'follow-up-' . uniqid(),
            'status' => 'contacted',
            'primary_channel' => 'phone',
            'source' => 'profile',
            'locale' => 'km',
            'contact_count' => 2,
            'first_contact_at' => now()->subDays(10),
            'last_contact_at' => now()->subDays(5),
            'note' => 'Interested in a room for next week.',
        ]);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/business/owner/stats?range=7d')
            ->assertOk();

        $response->assertJsonPath('data.plan_limits.max_photos', 8)
            ->assertJsonPath('data.usage.photos', 0)
            ->assertJsonPath('data.usage.services', 0)
            ->assertJsonPath('data.usage.team_members', 0)
            ->assertJsonPath('data.follow_ups.count', 1)
            ->assertJsonPath('data.follow_ups.items.0.id', $lead->id);

        $this->assertGreaterThanOrEqual(5, $response->json('data.follow_ups.items.0.waiting_days'));
    }

    public function test_admin_dashboard_exposes_operational_queues(): void
    {
        $pro = Plan::where('code', 'pro')->firstOrFail();

        $this->business->update([
            'status' => 'pending',
            'tier' => 'pro',
            'subscription_expires_at' => now()->addMinutes(30),
        ]);

        $subscriptionRequest = SubscriptionRequest::create([
            'business_id' => $this->business->id,
            'requested_plan_id' => $pro->id,
            'contact_phone' => '+85512345678',
            'note' => 'Please upgrade us to Pro.',
            'status' => 'pending',
            'requested_by' => $this->owner->id,
        ]);

        $subscription = Subscription::create([
            'business_id' => $this->business->id,
            'plan_id' => $pro->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMinutes(30),
            'price_usd' => 9,
            'currency' => 'USD',
            'auto_renew' => false,
            'is_trial' => false,
        ]);

        $payment = Payment::create([
            'subscription_id' => $subscription->id,
            'amount_usd' => 9,
            'currency' => 'USD',
            'method' => 'khqr',
            'reference_no' => 'QUEUE-TEST-1001',
            'status' => 'pending',
            'paid_at' => now(),
        ]);

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/business/stats')
            ->assertOk();

        $queues = $response->json('data.queues');

        $this->assertGreaterThanOrEqual(1, $queues['counts']['pending_approvals']);
        $this->assertGreaterThanOrEqual(1, $queues['counts']['pending_subscription_requests']);
        $this->assertGreaterThanOrEqual(1, $queues['counts']['pending_payments']);
        $this->assertGreaterThanOrEqual(1, $queues['counts']['expiring_plans']);
        $this->assertContains($this->business->id, array_column($queues['pending_approvals'], 'id'));
        $this->assertContains($subscriptionRequest->id, array_column($queues['subscription_requests'], 'id'));
        $this->assertContains($payment->id, array_column($queues['pending_payments'], 'id'));
        $this->assertContains($this->business->id, array_column($queues['expiring_plans'], 'id'));
    }

    public function test_admin_can_verify_or_reject_pending_payments(): void
    {
        $pro = Plan::where('code', 'pro')->firstOrFail();

        $subscription = Subscription::create([
            'business_id' => $this->business->id,
            'plan_id' => $pro->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
            'price_usd' => 9,
            'currency' => 'USD',
            'auto_renew' => false,
            'is_trial' => false,
        ]);

        $proPayment = Payment::create([
            'subscription_id' => $subscription->id,
            'amount_usd' => 9,
            'currency' => 'USD',
            'method' => 'khqr',
            'reference_no' => 'PAYMENT-VERIFY-1',
            'status' => 'pending',
            'paid_at' => now(),
        ]);

        $this->actingAs($this->superAdmin, 'sanctum')
            ->putJson("/api/v1/admin/business/billing/payments/{$proPayment->id}", [
                'status' => 'verified',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'verified');

        $proPayment->refresh();
        $this->assertSame($this->superAdmin->id, $proPayment->verified_by);

        $rejectedPayment = Payment::create([
            'subscription_id' => $subscription->id,
            'amount_usd' => 9,
            'currency' => 'USD',
            'method' => 'bank_transfer',
            'reference_no' => 'PAYMENT-REJECT-1',
            'status' => 'pending',
            'paid_at' => now(),
        ]);

        $this->actingAs($this->superAdmin, 'sanctum')
            ->putJson("/api/v1/admin/business/billing/payments/{$rejectedPayment->id}", [
                'status' => 'rejected',
                'notes' => 'Transfer reference could not be found.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->assertDatabaseHas('biz_payments', [
            'id' => $rejectedPayment->id,
            'status' => 'rejected',
            'notes' => 'Transfer reference could not be found.',
        ]);

        $this->assertTrue(AuditLog::where('action', 'subscription_payment_verified')->exists());
        $this->assertTrue(AuditLog::where('action', 'subscription_payment_rejected')->exists());
    }

    public function test_billing_dashboard_lists_payments_and_aggregate_stats(): void
    {
        $pro = Plan::where('code', 'pro')->firstOrFail();

        $subscriptionId = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/billing/businesses/{$this->business->id}/activate", [
                'plan_id' => $pro->id,
                'ends_at' => now()->addMonth()->toIso8601String(),
            ])
            ->assertStatus(201)
            ->json('data.subscription.id');

        Payment::create([
            'subscription_id' => $subscriptionId,
            'amount_usd' => 19,
            'currency' => 'USD',
            'method' => 'khqr',
            'reference_no' => 'PENDING-PAYMENT-1',
            'status' => 'pending',
            'paid_at' => now(),
        ]);

        $payments = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/business/billing/payments?status=pending')
            ->assertOk()
            ->assertJsonPath('data.0.subscription.business.id', $this->business->id)
            ->assertJsonPath('data.0.subscription.plan.code', 'pro')
            ->assertJsonPath('data.0.status', 'pending');

        $this->assertNotNull($payments->json('data.0.id'));

        $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/v1/admin/business/billing/stats')
            ->assertOk()
            ->assertJsonPath('data.active_subscriptions', 1)
            ->assertJsonPath('data.pending_payments', 1)
            ->assertJsonPath('data.verified_revenue_total', 0);
    }

    public function test_owner_cannot_access_super_admin_billing_routes(): void
    {
        $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/admin/business/billing/plans')
            ->assertForbidden();
    }

    public function test_owner_subscription_summary_is_scoped_to_their_business(): void
    {
        $pro = Plan::where('code', 'pro')->firstOrFail();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson("/api/v1/admin/business/billing/businesses/{$this->business->id}/activate", [
                'plan_id' => $pro->id,
                'ends_at' => now()->addMonth()->toIso8601String(),
            ])
            ->assertStatus(201);

        $response = $this->actingAs($this->owner, 'sanctum')
            ->getJson('/api/v1/business/owner/subscription');

        $response->assertOk()
            ->assertJsonPath('data.business.id', $this->business->id)
            ->assertJsonPath('data.business.tier', 'pro')
            ->assertJsonPath('data.active_subscription.plan.code', 'pro');
    }
}
