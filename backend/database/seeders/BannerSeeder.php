<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title_en' => 'Discover the Kingdom of Wonder',
                'title_km' => 'ស្វែងយល់ពីព្រះរាជាណាចក្រអច្ឆរិយៈ',
                'subtitle_en' => 'Explore ancient Angkorian temples, pristine tropical islands, and untamed nature trails.',
                'subtitle_km' => 'ទស្សនាប្រាសាទបុរាណសម័យអង្គរ កោះត្រូពិកដ៏ស្រស់ស្អាត និងទេសភាពធម្មជាតិដ៏អស្ចារ្យ។',
                'image_url' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85',
                'button_text_en' => 'Explore Destinations',
                'button_text_km' => 'រុករកគោលដៅទេសចរណ៍',
                'link_url' => '/destinations',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'title_en' => 'Tropical Island Escapes',
                'title_km' => 'វិស្សមកាលលើកោះឋានសួគ៌',
                'subtitle_en' => 'Unwind on powdery white sand beaches and swim in turquoise waters across Koh Rong archipelago.',
                'subtitle_km' => 'សម្រាកលម្ហែកាយលើឆ្នេរខ្សាច់សក្បុស និងហែលទឹកសមុទ្រថ្លាឈ្វេងនៅប្រជុំកោះរ៉ុង។',
                'image_url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85',
                'button_text_en' => 'View Coastal Trips',
                'button_text_km' => 'មើលដំណើរកម្សាន្តមាត់សមុទ្រ',
                'link_url' => '/categories/islands-beaches',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'title_en' => 'Misty Highland Adventures',
                'title_km' => 'ដំណើរផ្សងព្រេងលើខ្ពង់រាបធម្មជាតិ',
                'subtitle_en' => 'Hike through pine forests in Kirirom and discover thunderous waterfalls in Mondulkiri.',
                'subtitle_km' => 'ដើរព្រៃស្រល់នៅគិរីរម្យ និងទស្សនាទឹកធ្លាក់ប៊ូស្រាដ៏អស្ចារ្យនៅមណ្ឌលគិរី។',
                'image_url' => 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=85',
                'button_text_en' => 'Discover Nature',
                'button_text_km' => 'ស្វែងយល់ពីធម្មជាតិ',
                'link_url' => '/categories/mountains-eco-tourism',
                'order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $b) {
            Banner::firstOrCreate(['title_en' => $b['title_en']], $b);
        }
    }
}
