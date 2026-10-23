<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();

        $posts = [
            [
                'title_en' => 'Complete Guide to Angkor Wat Sunrise: Secret Spots & Photo Tips',
                'title_km' => 'មគ្គុទ្ទេសក៍ទស្សនាថ្ងៃរះនៅអង្គរវត្ត៖ គន្លឹះថតរូប និងទីតាំងស្អាតៗ',
                'excerpt_en' => 'Everything you need to know before experiencing the most famous sunrise in Southeast Asia, including what time to arrive and best vantage points.',
                'excerpt_km' => 'ព័ត៌មានលម្អិតទាំងអស់ដែលអ្នកត្រូវដឹងមុនពេលទៅទស្សនាថ្ងៃរះដ៏ល្បីល្បាញបំផុតនៅអាស៊ីអាគ្នេយ៍ ពេលវេលាទៅដល់ និងគន្លឹះថតរូប។',
                'content_en' => 'Watching the first rays of dawn illuminate the iconic lotus towers of Angkor Wat is a transcendent travel moment. In this comprehensive guide, we share expert local insights on obtaining your Angkor Pass smoothly, picking the optimal lotus pond reflection spot, packing essential flashlight and camera gear, and respecting local spiritual customs.',
                'content_km' => 'ការគយគន់ពន្លឺព្រះអាទិត្យដំបូងចាំងជះលើកំពូលផ្កាឈូកនៃប្រាសាទអង្គរវត្ត គឺជាពេលវេលាទេសចរណ៍ដ៏វិសេសវិសាលបំផុត។ នៅក្នុងអត្ថបទនេះ យើងនឹងចែករំលែកនូវចំណេះដឹងពីអ្នកជំនាញក្នុងតំបន់ អំពីការទិញប័ណ្ណអង្គរ ការជ្រើសរើសទីតាំងក្បែរស្រះឈូកដើម្បីថតរូបឆ្លុះ ការត្រៀមឧបករណ៍ និងការគោរពទំនៀមទម្លាប់ប្រពៃណីខ្មែរ។',
                'cover_image' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                'tags' => ['Angkor Wat', 'Siem Reap', 'Photography', 'Travel Tips'],
                'published_at' => now()->subDays(5),
                'view_count' => 1420,
            ],
            [
                'title_en' => 'Exploring Cambodia’s Southern Coast: Kampot Pepper & Kep Crabs',
                'title_km' => 'ដំណើរកម្សាន្តតំបន់ឆ្នេរភាគខាងត្បូង៖ ម្រេចកំពត និងក្តាមកែប',
                'excerpt_en' => 'A weekend itinerary combining colonial riverside architecture, world-renowned organic pepper farms, and beachside seafood feasts.',
                'excerpt_km' => 'គម្រោងដំណើរកម្សាន្តចុងសប្តាហ៍ រួមបញ្ចូលស្ថាបត្យកម្មបារាំងមាត់ស្ទឹងកំពត ចម្ការម្រេចសរីរាង្គ និងពិធីជប់លៀងគ្រឿងសមុទ្រនៅឆ្នេរកែប។',
                'content_en' => 'Cambodia’s southern coastline is a culinary dream. Just a short drive separates the languid, French-colonial charm of Kampot from the salt breezes and crab markets of Kep. Learn how organic Kampot pepper is cultivated, cycle between limestone karst caves, and taste the legendary blue crab dish cooked with fresh green peppercorns.',
                'content_km' => 'តំបន់ឆ្នេរភាគខាងត្បូងនៃប្រទេសកម្ពុជា គឺជាឋានសួគ៌សម្រាប់អ្នកចូលចិត្តម្ហូបអាហារ។ ក្រុងកំពតមានអគារបេតិកភណ្ឌសម័យបារាំងដ៏ស្រស់ស្អាតតាមមាត់ព្រែក ចម្ការម្រេចសរីរាង្គល្បីកម្រិតពិភពលោក និងការទទួលទានក្តាមសេះស្រស់ៗឆាម្រេចខ្ចីនៅផ្សារក្តាមកែប។',
                'cover_image' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
                'tags' => ['Kampot', 'Kep', 'Culinary', 'Seafood', 'Road Trip'],
                'published_at' => now()->subDays(12),
                'view_count' => 980,
            ],
            [
                'title_en' => 'Top 5 Pristine Islands in Cambodia for a Tropical Getaway',
                'title_km' => 'កោះឋានសួគ៌ទាំង ៥ នៅកម្ពុជាសម្រាប់វិស្សមកាលត្រូពិក',
                'excerpt_en' => 'Discover the best islands for powdery white sand, bioluminescent plankton, coral reef snorkeling, and tranquil bamboo huts.',
                'excerpt_km' => 'ស្វែងរកកោះស្អាតបំផុតដែលមានឆ្នេរខ្សាច់សក្បុស ពន្លឺផ្លុងតុងរាត្រី ផ្កាថ្មក្រោមសមុទ្រ និងផ្ទះលម្ហែកាយស្ងប់ស្ងាត់។',
                'content_en' => 'While neighboring countries draw packed crowds, Cambodia’s coastal islands retain uncrowded tropical beauty. From the vibrant party shores and 7-km empty sands of Koh Rong to the untouched calm of Koh Rong Sanloem, Koh Ta Kiev, and rustic Rabbit Island, find your perfect island sanctuary.',
                'content_km' => 'កោះសមុទ្រនៃប្រទេសកម្ពុជារក្សាបាននូវធម្មជាតិស្រស់ស្អាតនិងភាពស្ងប់ស្ងាត់។ ចាប់ពីកោះរ៉ុងដែលមានឆ្នេរខ្សាច់ប្រវែង ៧ គីឡូម៉ែត្រ រហូតដល់កោះរ៉ុងសន្លឹម កោះតាគៀវ និងកោះទន្សាយ អ្នកនឹងទទួលបាននូវបទពិសោធន៍វិស្សមកាលត្រូពិកដ៏រំភើបនិងជក់ចិត្ត។',
                'cover_image' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                'tags' => ['Islands', 'Koh Rong', 'Beaches', 'Snorkeling', 'Ecotourism'],
                'published_at' => now()->subDays(18),
                'view_count' => 1250,
            ],
        ];

        foreach ($posts as $post) {
            BlogPost::firstOrCreate(
                ['slug' => Str::slug($post['title_en'])],
                array_merge($post, [
                    'slug' => Str::slug($post['title_en']),
                    'author_id' => $admin?->id,
                    'is_published' => true,
                ])
            );
        }
    }
}
