<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$business = DB::table('biz_businesses')->orderBy('id')->first();
$owner = DB::table('users')->where('email', 'owner@khemaramorodok.com')->first();
$member = $owner ? DB::table('biz_business_members')->where('user_id', $owner->id)->first() : null;
$category = $business ? DB::table('biz_categories')->where('id', $business->category_id)->first() : null;
$schema = $category ? json_decode($category->profile_schema, true) : [];
$profileData = $business ? json_decode($business->profile_data ?? 'null', true) : null;

$nameMojibake = DB::table('biz_businesses')->where('name_km', 'like', '%?%')->count();
$labelMojibake = 0;
foreach (DB::table('biz_categories')->get() as $row) {
    foreach (json_decode($row->profile_schema ?? '[]', true) ?: [] as $field) {
        if (str_contains($field['label_km'] ?? '', '?')) {
            $labelMojibake++;
        }
    }
}

echo json_encode([
    'counts' => [
        'businesses' => DB::table('biz_businesses')->count(),
        'categories' => DB::table('biz_categories')->count(),
        'categories_with_schema' => DB::table('biz_categories')->whereNotNull('profile_schema')->count(),
        'businesses_with_profile_data' => DB::table('biz_businesses')->whereNotNull('profile_data')->count(),
        'organizations' => DB::table('biz_organizations')->count(),
        'members' => DB::table('biz_business_members')->count(),
        'plans' => DB::table('biz_plans')->where('is_active', true)->count(),
        'leads' => DB::table('biz_leads')->count(),
        'notifications' => DB::table('biz_owner_notifications')->count(),
    ],
    'demo' => [
        'owner_business_id' => $owner->business_id ?? null,
        'owner_member_role' => $member->role ?? null,
        'owner_member_status' => $member->status ?? null,
        'business' => $business ? [
            'id' => $business->id,
            'category_slug' => $category->slug ?? null,
            'tier' => $business->tier,
            'is_verified' => (bool) $business->is_verified,
            'profile_data_keys' => is_array($profileData) ? array_keys($profileData) : [],
            'schema_keys' => array_column($schema, 'key'),
        ] : null,
    ],
    'encoding' => [
        'business_name_km_with_question_mark' => $nameMojibake,
        'schema_label_km_with_question_mark' => $labelMojibake,
        'sample_business_name_km' => $business->name_km ?? null,
    ],
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
