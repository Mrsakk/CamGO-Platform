<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add business_id to users table
        if (!Schema::hasColumn('users', 'business_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('business_id')->nullable()->after('id');
                $table->foreign('business_id')->references('id')->on('biz_businesses')->onDelete('set null');
                $table->index('business_id');
            });
        }

        // 2. Add tier and monetization fields to biz_businesses table
        Schema::table('biz_businesses', function (Blueprint $table) {
            if (!Schema::hasColumn('biz_businesses', 'tier')) {
                $table->enum('tier', ['free', 'verified', 'featured'])->default('free')->after('price_level');
                $table->index('tier');
            }

            if (!Schema::hasColumn('biz_businesses', 'subscription_expires_at')) {
                $table->timestamp('subscription_expires_at')->nullable()->after('tier');
                $table->index('subscription_expires_at');
            }

            if (!Schema::hasColumn('biz_businesses', 'featured_until')) {
                $table->timestamp('featured_until')->nullable()->after('subscription_expires_at');
                $table->index('featured_until');
            }

            if (!Schema::hasColumn('biz_businesses', 'sponsored_category_until')) {
                $table->timestamp('sponsored_category_until')->nullable()->after('featured_until');
            }

            if (!Schema::hasColumn('biz_businesses', 'sponsored_province_until')) {
                $table->timestamp('sponsored_province_until')->nullable()->after('sponsored_category_until');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('biz_businesses', function (Blueprint $table) {
            $table->dropColumn([
                'tier',
                'subscription_expires_at',
                'featured_until',
                'sponsored_category_until',
                'sponsored_province_until',
            ]);
        });

        if (Schema::hasColumn('users', 'business_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['business_id']);
                $table->dropColumn('business_id');
            });
        }
    }
};
