<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('biz_organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('owner_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('biz_businesses', function (Blueprint $table) {
            if (!Schema::hasColumn('biz_businesses', 'organization_id')) {
                $table->foreignId('organization_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('biz_organizations')
                    ->nullOnDelete();
                $table->index('organization_id');
            }
        });

        Schema::create('biz_business_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['owner', 'manager', 'editor', 'viewer'])->default('owner');
            $table->enum('status', ['active', 'invited', 'suspended'])->default('active');
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('invited_email')->nullable();
            $table->string('invite_token', 64)->nullable()->unique();
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();

            $table->unique(['business_id', 'user_id']);
            $table->index(['business_id', 'status']);
            $table->index(['user_id', 'status']);
        });

        // Backfill organizations and owner memberships without changing existing IDs.
        $businesses = DB::table('biz_businesses')->orderBy('id')->get();
        foreach ($businesses as $business) {
            $base = Str::slug($business->name_en ?: $business->name_km ?: 'business');
            $slug = ($base ?: 'business') . '-org-' . $business->id;

            $organizationId = DB::table('biz_organizations')->insertGetId([
                'name' => $business->name_en ?: $business->name_km ?: 'Business ' . $business->id,
                'slug' => $slug,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('biz_businesses')
                ->where('id', $business->id)
                ->update(['organization_id' => $organizationId]);
        }

        $owners = DB::table('users')
            ->whereNotNull('business_id')
            ->orderBy('id')
            ->get();

        foreach ($owners as $owner) {
            $businessExists = DB::table('biz_businesses')->where('id', $owner->business_id)->exists();
            if (!$businessExists) {
                continue;
            }

            DB::table('biz_business_members')->insertOrIgnore([
                'business_id' => $owner->business_id,
                'user_id' => $owner->id,
                'role' => 'owner',
                'status' => 'active',
                'accepted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('biz_business_members');

        Schema::table('biz_businesses', function (Blueprint $table) {
            if (Schema::hasColumn('biz_businesses', 'organization_id')) {
                $table->dropConstrainedForeignId('organization_id');
            }
        });

        Schema::dropIfExists('biz_organizations');
    }
};
