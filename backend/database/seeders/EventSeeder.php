<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Province;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $sr = Province::where('code', 'SRP')->first();
        $phnomPenh = Province::where('code', 'PNH')->first();
        $kep = Province::where('code', 'KEP')->first();

        $events = [
            [
                'title_en' => 'Bon Om Touk (Cambodian Water Festival)',
                'title_km' => 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ អកអំបុក',
                'description_en' => 'One of the largest traditional festivals in Southeast Asia, commemorating the naval victories of the Khmer Empire and reversing flow of the Tonle Sap River. Features hundreds of dragon boat races, glowing illuminated floats, and open-air riverside concerts.',
                'description_km' => 'ពិធីបុណ្យប្រពៃណីជាតិដ៏ធំអស្ចារ្យ ដើម្បីរំលឹកដល់ជ័យជម្នះនៃកងទ័ពជើងទឹកខ្មែរ និងបាតុភូតធម្មជាតិនៃការប្តូរទិសដៅទឹកទន្លេសាប។ មានការប្រណាំងទូកងរាប់រយគូ ការបណ្តែតប្រទីបព្រះរាជវាំងដ៏ភ្លឺចិញ្ចាច និងការប្រគំតន្ត្រីតាមដងទន្លេ។',
                'province_id' => $phnomPenh?->id,
                'location_name_en' => 'Sisowath Quay & Tonle Sap Riverside, Phnom Penh',
                'location_name_km' => 'វិថីព្រះស៊ីសុវត្ថិ និងមាត់ទន្លេចតុមុខ រាជធានីភ្នំពេញ',
                'cover_image' => 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
                'start_date' => now()->addDays(45)->setHour(8)->setMinute(0),
                'end_date' => now()->addDays(47)->setHour(22)->setMinute(0),
                'is_featured' => true,
            ],
            [
                'title_en' => 'Angkor Sankranta & Khmer New Year',
                'title_km' => 'អង្គរសង្ក្រាន្ត និងពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ',
                'description_en' => 'The vibrant celebration of traditional Khmer New Year held within the ancient temples of Angkor. Experience classical Lakhon Khol mask theater, traditional village games, sticky rice cake displays, and folk dancing under the shade of ancient banyans.',
                'description_km' => 'ការប្រារព្ធពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរនៅរមណីយដ្ឋានអង្គរវត្ត។ រីករាយជាមួយល្ខោនខោលបុរាណ ល្បែងប្រជាប្រិយខ្មែរ (ចោលឈូង បោះអង្គញ់ ទាញព្រ័ត្រ) ពិព័រណ៍នំអន្សម និងការរាំកម្សាន្តយ៉ាងសប្បាយរីករាយ។',
                'province_id' => $sr?->id,
                'location_name_en' => 'Angkor Wat Esplanade & Royal Gardens, Siem Reap',
                'location_name_km' => 'បរិវេណមុខប្រាសាទអង្គរវត្ត និងសួនច្បារព្រះរាជដំណាក់ ខេត្តសៀមរាប',
                'cover_image' => 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80',
                'start_date' => now()->addMonths(6)->setHour(7)->setMinute(0),
                'end_date' => now()->addMonths(6)->addDays(3)->setHour(23)->setMinute(0),
                'is_featured' => true,
            ],
            [
                'title_en' => 'Angkor Wat International Half Marathon',
                'title_km' => 'ការរត់ប្រណាំងពាក់កណ្តាលម៉ារ៉ាតុងអន្តរជាតិអង្គរវត្ត',
                'description_en' => 'An iconic charity road race taking runners directly through the ancient temple ruins of Angkor Wat, Bayon, and Ta Prohm. Attracts thousands of international runners from over 80 countries each year.',
                'description_km' => 'ព្រឹត្តិការណ៍រត់ប្រណាំងមនុស្សធម៌ដ៏ល្បីល្បាញ ដែលរត់កាត់បរិវេណប្រាសាទបុរាណអង្គរវត្ត បាយ័ន និងតាព្រហ្ម។ ទទួលបានការចូលរួមពីកីឡាករអន្តរជាតិរាប់ពាន់នាក់មកពីជាង ៨០ ប្រទេសជុំវិញពិភពលោក។',
                'province_id' => $sr?->id,
                'location_name_en' => 'Angkor Wat Main Avenue, Siem Reap',
                'location_name_km' => 'មុខប្រាសាទអង្គរវត្ត ខេត្តសៀមរាប',
                'cover_image' => 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
                'start_date' => now()->addMonths(2)->setHour(5)->setMinute(30),
                'end_date' => now()->addMonths(2)->setHour(12)->setMinute(0),
                'is_featured' => false,
            ],
            [
                'title_en' => 'Cambodia Annual Sea Festival',
                'title_km' => 'ពិធីបុណ្យសមុទ្រកម្ពុជាប្រចាំឆ្នាំ',
                'description_en' => 'Grand annual coastal tourism carnival featuring international sailing competitions, beach volleyball, culinary trade fairs of fresh marine seafood, and spectacular fireworks along the beach.',
                'description_km' => 'មហោស្រពទេសចរណ៍តំបន់ឆ្នេរប្រចាំឆ្នាំ មានការប្រកួតកីឡាលើទឹក បាល់ទះឆ្នេរខ្សាច់ ការតាំងពិព័រណ៍ម្ហូបអាហារគ្រឿងសមុទ្រ និងការបាញ់កាំជ្រួចដ៏អស្ចារ្យលើផ្ទៃសមុទ្រ។',
                'province_id' => $kep?->id,
                'location_name_en' => 'Kep Beach Waterfront Promenade, Kep',
                'location_name_km' => 'ឆ្នេរកែប និងវិថីមាត់សមុទ្រ ខេត្តកែប',
                'cover_image' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                'start_date' => now()->addMonths(3)->setHour(8)->setMinute(0),
                'end_date' => now()->addMonths(3)->addDays(2)->setHour(22)->setMinute(0),
                'is_featured' => false,
            ],
        ];

        foreach ($events as $event) {
            Event::firstOrCreate(
                ['slug' => Str::slug($event['title_en'])],
                array_merge($event, [
                    'slug' => Str::slug($event['title_en']),
                    'is_published' => true,
                ])
            );
        }
    }
}
