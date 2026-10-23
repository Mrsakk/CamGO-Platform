<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['key' => 'site_name_en', 'value' => 'CamGO', 'group' => 'general'],
            ['key' => 'site_name_highlight', 'value' => 'GO', 'group' => 'general'],
            ['key' => 'site_name_km', 'value' => 'CamGO', 'group' => 'general'],
            ['key' => 'site_tagline_en', 'value' => 'Trusted Local. Direct Connection.', 'group' => 'general'],
            ['key' => 'site_tagline_km', 'value' => 'ទំនុកចិត្តក្នុងស្រុក ទំនាក់ទំនងផ្ទាល់', 'group' => 'general'],
            ['key' => 'logo_badge_text', 'value' => 'CG', 'group' => 'general'],
            ['key' => 'logo_url', 'value' => '', 'group' => 'general'],
            ['key' => 'favicon_url', 'value' => '/favicon.ico', 'group' => 'general'],

            // Contact
            ['key' => 'contact_email', 'value' => 'contact@camgo.com', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+855 23 888 777', 'group' => 'contact'],
            ['key' => 'contact_address_en', 'value' => 'No. 88, Preah Norodom Blvd, Daun Penh, Phnom Penh, Cambodia', 'group' => 'contact'],
            ['key' => 'contact_address_km', 'value' => 'អគារលេខ ៨៨ មហាវិថីព្រះនរោត្តម ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ', 'group' => 'contact'],

            // Social links
            ['key' => 'social_facebook', 'value' => 'https://facebook.com/camgo', 'group' => 'social'],
            ['key' => 'social_instagram', 'value' => 'https://instagram.com/camgo', 'group' => 'social'],
            ['key' => 'social_telegram', 'value' => 'https://t.me/camgo', 'group' => 'social'],
            ['key' => 'social_youtube', 'value' => 'https://youtube.com/@camgo', 'group' => 'social'],

            // SEO defaults
            ['key' => 'seo_title_default', 'value' => 'CamGO Travel | Explore Cambodia - Temples, Beaches & Heritage', 'group' => 'seo'],
            ['key' => 'seo_description_default', 'value' => 'Your ultimate guide to traveling Cambodia. Discover Angkor Wat, tropical islands, pristine national parks, and local culture.', 'group' => 'seo'],
            ['key' => 'seo_keywords_default', 'value' => 'Cambodia travel, Angkor Wat, Siem Reap, Phnom Penh, Koh Rong, Cambodian tourism, temples, hotels, eco-tourism', 'group' => 'seo'],
        ];

        foreach ($settings as $s) {
            Setting::set($s['key'], $s['value'], $s['group']);
        }
    }
}
