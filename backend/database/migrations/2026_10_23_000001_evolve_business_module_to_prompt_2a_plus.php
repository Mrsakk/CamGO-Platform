<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $isMysql = DB::connection()->getDriverName() === 'mysql';

        if ($isMysql) {
            DB::statement("ALTER TABLE biz_businesses MODIFY COLUMN tier ENUM('free','verified','featured','pro','premium') NOT NULL DEFAULT 'free'");
            DB::statement("ALTER TABLE biz_businesses MODIFY COLUMN status ENUM('draft','pending_review','approved','suspended','pending','published') NOT NULL DEFAULT 'draft'");
            DB::statement("ALTER TABLE biz_leads MODIFY COLUMN status ENUM('new','contacted','qualified','won','lost','closed','spam') NOT NULL DEFAULT 'new'");
            DB::statement("ALTER TABLE biz_subscriptions MODIFY COLUMN status ENUM('active','expired','canceled','pending','trialing','past_due') NOT NULL DEFAULT 'active'");
            DB::statement("ALTER TABLE biz_payments MODIFY COLUMN method ENUM('khqr','cash','bank_transfer','aba','wing','other') NOT NULL DEFAULT 'cash'");
            DB::statement("ALTER TABLE biz_payments MODIFY COLUMN status ENUM('pending','verified','rejected','recorded','voided') NOT NULL DEFAULT 'recorded'");
        }

        Schema::table('biz_categories', function (Blueprint $table) {
            if (! Schema::hasColumn('biz_categories', 'description_km')) {
                $table->text('description_km')->nullable()->after('name_en');
            }
            if (! Schema::hasColumn('biz_categories', 'description_en')) {
                $table->text('description_en')->nullable()->after('description_km');
            }
            if (! Schema::hasColumn('biz_categories', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('sort_order');
            }
        });

        Schema::table('biz_businesses', function (Blueprint $table) {
            if (! Schema::hasColumn('biz_businesses', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('approved_at');
            }
            if (! Schema::hasColumn('biz_businesses', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('internal_notes');
            }
        });

        Schema::table('biz_plans', function (Blueprint $table) {
            if (! Schema::hasColumn('biz_plans', 'price_month_cents')) {
                $table->unsignedInteger('price_month_cents')->default(0)->after('price_usd');
            }
            if (! Schema::hasColumn('biz_plans', 'price_year_cents')) {
                $table->unsignedInteger('price_year_cents')->default(0)->after('price_month_cents');
            }
            if (! Schema::hasColumn('biz_plans', 'is_public')) {
                $table->boolean('is_public')->default(true)->after('is_active');
            }
        });

        Schema::table('biz_subscriptions', function (Blueprint $table) {
            if (! Schema::hasColumn('biz_subscriptions', 'billing_cycle')) {
                $table->enum('billing_cycle', ['monthly', 'yearly'])->default('monthly')->after('status');
            }
            if (! Schema::hasColumn('biz_subscriptions', 'trial_starts_at')) {
                $table->timestamp('trial_starts_at')->nullable()->after('is_trial');
            }
            if (! Schema::hasColumn('biz_subscriptions', 'trial_ends_at')) {
                $table->timestamp('trial_ends_at')->nullable()->after('trial_starts_at');
            }
            if (! Schema::hasColumn('biz_subscriptions', 'past_due_at')) {
                $table->timestamp('past_due_at')->nullable()->after('trial_ends_at');
            }
            if (! Schema::hasColumn('biz_subscriptions', 'grace_ends_at')) {
                $table->timestamp('grace_ends_at')->nullable()->after('past_due_at');
            }
        });

        Schema::table('biz_payments', function (Blueprint $table) {
            if (! Schema::hasColumn('biz_payments', 'amount_cents')) {
                $table->unsignedInteger('amount_cents')->default(0)->after('amount_usd');
            }
            if (! Schema::hasColumn('biz_payments', 'invoice_id')) {
                $table->unsignedBigInteger('invoice_id')->nullable()->after('subscription_id');
                $table->index('invoice_id');
            }
            if (! Schema::hasColumn('biz_payments', 'recorded_by')) {
                $table->foreignId('recorded_by')->nullable()->after('verified_by')
                    ->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('biz_payments', 'voided_at')) {
                $table->timestamp('voided_at')->nullable()->after('notes');
            }
            if (! Schema::hasColumn('biz_payments', 'void_reason')) {
                $table->text('void_reason')->nullable()->after('voided_at');
            }
        });

        Schema::table('biz_reviews', function (Blueprint $table) {
            if (! Schema::hasColumn('biz_reviews', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('business_id')
                    ->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('biz_reviews', 'title')) {
                $table->string('title')->nullable()->after('display_name');
            }
            if (! Schema::hasColumn('biz_reviews', 'owner_reply')) {
                $table->text('owner_reply')->nullable();
            }
            if (! Schema::hasColumn('biz_reviews', 'owner_replied_at')) {
                $table->timestamp('owner_replied_at')->nullable();
            }
            if (! Schema::hasColumn('biz_reviews', 'owner_replied_by')) {
                $table->foreignId('owner_replied_by')->nullable()
                    ->constrained('users')->nullOnDelete();
            }

            $table->unique(['business_id', 'user_id']);
        });

        Schema::table('biz_leads', function (Blueprint $table) {
            foreach (['name', 'phone', 'email', 'message', 'preferred_date', 'ip_hash', 'user_agent'] as $column) {
                if (! Schema::hasColumn('biz_leads', $column)) {
                    $table->text($column)->nullable();
                }
            }
            if (! Schema::hasColumn('biz_leads', 'party_size')) {
                $table->unsignedSmallInteger('party_size')->nullable();
            }
            if (! Schema::hasColumn('biz_leads', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('biz_leads', 'handled_by')) {
                $table->foreignId('handled_by')->nullable()->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('biz_leads', 'closed_at')) {
                $table->timestamp('closed_at')->nullable();
            }
        });

        Schema::create('biz_business_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['owner', 'admin', 'staff'])->default('staff');
            $table->enum('status', ['active', 'invited', 'removed'])->default('active');
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'user_id']);
            $table->index(['business_id', 'role', 'status']);
        });

        Schema::create('biz_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->string('email');
            $table->enum('role', ['admin', 'staff'])->default('staff');
            $table->string('token', 64)->unique();
            $table->enum('status', ['pending', 'accepted', 'expired', 'canceled'])->default('pending');
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'status']);
            $table->index('email');
        });

        Schema::create('biz_lead_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('biz_leads')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note');
            $table->timestamps();

            $table->index(['lead_id', 'created_at']);
        });

        Schema::create('biz_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->foreignId('document_id')->nullable()->constrained('biz_documents')->nullOnDelete();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'status']);
        });

        Schema::create('biz_metrics_daily', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->date('date');
            $table->unsignedInteger('profile_views')->default(0);
            $table->unsignedInteger('search_impressions')->default(0);
            $table->unsignedInteger('website_clicks')->default(0);
            $table->unsignedInteger('phone_clicks')->default(0);
            $table->unsignedInteger('direction_requests')->default(0);
            $table->unsignedInteger('telegram_clicks')->default(0);
            $table->unsignedInteger('leads_count')->default(0);
            $table->timestamps();

            $table->unique(['business_id', 'date']);
            $table->index(['date', 'profile_views']);
        });

        Schema::create('biz_nearby', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->foreignId('nearby_business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->decimal('distance_km', 8, 2);
            $table->timestamps();

            $table->unique(['business_id', 'nearby_business_id']);
            $table->index(['business_id', 'distance_km']);
        });

        Schema::create('biz_branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->string('name_km');
            $table->string('name_en');
            $table->string('address_km')->nullable();
            $table->string('address_en')->nullable();
            $table->string('phone')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->json('hours')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['business_id', 'is_active']);
        });

        Schema::create('biz_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no')->unique();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained('biz_subscriptions')->nullOnDelete();
            $table->unsignedInteger('amount_cents');
            $table->string('currency', 3)->default('USD');
            $table->enum('status', ['issued', 'paid', 'void', 'overdue'])->default('issued');
            $table->timestamp('issued_at');
            $table->timestamp('due_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['business_id', 'status']);
            $table->index('due_at');
        });

        Schema::table('biz_payments', function (Blueprint $table) {
            $table->foreign('invoice_id')->references('id')->on('biz_invoices')->nullOnDelete();
        });

        Schema::create('biz_featured_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->enum('slot', ['homepage', 'category', 'province'])->default('homepage');
            $table->foreignId('category_id')->nullable()->constrained('biz_categories')->nullOnDelete();
            $table->foreignId('province_id')->nullable()->constrained('provinces')->nullOnDelete();
            $table->unsignedInteger('amount_cents')->default(0);
            $table->enum('status', ['active', 'expired', 'canceled'])->default('active');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['slot', 'status', 'starts_at', 'ends_at']);
            $table->index(['business_id', 'status']);
        });

        Schema::create('biz_partner_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->enum('type', ['featured', 'verification', 'partnership', 'other'])->default('partnership');
            $table->text('message');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_note')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['business_id', 'status']);
        });

        Schema::create('biz_plan_entitlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('biz_plans')->cascadeOnDelete();
            $table->string('key');
            $table->string('value');
            $table->string('type', 20)->default('string');
            $table->timestamps();

            $table->unique(['plan_id', 'key']);
        });

        $now = now();

        DB::table('biz_plan_entitlements')->where('id', '>', 0)->delete();

        $plans = DB::table('biz_plans')->get();
        foreach ($plans as $plan) {
            $legacy = json_decode($plan->limits ?? '{}', true) ?: [];

            $code = $plan->code;
            if ($code === 'verified') {
                $code = 'pro';
            } elseif ($code === 'featured') {
                $code = 'premium';
            }

            $monthCents = match ($code) {
                'pro' => 1000,
                'premium' => 2500,
                default => 0,
            };
            $yearCents = $monthCents * 12;

            $update = [
                'code' => $code,
                'price_month_cents' => $monthCents,
                'price_year_cents' => $yearCents,
                'is_public' => true,
            ];

            if ($code === 'pro') {
                $update['price_usd'] = 10;
                $update['billing_cycle'] = 'monthly';
                $update['trial_days'] = 30;
                $update['name_en'] = 'Pro';
                $update['name_km'] = 'Pro';
            } elseif ($code === 'premium') {
                $update['price_usd'] = 25;
                $update['billing_cycle'] = 'monthly';
                $update['trial_days'] = 0;
                $update['name_en'] = 'Premium';
                $update['name_km'] = 'Premium';
            } else {
                $update['price_usd'] = 0;
                $update['billing_cycle'] = 'none';
                $update['trial_days'] = 0;
            }

            DB::table('biz_plans')->where('id', $plan->id)->update($update);

            $entitlements = [
                'max_photos' => ['integer', $legacy['max_photos'] ?? ($code === 'premium' ? 100 : ($code === 'pro' ? 30 : 8))],
                'max_services' => ['integer', $legacy['max_services'] ?? ($code === 'premium' ? 999999 : ($code === 'pro' ? 50 : 5))],
                'max_team_members' => ['integer', $legacy['max_team_members'] ?? ($code === 'premium' ? 20 : ($code === 'pro' ? 5 : 3))],
                'max_branches' => ['integer', $code === 'premium' ? 10 : ($code === 'pro' ? 3 : 1)],
                'analytics_days' => ['integer', $legacy['analytics_days'] ?? ($code === 'premium' ? 365 : ($code === 'pro' ? 90 : 30))],
                'lead_export' => ['boolean', $legacy['lead_export'] ?? ($code !== 'free')],
                'featured_placement' => ['boolean', $legacy['featured_placement'] ?? ($code === 'premium')],
                'verified_badge' => ['boolean', $code !== 'free'],
                'support_level' => ['string', $legacy['support_level'] ?? ($code === 'premium' ? 'dedicated' : ($code === 'pro' ? 'priority' : 'community'))],
            ];

            foreach ($entitlements as $key => [$type, $value]) {
                DB::table('biz_plan_entitlements')->insert([
                    'plan_id' => $plan->id,
                    'key' => $key,
                    'value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value,
                    'type' => $type,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        DB::table('biz_businesses')->where('tier', 'verified')->update(['tier' => 'pro']);
        DB::table('biz_businesses')->where('tier', 'featured')->update(['tier' => 'premium']);
        DB::table('biz_businesses')->where('status', 'approved')->update([
            'status' => 'published',
            'published_at' => DB::raw('COALESCE(approved_at, created_at, NOW())'),
        ]);
        DB::table('biz_businesses')->where('status', 'pending_review')->update(['status' => 'pending']);

        if ($isMysql) {
            DB::statement("ALTER TABLE biz_businesses MODIFY COLUMN tier ENUM('free','pro','premium') NOT NULL DEFAULT 'free'");
        }

        DB::table('biz_subscriptions')->where('is_trial', true)->where('status', 'active')->update([
            'status' => 'trialing',
            'billing_cycle' => 'monthly',
        ]);

        DB::table('biz_subscriptions')->whereNull('billing_cycle')->update(['billing_cycle' => 'monthly']);

        DB::table('biz_payments')->where('status', 'verified')->update([
            'status' => 'recorded',
            'amount_cents' => DB::raw('ROUND(amount_usd * 100)'),
        ]);
        DB::table('biz_payments')->whereNull('amount_cents')->update([
            'amount_cents' => DB::raw('ROUND(amount_usd * 100)'),
        ]);

        DB::table('biz_leads')->whereIn('status', ['qualified', 'won'])->update(['status' => 'contacted']);
        DB::table('biz_leads')->where('status', 'lost')->update(['status' => 'closed']);

        $members = DB::table('biz_business_members')->get();
        foreach ($members as $member) {
            $role = in_array($member->role, ['owner', 'admin', 'staff'], true)
                ? $member->role
                : ($member->role === 'manager' ? 'admin' : 'staff');

            DB::table('biz_business_users')->insertOrIgnore([
                'business_id' => $member->business_id,
                'user_id' => $member->user_id,
                'role' => $role,
                'status' => $member->status === 'active' ? 'active' : 'invited',
                'invited_by' => $member->invited_by,
                'accepted_at' => $member->accepted_at,
                'created_at' => $member->created_at ?? $now,
                'updated_at' => $member->updated_at ?? $now,
            ]);
        }

        foreach (DB::table('users')->whereNotNull('business_id')->get(['id', 'business_id']) as $user) {
            DB::table('biz_business_users')->insertOrIgnore([
                'business_id' => $user->business_id,
                'user_id' => $user->id,
                'role' => 'owner',
                'status' => 'active',
                'accepted_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $dailyStats = DB::table('biz_daily_stats')->get();
        foreach ($dailyStats as $stat) {
            DB::table('biz_metrics_daily')->insertOrIgnore([
                'business_id' => $stat->business_id,
                'date' => $stat->date,
                'profile_views' => $stat->views ?? 0,
                'phone_clicks' => $stat->contacts_total ?? 0,
                'created_at' => $stat->created_at ?? $now,
                'updated_at' => $stat->updated_at ?? $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('biz_plan_entitlements');
        Schema::dropIfExists('biz_partner_requests');
        Schema::dropIfExists('biz_featured_slots');
        Schema::dropIfExists('biz_invoices');
        Schema::dropIfExists('biz_branches');
        Schema::dropIfExists('biz_nearby');
        Schema::dropIfExists('biz_metrics_daily');
        Schema::dropIfExists('biz_verifications');
        Schema::dropIfExists('biz_lead_notes');
        Schema::dropIfExists('biz_invitations');
        Schema::dropIfExists('biz_business_users');

        Schema::table('biz_leads', function (Blueprint $table) {
            foreach (['name', 'phone', 'email', 'message', 'preferred_date', 'ip_hash', 'user_agent', 'party_size', 'user_id', 'handled_by', 'closed_at'] as $column) {
                if (Schema::hasColumn('biz_leads', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('biz_reviews', function (Blueprint $table) {
            foreach (['user_id', 'title'] as $column) {
                if (Schema::hasColumn('biz_reviews', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('biz_payments', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
        });

        Schema::table('biz_payments', function (Blueprint $table) {
            foreach (['amount_cents', 'invoice_id', 'recorded_by', 'voided_at', 'void_reason'] as $column) {
                if (Schema::hasColumn('biz_payments', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('biz_subscriptions', function (Blueprint $table) {
            foreach (['billing_cycle', 'trial_starts_at', 'trial_ends_at', 'past_due_at', 'grace_ends_at'] as $column) {
                if (Schema::hasColumn('biz_subscriptions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('biz_plans', function (Blueprint $table) {
            foreach (['price_month_cents', 'price_year_cents', 'is_public'] as $column) {
                if (Schema::hasColumn('biz_plans', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('biz_businesses', function (Blueprint $table) {
            foreach (['published_at', 'rejection_reason'] as $column) {
                if (Schema::hasColumn('biz_businesses', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('biz_categories', function (Blueprint $table) {
            foreach (['description_km', 'description_en', 'is_active'] as $column) {
                if (Schema::hasColumn('biz_categories', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
