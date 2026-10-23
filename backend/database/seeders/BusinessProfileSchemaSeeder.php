<?php

namespace Database\Seeders;

use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Category;
use Illuminate\Database\Seeder;

class BusinessProfileSchemaSeeder extends Seeder
{
    public function run(): void
    {
        $presets = $this->servicePresets();

        foreach ($this->schemas() as $slug => $schema) {
            $update = ['profile_schema' => $schema];

            if (isset($presets[$slug])) {
                $update['service_presets'] = $presets[$slug];
            }

            Category::where('slug', $slug)->update($update);
        }

        Business::with('category')
            ->whereNull('profile_data')
            ->chunkById(100, function ($businesses) {
                foreach ($businesses as $business) {
                    $schema = $business->category?->profile_schema ?? [];
                    if (empty($schema)) {
                        continue;
                    }

                    $business->update(['profile_data' => $this->demoData($schema)]);
                    $this->demoServices($business);
                }
            });
    }

    private function demoServices(Business $business): void
    {
        $slug = $business->category?->slug;
        $preset = $slug ? ($this->servicePresets()[$slug] ?? null) : null;

        if (! $preset || $business->services()->exists()) {
            return;
        }

        foreach ($preset['examples'] ?? [] as $index => $name) {
            $business->services()->create([
                'name_km' => $name,
                'name_en' => $name,
                'price_usd' => 15 + ($index * 10),
                'duration_minutes' => [60, 90, 120][$index] ?? null,
                'is_active' => true,
                'sort_order' => $index + 1,
            ]);
        }
    }

    private function demoData(array $schema): array
    {
        $data = [];

        foreach ($schema as $field) {
            $key = $field['key'] ?? null;
            if (! $key) {
                continue;
            }

            $placeholder = $field['placeholder_en'] ?? '';
            $data[$key] = match ($field['type'] ?? 'text') {
                'tags' => array_values(array_filter(array_map('trim', explode(',', $placeholder)))),
                'number' => 1,
                'boolean' => true,
                'url' => 'https://www.camgo.com',
                'textarea' => $placeholder ?: 'Demo profile information for testing.',
                default => $placeholder ?: 'Demo',
            };
        }

        return $data;
    }

    private function servicePresets(): array
    {
        return [
            'accommodation' => [
                'label_en' => 'Room or stay package',
                'label_km' => 'បន្ទប់ ឬកញ្ចប់ស្នាក់នៅ',
                'examples' => ['Deluxe Room', 'Family Suite', 'Airport Transfer'],
            ],
            'restaurant-cafe' => [
                'label_en' => 'Dish or set menu',
                'label_km' => 'ម្ហូប ឬឈុតម្ហូប',
                'examples' => ['Fish Amok', 'Loc Lac', 'Set Menu'],
            ],
            'tour-guide' => [
                'label_en' => 'Tour package',
                'label_km' => 'កញ្ចប់ដំណើរ',
                'examples' => ['Angkor Sunrise Tour', 'City Tour', 'Custom Day Tour'],
            ],
            'transport' => [
                'label_en' => 'Route or transfer',
                'label_km' => 'ផ្លូវ ឬសេវាដឹកជញ្ជូន',
                'examples' => ['Airport Transfer', 'Siem Reap to Phnom Penh', 'Full-day Driver'],
            ],
            'crafts-souvenirs' => [
                'label_en' => 'Product',
                'label_km' => 'ផលិតផល',
                'examples' => ['Handwoven Silk Scarf', 'Stone Carving', 'Kampot Pepper'],
            ],
            'spa-wellness' => [
                'label_en' => 'Treatment',
                'label_km' => 'ការព្យាបាល',
                'examples' => ['Khmer Massage', 'Facial Treatment', 'Herbal Sauna'],
            ],
            'activities' => [
                'label_en' => 'Activity',
                'label_km' => 'សកម្មភាព',
                'examples' => ['Sunrise Kayaking', 'Cooking Class', 'Countryside Cycling'],
            ],
        ];
    }

    private function schemas(): array
    {
        return [
            'accommodation' => [
                ['key' => 'amenities', 'label_en' => 'Amenities', 'label_km' => 'សេវាកម្មបន្ទប់', 'type' => 'tags', 'placeholder_en' => 'Wi-Fi, Pool, Breakfast'],
                ['key' => 'check_in_time', 'label_en' => 'Check-in time', 'label_km' => 'ម៉ោងចូល', 'type' => 'text', 'placeholder_en' => '14:00'],
                ['key' => 'check_out_time', 'label_en' => 'Check-out time', 'label_km' => 'ម៉ោងចេញ', 'type' => 'text', 'placeholder_en' => '12:00'],
            ],
            'restaurant-cafe' => [
                ['key' => 'cuisine', 'label_en' => 'Cuisine', 'label_km' => 'ប្រភេទម្ហូប', 'type' => 'tags', 'placeholder_en' => 'Khmer, Asian, Western'],
                ['key' => 'reservation_phone', 'label_en' => 'Reservation phone', 'label_km' => 'លេខកក់តុ', 'type' => 'text', 'placeholder_en' => '+855...'],
                ['key' => 'qr_menu_url', 'label_en' => 'QR menu URL', 'label_km' => 'តំណ QR Menu', 'type' => 'url', 'placeholder_en' => 'https://...'],
            ],
            'tour-guide' => [
                ['key' => 'languages', 'label_en' => 'Languages', 'label_km' => 'ភាសា', 'type' => 'tags', 'placeholder_en' => 'Khmer, English, French'],
                ['key' => 'license_number', 'label_en' => 'License number', 'label_km' => 'លេខអាជ្ញាបណ្ណ', 'type' => 'text'],
                ['key' => 'coverage_areas', 'label_en' => 'Coverage areas', 'label_km' => 'តំបន់គ្របដណ្តប់', 'type' => 'tags', 'placeholder_en' => 'Siem Reap, Phnom Penh'],
            ],
            'transport' => [
                ['key' => 'vehicle_types', 'label_en' => 'Vehicle types', 'label_km' => 'ប្រភេទយានយន្ត', 'type' => 'tags', 'placeholder_en' => 'Car, Van, Tuk-tuk'],
                ['key' => 'hotline', 'label_en' => 'Hotline', 'label_km' => 'ខ្សែទូរស័ព្ទ', 'type' => 'text'],
            ],
            'crafts-souvenirs' => [
                ['key' => 'wholesale_available', 'label_en' => 'Wholesale available', 'label_km' => 'លក់ដុំ', 'type' => 'boolean'],
                ['key' => 'delivery_options', 'label_en' => 'Delivery options', 'label_km' => 'ការដឹកជញ្ជូន', 'type' => 'tags', 'placeholder_en' => 'Phnom Penh, Nationwide'],
                ['key' => 'origin_story', 'label_en' => 'Origin story', 'label_km' => 'រឿងរ៉ាវដើមកំណើត', 'type' => 'textarea'],
            ],
            'spa-wellness' => [
                ['key' => 'license_number', 'label_en' => 'License number', 'label_km' => 'លេខអាជ្ញាបណ្ណ', 'type' => 'text'],
                ['key' => 'booking_phone', 'label_en' => 'Booking phone', 'label_km' => 'លេខកក់', 'type' => 'text'],
            ],
            'activities' => [
                ['key' => 'schedule', 'label_en' => 'Schedule', 'label_km' => 'កាលវិភាគ', 'type' => 'text', 'placeholder_en' => 'Daily 08:00-17:00'],
            ],
        ];
    }
}
