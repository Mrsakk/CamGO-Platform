<?php

namespace App\Modules\Business\Services;

use App\Modules\Business\Models\Business;

class ProfileScoreService
{
    public function forBusiness(Business $business): array
    {
        $business->loadMissing(['category', 'contacts', 'hours', 'media', 'documents']);

        $checks = [
            [
                'key' => 'identity',
                'label_km' => 'ព័ត៌មានមូលដ្ឋាន',
                'label_en' => 'Basic information',
                'weight' => 20,
                'done' => $this->hasCompleteIdentity($business),
                'hint_km' => 'បំពេញឈ្មោះ ការពិពណ៌នា និងប្រភេទអាជីវកម្មជាភាសាខ្មែរ និងអង់គ្លេស។',
                'hint_en' => 'Add bilingual name, description, category, and province.',
                'page' => 'profile',
            ],
            [
                'key' => 'contact',
                'label_km' => 'ព័ត៌មានទំនាក់ទំនង',
                'label_en' => 'Contact details',
                'weight' => 10,
                'done' => $business->contacts->isNotEmpty(),
                'hint_km' => 'បន្ថែមយ៉ាងហោចណាស់ព័ត៌មានទំនាក់ទំនងមួយ ដូចជាទូរស័ព្ទ ឬ Telegram។',
                'hint_en' => 'Add at least one contact method such as phone or Telegram.',
                'page' => 'contacts',
            ],
            [
                'key' => 'location',
                'label_km' => 'ទីតាំងលើផែនទី',
                'label_en' => 'Map location',
                'weight' => 10,
                'done' => $business->lat !== null && $business->lng !== null,
                'hint_km' => 'កំណត់ទីតាំងលើផែនទី ដើម្បីឱ្យភ្ញៀវរកឃើញអ្នកបានងាយស្រួល។',
                'hint_en' => 'Pin your location on the map so visitors can find you.',
                'page' => 'contacts',
            ],
            [
                'key' => 'media',
                'label_km' => 'រូបភាពអាជីវកម្ម',
                'label_en' => 'Business photos',
                'weight' => 20,
                'done' => $business->cover_media_id !== null && $business->media->count() >= 3,
                'hint_km' => 'ដាក់រូបគម្រប និងរូបភាពយ៉ាងហោចណាស់ 3 សម្រាប់បង្ហាញអាជីវកម្មរបស់អ្នក។',
                'hint_en' => 'Add a cover image and at least 3 photos of your business.',
                'page' => 'media',
            ],
            [
                'key' => 'hours',
                'label_km' => 'ម៉ោងបើកដំណើរការ',
                'label_en' => 'Opening hours',
                'weight' => 10,
                'done' => $business->hours->isNotEmpty(),
                'hint_km' => 'កំណត់ម៉ោងបើក និងបិទ ដើម្បីជូនដំណឹងដល់ភ្ញៀវ។',
                'hint_en' => 'Set opening and closing hours for visitors.',
                'page' => 'hours',
            ],
            [
                'key' => 'category_details',
                'label_km' => 'ព័ត៌មានតាមប្រភេទអាជីវកម្ម',
                'label_en' => 'Category-specific details',
                'weight' => 20,
                'done' => $this->hasCategoryDetails($business),
                'hint_km' => 'បំពេញព័ត៌មានបន្ថែមសម្រាប់ប្រភេទអាជីវកម្មរបស់អ្នក ដូចជាប្រភេទបន្ទប់ ឬម្ហូបពិសេស។',
                'hint_en' => 'Complete the extra fields for your business category.',
                'page' => 'profile',
            ],
            [
                'key' => 'verification',
                'label_km' => 'ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ',
                'label_en' => 'KYC verification',
                'weight' => 10,
                'done' => (bool) $business->is_verified,
                'hint_km' => 'ផ្ញើឯកសារអត្តសញ្ញាណ ដើម្បីទទួលបានសញ្ញាផ្ទៀងផ្ទាត់។',
                'hint_en' => 'Submit identity documents to receive the verified badge.',
                'page' => 'verification',
            ],
        ];

        $score = array_sum(array_map(
            fn (array $check) => $check['done'] ? $check['weight'] : 0,
            $checks,
        ));

        return [
            'score' => $score,
            'max_score' => 100,
            'checks' => $checks,
            'next_actions' => array_values(array_map(
                fn (array $check) => [
                    'key' => $check['key'],
                    'label_km' => $check['label_km'],
                    'label_en' => $check['label_en'],
                    'hint_km' => $check['hint_km'],
                    'hint_en' => $check['hint_en'],
                    'page' => $check['page'],
                ],
                array_filter($checks, fn (array $check) => !$check['done']),
            )),
            'is_trial_eligible' => $score >= 80 && (bool) $business->is_verified && !$business->hasUsedTrial(),
        ];
    }

    private function hasCompleteIdentity(Business $business): bool
    {
        return filled($business->name_km)
            && filled($business->name_en)
            && filled($business->description_km)
            && filled($business->description_en)
            && $business->category_id !== null
            && $business->province_id !== null;
    }

    private function hasCategoryDetails(Business $business): bool
    {
        $schema = $business->category?->profile_schema ?? [];

        if (empty($schema)) {
            return true;
        }

        $data = $business->profile_data ?? [];

        foreach ($schema as $field) {
            $key = $field['key'] ?? null;
            if (!$key) {
                continue;
            }

            $value = $data[$key] ?? null;
            if (is_array($value) ? empty($value) : blank($value)) {
                return false;
            }
        }

        return true;
    }
}
