<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'telegram_chat_id')) {
                $table->string('telegram_chat_id')->nullable()->after('business_id');
            }
            if (!Schema::hasColumn('users', 'notification_preferences')) {
                $table->json('notification_preferences')->nullable()->after('telegram_chat_id');
            }
        });

        Schema::table('biz_categories', function (Blueprint $table) {
            if (!Schema::hasColumn('biz_categories', 'profile_schema')) {
                $table->json('profile_schema')->nullable()->after('icon');
            }
        });

        Schema::table('biz_businesses', function (Blueprint $table) {
            if (!Schema::hasColumn('biz_businesses', 'profile_data')) {
                $table->json('profile_data')->nullable()->after('description_en');
            }
            if (!Schema::hasColumn('biz_businesses', 'trial_started_at')) {
                $table->timestamp('trial_started_at')->nullable()->after('sponsored_province_until');
            }
            if (!Schema::hasColumn('biz_businesses', 'trial_ends_at')) {
                $table->timestamp('trial_ends_at')->nullable()->after('trial_started_at');
            }
        });

        Schema::table('biz_reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('biz_reviews', 'owner_reply')) {
                $table->text('owner_reply')->nullable()->after('rejection_reason');
            }
            if (!Schema::hasColumn('biz_reviews', 'owner_replied_at')) {
                $table->timestamp('owner_replied_at')->nullable()->after('owner_reply');
            }
            if (!Schema::hasColumn('biz_reviews', 'owner_replied_by')) {
                $table->foreignId('owner_replied_by')->nullable()->after('owner_replied_at')
                    ->constrained('users')->nullOnDelete();
            }
        });

        Schema::table('biz_subscriptions', function (Blueprint $table) {
            if (!Schema::hasColumn('biz_subscriptions', 'is_trial')) {
                $table->boolean('is_trial')->default(false)->after('auto_renew');
            }
        });

        $schemas = [
            'accommodation' => [
                ['key' => 'room_types', 'label_en' => 'Room types', 'label_km' => 'ប្រភេទបន្ទប់', 'type' => 'tags', 'placeholder_en' => 'Deluxe, Family, Dorm'],
                ['key' => 'amenities', 'label_en' => 'Amenities', 'label_km' => 'សេវាកម្មបន្ទប់', 'type' => 'tags', 'placeholder_en' => 'Wi-Fi, Pool, Breakfast'],
                ['key' => 'check_in_time', 'label_en' => 'Check-in time', 'label_km' => 'ម៉ោងចូល', 'type' => 'text', 'placeholder_en' => '14:00'],
                ['key' => 'check_out_time', 'label_en' => 'Check-out time', 'label_km' => 'ម៉ោងចេញ', 'type' => 'text', 'placeholder_en' => '12:00'],
            ],
            'restaurant-cafe' => [
                ['key' => 'cuisine', 'label_en' => 'Cuisine', 'label_km' => 'ប្រភេទម្ហូប', 'type' => 'tags', 'placeholder_en' => 'Khmer, Asian, Western'],
                ['key' => 'menu_highlights', 'label_en' => 'Menu highlights', 'label_km' => 'ម្ហូបពិសេស', 'type' => 'tags', 'placeholder_en' => 'Amok, Loc Lac'],
                ['key' => 'reservation_phone', 'label_en' => 'Reservation phone', 'label_km' => 'លេខកក់តុ', 'type' => 'text', 'placeholder_en' => '+855...'],
                ['key' => 'qr_menu_url', 'label_en' => 'QR menu URL', 'label_km' => 'តំណ QR Menu', 'type' => 'url', 'placeholder_en' => 'https://...'],
            ],
            'tour-guide' => [
                ['key' => 'languages', 'label_en' => 'Languages', 'label_km' => 'ភាសា', 'type' => 'tags', 'placeholder_en' => 'Khmer, English, French'],
                ['key' => 'license_number', 'label_en' => 'License number', 'label_km' => 'លេខអាជ្ញាបណ្ណ', 'type' => 'text'],
                ['key' => 'tour_packages', 'label_en' => 'Tour packages', 'label_km' => 'កញ្ចប់ដំណើរ', 'type' => 'tags', 'placeholder_en' => 'Angkor Sunrise, City Tour'],
                ['key' => 'coverage_areas', 'label_en' => 'Coverage areas', 'label_km' => 'តំបន់គ្របដណ្តប់', 'type' => 'tags', 'placeholder_en' => 'Siem Reap, Phnom Penh'],
            ],
            'transport' => [
                ['key' => 'vehicle_types', 'label_en' => 'Vehicle types', 'label_km' => 'ប្រភេទយានយន្ត', 'type' => 'tags', 'placeholder_en' => 'Car, Van, Tuk-tuk'],
                ['key' => 'routes', 'label_en' => 'Routes', 'label_km' => 'ផ្លូវដឹកជញ្ជូន', 'type' => 'tags', 'placeholder_en' => 'Siem Reap - Phnom Penh'],
                ['key' => 'starting_price_usd', 'label_en' => 'Starting price (USD)', 'label_km' => 'តម្លៃចាប់ផ្តើម (USD)', 'type' => 'number'],
                ['key' => 'hotline', 'label_en' => 'Hotline', 'label_km' => 'ខ្សែទូរស័ព្ទ', 'type' => 'text'],
            ],
            'crafts-souvenirs' => [
                ['key' => 'products', 'label_en' => 'Products', 'label_km' => 'ផលិតផល', 'type' => 'tags', 'placeholder_en' => 'Silk, Carving, Pepper'],
                ['key' => 'wholesale_available', 'label_en' => 'Wholesale available', 'label_km' => 'លក់ដុំ', 'type' => 'boolean'],
                ['key' => 'delivery_options', 'label_en' => 'Delivery options', 'label_km' => 'ការដឹកជញ្ជូន', 'type' => 'tags', 'placeholder_en' => 'Phnom Penh, Nationwide'],
                ['key' => 'origin_story', 'label_en' => 'Origin story', 'label_km' => 'រឿងរ៉ាវដើមកំណើត', 'type' => 'textarea'],
            ],
            'spa-wellness' => [
                ['key' => 'services', 'label_en' => 'Services', 'label_km' => 'សេវាកម្ម', 'type' => 'tags', 'placeholder_en' => 'Massage, Facial, Sauna'],
                ['key' => 'price_from_usd', 'label_en' => 'Price from (USD)', 'label_km' => 'តម្លៃចាប់ផ្តើម (USD)', 'type' => 'number'],
                ['key' => 'license_number', 'label_en' => 'License number', 'label_km' => 'លេខអាជ្ញាបណ្ណ', 'type' => 'text'],
                ['key' => 'booking_phone', 'label_en' => 'Booking phone', 'label_km' => 'លេខកក់', 'type' => 'text'],
            ],
            'activities' => [
                ['key' => 'activity_types', 'label_en' => 'Activity types', 'label_km' => 'ប្រភេទសកម្មភាព', 'type' => 'tags', 'placeholder_en' => 'Kayaking, Cycling, Cooking'],
                ['key' => 'duration', 'label_en' => 'Duration', 'label_km' => 'រយៈពេល', 'type' => 'text', 'placeholder_en' => '2 hours'],
                ['key' => 'ticket_price_usd', 'label_en' => 'Ticket price (USD)', 'label_km' => 'តម្លៃសំបុត្រ (USD)', 'type' => 'number'],
                ['key' => 'schedule', 'label_en' => 'Schedule', 'label_km' => 'កាលវិភាគ', 'type' => 'text', 'placeholder_en' => 'Daily 08:00-17:00'],
            ],
        ];

        foreach ($schemas as $slug => $schema) {
            DB::table('biz_categories')
                ->where('slug', $slug)
                ->update(['profile_schema' => json_encode($schema, JSON_UNESCAPED_UNICODE)]);
        }

        $trialPlanId = DB::table('biz_plans')->where('code', 'featured')->value('id');
        if ($trialPlanId) {
            DB::table('biz_subscriptions')->whereNull('is_trial')->update(['is_trial' => false]);
        }
    }

    public function down(): void
    {
        Schema::table('biz_subscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('biz_subscriptions', 'is_trial')) {
                $table->dropColumn('is_trial');
            }
        });

        Schema::table('biz_reviews', function (Blueprint $table) {
            if (Schema::hasColumn('biz_reviews', 'owner_replied_by')) {
                $table->dropConstrainedForeignId('owner_replied_by');
            }
            $table->dropColumn(['owner_reply', 'owner_replied_at']);
        });

        Schema::table('biz_businesses', function (Blueprint $table) {
            $table->dropColumn(['profile_data', 'trial_started_at', 'trial_ends_at']);
        });

        Schema::table('biz_categories', function (Blueprint $table) {
            $table->dropColumn('profile_schema');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telegram_chat_id', 'notification_preferences']);
        });
    }
};
