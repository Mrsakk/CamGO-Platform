<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'about',
                'title_en' => 'About CamGO Travel',
                'title_km' => 'អំពី CamGO Travel',
                'content_en' => 'CamGO Travel is a premier national tourism platform created to promote the rich cultural heritage, ecological wonders, and vibrant communities of Cambodia to travelers around the world. Our mission is to celebrate authentic Khmer experiences—from the towering stone temples of the Angkor Empire to the tranquil beaches of Koh Rong and the misty pine forests of Kirirom. Phase 1 provides travelers with comprehensive free guides, high-resolution media, interactive maps, verified visitor reviews, and itinerary planning tools.',
                'content_km' => 'CamGO Travel គឺជាថ្នាលទេសចរណ៍ជាតិឈានមុខគេដែលបង្កើតឡើងដើម្បីផ្សព្វផ្សាយបេតិកភណ្ឌវប្បធម៌ដ៏សម្បូរបែប អច្ឆរិយភាពធម្មជាតិ និងសហគមន៍រស់រវើកនៃព្រះរាជាណាចក្រកម្ពុជាទៅកាន់ពិភពលោក។ បេសកកម្មរបស់យើងគឺលើកកម្ពស់បទពិសោធន៍ខ្មែរពិតប្រាកដ ចាប់ពីប្រាសាទបុរាណសម័យអង្គរ រហូតដល់កោះសមុទ្រខ្សាច់សក្បុស និងព្រៃភ្នំធម្មជាតិ។ ដំណាក់កាលទី១ ផ្តល់ជូនអ្នកដំណើរនូវមគ្គុទ្ទេសក៍ឥតគិតថ្លៃ ផែនទីអន្តរកម្ម ការវាយតម្លៃពិតប្រាកដ និងព័ត៌មានលម្អិត។',
                'meta_title' => 'About CamGO Travel - Promoting Cambodian Tourism',
                'meta_description' => 'Discover the mission of CamGO Travel in sharing Cambodia’s rich culture, world heritage temples, and natural wonders.',
                'is_published' => true,
            ],
            [
                'slug' => 'privacy-policy',
                'title_en' => 'Privacy Policy',
                'title_km' => 'គោលការណ៍ឯកជនភាព',
                'content_en' => 'At CamGO Travel, accessible from our web platform, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information that is collected and recorded by CamGO Travel and how we use it. We do not sell, rent, or share personal data with third parties without your explicit consent. Your account information is protected with industry-standard encryption.',
                'content_km' => 'នៅ CamGO Travel ការការពារឯកជនភាពរបស់អ្នកប្រើប្រាស់គឺជាអាទិភាពចម្បងរបស់យើង។ គោលការណ៍ឯកជនភាពនេះរៀបរាប់អំពីប្រភេទព័ត៌មានដែលត្រូវបានប្រមូល និងរបៀបដែលយើងប្រើប្រាស់វា។ យើងមិនលក់ ឬចែករំលែកទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកទៅកាន់ភាគីទីបីដោយគ្មានការយល់ព្រមឡើយ។',
                'meta_title' => 'Privacy Policy - CamGO Travel',
                'meta_description' => 'Read our Privacy Policy to understand how your personal information and travel data are protected.',
                'is_published' => true,
            ],
            [
                'slug' => 'terms',
                'title_en' => 'Terms of Use',
                'title_km' => 'លក្ខខណ្ឌនៃការប្រើប្រាស់',
                'content_en' => 'By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use CamGO Travel if you do not accept all of the terms stated on this page. All content, images, and brand materials are intellectual property of CamGO or used with permissions. User-submitted reviews must be truthful, respectful, and free of hate speech.',
                'content_km' => 'តាមរយៈការចូលប្រើប្រាស់គេហទំព័រនេះ អ្នកយល់ព្រមអនុវត្តតាមលក្ខខណ្ឌទាំងអស់ដែលមានចែងនៅទីនេះ។ រាល់ខ្លឹមសារ រូបភាព និងសម្ភារៈទាំងអស់គឺជាកម្មសិទ្ធិបញ្ញារបស់ CamGO។ មតិវាយតម្លៃដែលបង្ហោះដោយអ្នកប្រើប្រាស់ត្រូវតែជាការពិត និងប្រកបដោយសេចក្តីថ្លៃថ្នូរ។',
                'meta_title' => 'Terms of Use - CamGO Travel',
                'meta_description' => 'Review the terms and conditions governing the use of the CamGO Travel platform.',
                'is_published' => true,
            ],
        ];

        foreach ($pages as $p) {
            Page::firstOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
