<?php

namespace Database\Seeders;

use App\Models\Destination;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::role('Tourist')->get();
        $destinations = Destination::all();

        if ($users->isEmpty() || $destinations->isEmpty()) {
            return;
        }

        $sampleReviews = [
            [
                'rating' => 5,
                'comment' => 'Watching the sunrise over Angkor Wat was an unforgettable bucket-list experience! The reflections in the lotus pond were breathtaking. Make sure to arrive early around 5:15 AM with a torch.',
            ],
            [
                'rating' => 5,
                'comment' => 'ទស្សនាថ្ងៃរះនៅប្រាសាទអង្គរវត្តពិតជាអស្ចារ្យខ្លាំងណាស់! ទេសភាពស្អាតដូចគំនូរ ទឹកស្រះឆ្លុះរូបប្រាសាទយ៉ាងច្បាស់។ ណែនាំឱ្យមកដល់មុនម៉ោង ៥:១៥ ព្រឹក។',
            ],
            [
                'rating' => 5,
                'comment' => 'The enigmatic smiles on the 216 giant stone faces of Bayon were surreal. The morning light cast gorgeous shadows across the stone carvings. One of my favorite temples in the world!',
            ],
            [
                'rating' => 5,
                'comment' => 'ប្រាសាទបាយ័នស្អាតប្លែកភ្នែក មុខញញឹមថ្មធំៗមើលទៅអាថ៌កំបាំងនិងគួរឱ្យស្ងើចសរសើរខ្លាំងណាស់។ ចម្លាក់ជញ្ជាំងឆ្លុះបញ្ចាំងពីជីវិតពលរដ្ឋខ្មែរពីបុរាណយ៉ាងច្បាស់។',
            ],
            [
                'rating' => 5,
                'comment' => 'Ta Prohm truly felt like entering another world. The gigantic tree roots wrapped around the ruins are an awe-inspiring testament to the power of nature over stone.',
            ],
            [
                'rating' => 4,
                'comment' => 'Sok San beach on Koh Rong has the softest white sand I have ever felt. Swimming with glowing bioluminescent plankton at night was pure magic!',
            ],
            [
                'rating' => 5,
                'comment' => 'កោះរ៉ុងសមុទ្រស្អាតខ្សាច់សក្បុស! ទឹកថ្លាដូចកញ្ចក់ ពេលយប់បានហែលទឹកលេងជាមួយផ្លុងតុងភ្លឺរលោងប្លែកភ្នែក។ ណែនាំសម្រាកនៅឆ្នេរសុខសាន្ត ស្ងប់ស្ងាត់ល្អណាស់។',
            ],
            [
                'rating' => 5,
                'comment' => 'Bokor Mountain has such a cool, crisp climate! Loved exploring the old Catholic Church and the views from the cliff edge over the ocean are breathtaking.',
            ],
            [
                'rating' => 5,
                'comment' => 'The Silver Pagoda in Phnom Penh is incredible. Standing on thousands of pure silver floor tiles and seeing the emerald and diamond-studded golden Buddhas was awe-inspiring.',
            ],
            [
                'rating' => 5,
                'comment' => 'Fresh blue crabs stir-fried with green Kampot peppercorns at Kep market is the best meal I had in Cambodia! Make sure to sit at one of the waterfront wooden terraces for sunset.',
            ],
        ];

        $reviewIndex = 0;
        foreach ($destinations as $destination) {
            // Add 2 reviews per destination
            for ($i = 0; $i < 2; $i++) {
                $sample = $sampleReviews[$reviewIndex % count($sampleReviews)];
                $user = $users[$reviewIndex % $users->count()];

                Review::create([
                    'user_id' => $user->id,
                    'reviewable_type' => Destination::class,
                    'reviewable_id' => $destination->id,
                    'rating' => $sample['rating'],
                    'comment' => $sample['comment'],
                    'status' => 'approved',
                    'ip_address' => '127.0.0.1',
                ]);

                $reviewIndex++;
            }

            // Recalculate stats
            $destination->updateRatingStats();
        }
    }
}
