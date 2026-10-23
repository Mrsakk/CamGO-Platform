<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('biz_categories', function (Blueprint $table) {
            if (! Schema::hasColumn('biz_categories', 'service_presets')) {
                $table->json('service_presets')->nullable()->after('profile_schema');
            }
        });

        Schema::create('biz_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('biz_businesses')->cascadeOnDelete();
            $table->string('name_km');
            $table->string('name_en');
            $table->text('description_km')->nullable();
            $table->text('description_en')->nullable();
            $table->decimal('price_usd', 10, 2)->nullable();
            $table->unsignedSmallInteger('duration_minutes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['business_id', 'is_active', 'sort_order']);
        });

        $presets = $this->presets();
        $removedFields = $this->removedFields();

        $categories = DB::table('biz_categories')->get();
        foreach ($categories as $category) {
            $schema = json_decode($category->profile_schema ?? '[]', true) ?: [];
            $keysToRemove = $removedFields[$category->slug] ?? [];

            if (! empty($keysToRemove)) {
                $schema = array_values(array_filter(
                    $schema,
                    fn (array $field) => ! in_array($field['key'] ?? null, $keysToRemove, true)
                ));
            }

            $update = [];

            if (isset($presets[$category->slug])) {
                $update['service_presets'] = json_encode($presets[$category->slug], JSON_UNESCAPED_UNICODE);
            }

            if (! empty($keysToRemove)) {
                $update['profile_schema'] = json_encode($schema, JSON_UNESCAPED_UNICODE);
            }

            if (! empty($update)) {
                DB::table('biz_categories')->where('id', $category->id)->update($update);
            }
        }

        $categorySlugs = DB::table('biz_categories')->pluck('slug', 'id');
        $serviceKeys = $this->legacyServiceKeys();
        $businesses = DB::table('biz_businesses')
            ->select('id', 'category_id', 'profile_data')
            ->orderBy('id')
            ->get();

        foreach ($businesses as $business) {
            $slug = $categorySlugs[$business->category_id] ?? null;
            $key = $slug ? ($serviceKeys[$slug] ?? null) : null;

            if (! $key) {
                continue;
            }

            $profile = json_decode($business->profile_data ?? '[]', true) ?: [];
            $values = $profile[$key] ?? [];

            if (is_string($values)) {
                $values = preg_split('/\s*,\s*/', $values) ?: [];
            }

            if (! is_array($values)) {
                continue;
            }

            $names = array_values(array_filter(array_map(
                fn ($value) => is_scalar($value) ? trim((string) $value) : '',
                $values
            )));

            foreach ($names as $index => $name) {
                if ($name === '') {
                    continue;
                }

                DB::table('biz_services')->insert([
                    'business_id' => $business->id,
                    'name_km' => $name,
                    'name_en' => $name,
                    'is_active' => true,
                    'sort_order' => $index + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('biz_services');

        Schema::table('biz_categories', function (Blueprint $table) {
            if (Schema::hasColumn('biz_categories', 'service_presets')) {
                $table->dropColumn('service_presets');
            }
        });

        $legacyFields = $this->legacyFields();

        foreach (DB::table('biz_categories')->get() as $category) {
            $fields = $legacyFields[$category->slug] ?? [];
            if (empty($fields)) {
                continue;
            }

            $schema = json_decode($category->profile_schema ?? '[]', true) ?: [];
            $existingKeys = array_column($schema, 'key');
            $missing = array_values(array_filter(
                $fields,
                fn (array $field) => ! in_array($field['key'] ?? null, $existingKeys, true)
            ));

            if (empty($missing)) {
                continue;
            }

            DB::table('biz_categories')->where('id', $category->id)->update([
                'profile_schema' => json_encode(array_merge($missing, $schema), JSON_UNESCAPED_UNICODE),
            ]);
        }
    }

    private function presets(): array
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

    private function legacyServiceKeys(): array
    {
        return [
            'accommodation' => 'room_types',
            'restaurant-cafe' => 'menu_highlights',
            'tour-guide' => 'tour_packages',
            'transport' => 'routes',
            'crafts-souvenirs' => 'products',
            'spa-wellness' => 'services',
            'activities' => 'activity_types',
        ];
    }

    private function removedFields(): array
    {
        return [
            'accommodation' => ['room_types'],
            'restaurant-cafe' => ['menu_highlights'],
            'tour-guide' => ['tour_packages'],
            'transport' => ['routes', 'starting_price_usd'],
            'crafts-souvenirs' => ['products'],
            'spa-wellness' => ['services', 'price_from_usd'],
            'activities' => ['activity_types', 'duration', 'ticket_price_usd'],
        ];
    }

    private function legacyFields(): array
    {
        return [
            'accommodation' => [
                ['key' => 'room_types', 'label_en' => 'Room types', 'label_km' => 'ប្រភេទបន្ទប់', 'type' => 'tags', 'placeholder_en' => 'Deluxe, Family, Dorm'],
            ],
            'restaurant-cafe' => [
                ['key' => 'menu_highlights', 'label_en' => 'Menu highlights', 'label_km' => 'ម្ហូបពិសេស', 'type' => 'tags', 'placeholder_en' => 'Amok, Loc Lac'],
            ],
            'tour-guide' => [
                ['key' => 'tour_packages', 'label_en' => 'Tour packages', 'label_km' => 'កញ្ចប់ដំណើរ', 'type' => 'tags', 'placeholder_en' => 'Angkor Sunrise, City Tour'],
            ],
            'transport' => [
                ['key' => 'routes', 'label_en' => 'Routes', 'label_km' => 'ផ្លូវដឹកជញ្ជូន', 'type' => 'tags', 'placeholder_en' => 'Siem Reap - Phnom Penh'],
                ['key' => 'starting_price_usd', 'label_en' => 'Starting price (USD)', 'label_km' => 'តម្លៃចាប់ផ្តើម (USD)', 'type' => 'number'],
            ],
            'crafts-souvenirs' => [
                ['key' => 'products', 'label_en' => 'Products', 'label_km' => 'ផលិតផល', 'type' => 'tags', 'placeholder_en' => 'Silk, Carving, Pepper'],
            ],
            'spa-wellness' => [
                ['key' => 'services', 'label_en' => 'Services', 'label_km' => 'សេវាកម្ម', 'type' => 'tags', 'placeholder_en' => 'Massage, Facial, Sauna'],
                ['key' => 'price_from_usd', 'label_en' => 'Price from (USD)', 'label_km' => 'តម្លៃចាប់ផ្តើម (USD)', 'type' => 'number'],
            ],
            'activities' => [
                ['key' => 'activity_types', 'label_en' => 'Activity types', 'label_km' => 'ប្រភេទសកម្មភាព', 'type' => 'tags', 'placeholder_en' => 'Kayaking, Cycling, Cooking'],
                ['key' => 'duration', 'label_en' => 'Duration', 'label_km' => 'រយៈពេល', 'type' => 'text', 'placeholder_en' => '2 hours'],
                ['key' => 'ticket_price_usd', 'label_en' => 'Ticket price (USD)', 'label_km' => 'តម្លៃសំបុត្រ (USD)', 'type' => 'number'],
            ],
        ];
    }
};
