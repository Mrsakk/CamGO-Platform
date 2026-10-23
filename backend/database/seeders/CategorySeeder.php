<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name_en' => 'Temples & Heritage',
                'name_km' => 'ប្រាសាទ និងបេតិកភណ្ឌ',
                'icon' => 'landmark',
                'description_en' => 'Ancient Khmer temples, UNESCO archaeological ruins, and sacred historical monuments.',
                'description_km' => 'ប្រាសាទបុរាណខ្មែរ រមណីយដ្ឋានប្រវត្តិសាស្ត្រយូណេស្កូ និងសម្បត្តិវប្បធម៌ដ៏វិសេសវិសាល។',
                'image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
                'order' => 1,
            ],
            [
                'name_en' => 'Nature & Waterfalls',
                'name_km' => 'ធម្មជាតិ និងទឹកធ្លាក់',
                'icon' => 'droplets',
                'description_en' => 'Cascading waterfalls, pristine rivers, national parks, and emerald jungle streams.',
                'description_km' => 'ទឹកធ្លាក់ហូរកាត់ផ្ទាំងថ្ម ស្ទឹងធម្មជាតិ ឧទ្យានជាតិ និងព្រៃព្រឹក្សាដ៏ស្រស់បំព្រង។',
                'image' => 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
                'order' => 2,
            ],
            [
                'name_en' => 'Islands & Beaches',
                'name_km' => 'កោះ និងឆ្នេរសមុទ្រ',
                'icon' => 'palmtree',
                'description_en' => 'White sand beaches, turquoise waters, tropical coral reefs, and tranquil island escapes.',
                'description_km' => 'ឆ្នេរខ្សាច់សក្បុស ទឹកសមុទ្រថ្លាដូចកញ្ចក់ ផ្កាថ្ម និងកោះលម្ហែកាយដ៏ស្ងប់ស្ងាត់។',
                'image' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
                'order' => 3,
            ],
            [
                'name_en' => 'Mountains & Eco-tourism',
                'name_km' => 'ភ្នំ និងទេសចរណ៍ធម្មជាតិ',
                'icon' => 'mountain',
                'description_en' => 'Misty highland peaks, pine forests, community ecotourism lodges, and camping trails.',
                'description_km' => 'កំពូលភ្នំព្រៃស្រល់ ទេសចរណ៍សហគមន៍ធម្មជាតិ និងទីតាំងបោះតង់កម្សាន្ត។',
                'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
                'order' => 4,
            ],
            [
                'name_en' => 'Culture & Museums',
                'name_km' => 'វប្បធម៌ និងសារមន្ទីរ',
                'icon' => 'palette',
                'description_en' => 'Royal palaces, classical Khmer dance, national museums, and artisan craft workshops.',
                'description_km' => 'ព្រះបរមរាជវាំង របាំព្រះរាជទ្រព្យ សារមន្ទីរជាតិ និងសិប្បកម្មប្រពៃណីខ្មែរ។',
                'image' => 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
                'order' => 5,
            ],
            [
                'name_en' => 'Adventure & Trekking',
                'name_km' => 'ផ្សងព្រេង និងឡើងភ្នំ',
                'icon' => 'compass',
                'description_en' => 'Deep jungle trekking, zip-lining over canopy forests, kayaking, and cave exploration.',
                'description_km' => 'ដើរព្រៃផ្សងព្រេង ជិះខ្សែរ៉តកាត់ព្រៃក្រាស់ អុំទូកកាយ៉ាក់ និងរុករករូងភ្នំ។',
                'image' => 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=800&q=80',
                'order' => 6,
            ],
            [
                'name_en' => 'Local Life & Markets',
                'name_km' => 'ជីវភាពប្រជាជន និងផ្សារ',
                'icon' => 'shopping-bag',
                'description_en' => 'Floating villages, bustling local bazaars, street food alleys, and traditional silk weaving.',
                'description_km' => 'ភូមិបណ្តែតទឹក ផ្សារទំនិញបុរាណ ម្ហូបអាហារតាមដងផ្លូវ និងភូមិតម្បាញសូត្រខ្មែរ។',
                'image' => 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
                'order' => 7,
            ],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['slug' => Str::slug($cat['name_en'])],
                array_merge($cat, [
                    'slug' => Str::slug($cat['name_en']),
                    'is_active' => true,
                ])
            );
        }
    }
}
