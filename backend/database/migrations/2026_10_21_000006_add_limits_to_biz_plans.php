<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('biz_plans', function (Blueprint $table) {
            $table->json('limits')->nullable()->after('features');
            $table->unsignedSmallInteger('trial_days')->default(0)->after('limits');
        });

        $limits = [
            'free' => [
                'max_photos' => 8,
                'max_services' => 5,
                'max_team_members' => 3,
                'analytics_days' => 30,
                'lead_export' => false,
                'featured_placement' => false,
                'sponsored_placement' => false,
                'support_level' => 'community',
            ],
            'verified' => [
                'max_photos' => 30,
                'max_services' => 50,
                'max_team_members' => 5,
                'analytics_days' => 90,
                'lead_export' => true,
                'featured_placement' => false,
                'sponsored_placement' => false,
                'support_level' => 'priority',
            ],
            'featured' => [
                'max_photos' => 100,
                'max_services' => null,
                'max_team_members' => 20,
                'analytics_days' => 365,
                'lead_export' => true,
                'featured_placement' => true,
                'sponsored_placement' => true,
                'support_level' => 'dedicated',
            ],
        ];

        foreach ($limits as $code => $planLimits) {
            DB::table('biz_plans')
                ->where('code', $code)
                ->update([
                    'limits' => json_encode($planLimits),
                    'trial_days' => $code === 'verified' ? 30 : 0,
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('biz_plans', function (Blueprint $table) {
            $table->dropColumn(['limits', 'trial_days']);
        });
    }
};
