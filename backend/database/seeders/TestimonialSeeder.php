<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'name' => 'Chenda Seng',
                'role' => 'Heritage Explorer',
                'location' => 'Phnom Penh, Cambodia',
                'trip' => 'Website Review',
                'rating' => 5,
                'avatar' => 'CS',
                'avatar_bg' => 'bg-laterite-600',
                'quote_km' => 'គេហទំព័រនេះងាយស្រួលស្វែងរកប្រាសាទបុរាណ និងកោះស្អាតៗណាស់! ព័ត៌មានផ្ទៀងផ្ទាត់ច្បាស់លាស់ ផែនទីត្រឹមត្រូវ ជួយខ្ញុំរៀបចំគម្រោងដើរលេងបានល្អឥតខ្ចោះ។',
                'quote_en' => 'The platform makes discovering ancient temples and islands effortless. Accurate maps and verified details made our trip planning completely stress-free!',
                'status' => 'approved',
            ],
            [
                'name' => 'Alexandre Dubois',
                'role' => 'Cultural Anthropologist',
                'location' => 'Paris, France',
                'trip' => 'Website Review',
                'rating' => 5,
                'avatar' => 'AD',
                'avatar_bg' => 'bg-amber-600',
                'quote_km' => 'ការរៀបចំកាលវិភាគដំណើរកម្សាន្តតាមថ្ងៃពិតជាងាយស្រួលបំផុត។ ខ្ញុំបានទស្សនាថ្ងៃរះអង្គរ និងភូមិបណ្ដែតទឹកដោយគ្មានឧបសគ្គអ្វីឡើយ។',
                'quote_en' => 'The smart trip planner is brilliant. We experienced the Angkor sunrise and floating villages seamlessly. A must-use travel guide for Cambodia!',
                'status' => 'approved',
            ],
            [
                'name' => 'Kenji Tanaka',
                'role' => 'Travel Photographer',
                'location' => 'Tokyo, Japan',
                'trip' => 'Website Review',
                'rating' => 5,
                'avatar' => 'KT',
                'avatar_bg' => 'bg-moss-600',
                'quote_km' => 'រូបភាពច្បាស់ស្អាត និងមានព័ត៌មានលម្អិតទាំង ២៥ ខេត្ត-រាជធានី។ ខ្ញុំចូលចិត្តមុខងាររក្សាទុកទីតាំងទេសចរណ៍ (Favorites) ខ្លាំងណាស់!',
                'quote_en' => 'High-resolution photos and verified atlas coverage across all 25 provinces. The favorites feature and quick previews are fantastic.',
                'status' => 'approved',
            ],
            [
                'name' => 'Sarah Jenkins',
                'role' => 'Solo Backpacker',
                'location' => 'Melbourne, Australia',
                'trip' => 'Website Review',
                'rating' => 5,
                'avatar' => 'SJ',
                'avatar_bg' => 'bg-river-600',
                'quote_km' => 'ខ្ញុំធ្វើដំណើរតែម្នាក់ឯងជាលើកដំបូងនៅកម្ពុជា គេហទំព័រនេះផ្តល់គន្លឹះមានប្រយោជន៍ និងសុវត្ថិភាពខ្ពស់ក្នុងការស្វែងរកកន្លែងស្នាក់នៅ និងតំបន់ទេសចរណ៍។',
                'quote_en' => 'Traveling solo in Cambodia for the first time was daunting, but this platform provided genuine cultural etiquette, safe routes, and breath-taking hidden gems.',
                'status' => 'approved',
            ],
        ];

        foreach ($items as $item) {
            Testimonial::firstOrCreate(
                ['name' => $item['name'], 'trip' => $item['trip']],
                $item
            );
        }
    }
}
