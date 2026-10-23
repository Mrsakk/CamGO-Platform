<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'category' => 'general',
                'question_en' => 'What is the best time of year to visit Cambodia?',
                'question_km' => 'តើរដូវណាដែលល្អបំផុតសម្រាប់មកទស្សនាកម្ពុជា?',
                'answer_en' => 'The most popular time to visit is during the cool and dry season from November to February, when temperatures average 25°C - 30°C with low humidity. The green season from June to October brings afternoon showers but also lush landscapes and fewer temple crowds.',
                'answer_km' => 'រដូវដែលល្អបំផុតគឺរដូវរំហើយចាប់ពីខែវិច្ឆិកា ដល់កុម្ភៈ ដែលមានសីតុណ្ហភាពជាមធ្យម ២៥°C - ៣០°C និងគ្មានភ្លៀង។ ចំណែករដូវវស្សាចាប់ពីខែមិថុនា ដល់តុលា ទេសភាពព្រៃឈើខៀវស្រងាត់ និងមានភ្ញៀវតិច។',
                'order' => 1,
            ],
            [
                'category' => 'visa',
                'question_en' => 'Do I need a visa to enter Cambodia?',
                'question_km' => 'តើខ្ញុំត្រូវការទិដ្ឋាការ (Visa) ដែរឬទេ?',
                'answer_en' => 'Most international tourists require a 30-day tourist visa (Type T). You can obtain an official e-Visa online prior to arrival via www.evisa.gov.kh, or purchase a Visa on Arrival at Phnom Penh, Siem Reap, and Sihanoukville international airports for $30 USD.',
                'answer_km' => 'ភ្ញៀវទេសចរអន្តរជាតិភាគច្រើនត្រូវការទិដ្ឋាការទេសចរណ៍ ៣០ ថ្ងៃ។ អ្នកអាចស្នើសុំ e-Visa តាមអ៊ីនធឺណិត ឬធ្វើទិដ្ឋាការពេលមកដល់ (Visa on Arrival) នៅព្រលានយន្តហោះអន្តរជាតិភ្នំពេញ សៀមរាប និងព្រះសីហនុ ក្នុងតម្លៃ ៣០ ដុល្លារអាមេរិក។',
                'order' => 2,
            ],
            [
                'category' => 'currency',
                'question_en' => 'What currency is used in Cambodia and can I pay digitally?',
                'question_km' => 'តើកម្ពុជាប្រើប្រាស់រូបិយប័ណ្ណអ្វីខ្លះ ហើយអាចទូទាត់តាមឌីជីថលបានទេ?',
                'answer_en' => 'Cambodia operates a dual-currency system with the Cambodian Riel (KHR) and US Dollars (USD). KHQR and Bakong digital mobile payments are widely accepted across restaurants, shops, and transport.',
                'answer_km' => 'ប្រទេសកម្ពុជាប្រើប្រាស់ប្រាក់រៀល (KHR) និងដុល្លារអាមេរិក (USD)។ ការទូទាត់តាមប្រព័ន្ធឌីជីថល KHQR និងបាគងត្រូវបានទទួលស្គាល់យ៉ាងទូលំទូលាយនៅគ្រប់ទីកន្លែង។',
                'order' => 3,
            ],
            [
                'category' => 'angkor',
                'question_en' => 'How does the Angkor Pass work and where can I buy it?',
                'question_km' => 'តើប័ណ្ណចូលទស្សនាអង្គរមានដំណើរការយ៉ាងដូចម្តេច ហើយទិញនៅឯណា?',
                'answer_en' => 'The Angkor Pass covers all major temples in the Archaeological Park. Options include 1-day ($37), 3-day ($62, valid over 10 days), and 7-day ($72, valid over 1 month). You can purchase at the official Angkor Enterprise ticketing center or online.',
                'answer_km' => 'ប័ណ្ណអង្គរគ្របដណ្តប់លើប្រាសាទសំខាន់ៗទាំងអស់ក្នុងរមណីយដ្ឋាន។ មានជម្រើស ១ថ្ងៃ (៣៧$), ៣ថ្ងៃ (៦២$) និង ៧ថ្ងៃ (៧២$)។ អ្នកអាចទិញនៅមជ្ឈមណ្ឌលលក់សំបុត្រផ្លូវការ ឬតាមអនឡាញ។',
                'order' => 4,
            ],
            [
                'category' => 'safety',
                'question_en' => 'Is Cambodia safe for solo and family travelers?',
                'question_km' => 'តើប្រទេសកម្ពុជាមានសុវត្ថិភាពសម្រាប់អ្នកដំណើរទោល និងក្រុមគ្រួសារដែរឬទេ?',
                'answer_en' => 'Cambodia is widely regarded as one of the friendliest and safest destinations in Southeast Asia. Locals are exceptionally welcoming. Standard travel awareness applies regarding bags in crowded markets and staying hydrated.',
                'answer_km' => 'ប្រទេសកម្ពុជាត្រូវបានចាត់ទុកជាប្រទេសដែលមានសុវត្ថិភាព និងភាពរាក់ទាក់បំផុតមួយនៅអាស៊ីអាគ្នេយ៍។ ប្រជាជនមានចិត្តល្អ និងរាក់ទាក់ស្វាគមន៍ភ្ញៀវទេសចរជានិច្ច។',
                'order' => 5,
            ],
        ];

        foreach ($faqs as $f) {
            Faq::firstOrCreate(['question_en' => $f['question_en']], array_merge($f, ['is_active' => true]));
        }
    }
}
