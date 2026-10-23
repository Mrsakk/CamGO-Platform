<?php

namespace Database\Seeders;

use App\Modules\Business\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'code' => 'free',
                'name_km' => 'ឥតគិតថ្លៃ',
                'name_en' => 'Free',
                'description_km' => 'បញ្ជីឥតគិតថ្លៃសម្រាប់អាជីវកម្មថ្មី និងអ្នកចាប់ផ្តើម។',
                'description_en' => 'A free listing for new and growing businesses.',
                'price_usd' => 0,
                'price_month_cents' => 0,
                'price_year_cents' => 0,
                'billing_cycle' => 'none',
                'features' => [
                    'បញ្ជីធម្មតាក្នុងថតឯកសារ',
                    'ព័ត៌មានទំនាក់ទំនង និងទីតាំង',
                    'រូបភាពរហូតដល់ ៨ សន្លឹក',
                    'សេវាកម្មរហូតដល់ ៥',
                ],
                'limits' => [
                    'max_photos' => 8,
                    'max_services' => 5,
                    'max_team_members' => 3,
                    'max_branches' => 1,
                    'analytics_days' => 30,
                    'lead_export' => false,
                    'featured_placement' => false,
                    'verified_badge' => false,
                    'sponsored_placement' => false,
                    'support_level' => 'community',
                ],
                'trial_days' => 0,
                'is_active' => true,
                'is_public' => true,
                'sort_order' => 0,
            ],
            [
                'code' => 'pro',
                'name_km' => 'Pro',
                'name_en' => 'Pro',
                'description_km' => 'ឧបករណ៍សម្រាប់អាជីវកម្មលូតលាស់៖ អាទិភាព របាយការណ៍ និងការគ្រប់គ្រងក្រុម។',
                'description_en' => 'Tools for growing businesses: priority ranking, analytics, and team access.',
                'price_usd' => 10,
                'price_month_cents' => 1000,
                'price_year_cents' => 12000,
                'billing_cycle' => 'monthly',
                'features' => [
                    'អាទិភាពខ្ពស់ក្នុងលទ្ធផលស្វែងរក',
                    'របាយការណ៍អាជីវកម្ម ៩០ ថ្ងៃ',
                    'រូបភាពរហូតដល់ ៣០ សន្លឹក',
                    'សេវាកម្មរហូតដល់ ៥០',
                    'សមាជិកក្រុមរហូតដល់ ៥ នាក់',
                    'នាំចេញទិន្នន័យអតិថិជន',
                ],
                'limits' => [
                    'max_photos' => 30,
                    'max_services' => 50,
                    'max_team_members' => 5,
                    'max_branches' => 3,
                    'analytics_days' => 90,
                    'lead_export' => true,
                    'featured_placement' => false,
                    'verified_badge' => true,
                    'sponsored_placement' => false,
                    'support_level' => 'priority',
                ],
                'trial_days' => 30,
                'is_active' => true,
                'is_public' => true,
                'sort_order' => 1,
            ],
            [
                'code' => 'premium',
                'name_km' => 'Premium',
                'name_en' => 'Premium',
                'description_km' => 'ភាពមើលឃើញខ្ពស់បំផុត ជាមួយការឧបត្ថម្ភ និងការគាំទ្រពិសេស។',
                'description_en' => 'Maximum visibility with sponsorship and dedicated support.',
                'price_usd' => 25,
                'price_month_cents' => 2500,
                'price_year_cents' => 30000,
                'billing_cycle' => 'monthly',
                'features' => [
                    'បង្ហាញលេចធ្លោគ្រប់ទីតាំង',
                    'ឧបត្ថម្ភប្រភេទ និងខេត្ត',
                    'រូបភាពរហូតដល់ ១០០ សន្លឹក',
                    'សេវាកម្មគ្មានកំណត់',
                    'សមាជិកក្រុមរហូតដល់ ២០ នាក់',
                    'របាយការណ៍ ៣៦៥ ថ្ងៃ និងការគាំទ្រពិសេស',
                ],
                'limits' => [
                    'max_photos' => 100,
                    'max_services' => null,
                    'max_team_members' => 20,
                    'max_branches' => 10,
                    'analytics_days' => 365,
                    'lead_export' => true,
                    'featured_placement' => true,
                    'verified_badge' => true,
                    'sponsored_placement' => true,
                    'support_level' => 'dedicated',
                ],
                'trial_days' => 0,
                'is_active' => true,
                'is_public' => true,
                'sort_order' => 2,
            ],
        ];

        foreach ($plans as $plan) {
            $model = Plan::updateOrCreate(['code' => $plan['code']], $plan);
            $this->seedEntitlements($model, $plan['limits']);
        }

        Plan::whereIn('code', ['verified', 'featured'])->delete();
    }

    private function seedEntitlements(Plan $plan, array $limits): void
    {
        foreach ($limits as $key => $value) {
            $type = is_bool($value) ? 'boolean' : (is_int($value) ? 'integer' : 'string');

            DB::table('biz_plan_entitlements')->updateOrInsert(
                ['plan_id' => $plan->id, 'key' => $key],
                [
                    'value' => is_bool($value) ? ($value ? '1' : '0') : (string) ($value ?? '999999'),
                    'type' => $type,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        $defaults = [
            'max_branches' => 1,
            'verified_badge' => false,
            'featured_placement' => false,
        ];

        foreach ($defaults as $key => $value) {
            if (array_key_exists($key, $limits)) {
                continue;
            }

            DB::table('biz_plan_entitlements')->updateOrInsert(
                ['plan_id' => $plan->id, 'key' => $key],
                [
                    'value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value,
                    'type' => is_bool($value) ? 'boolean' : 'integer',
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
