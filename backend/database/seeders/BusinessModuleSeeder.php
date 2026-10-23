<?php

namespace Database\Seeders;

use App\Models\Destination;
use App\Models\Province;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessClosure;
use App\Modules\Business\Models\BusinessContactEvent;
use App\Modules\Business\Models\BusinessDocument;
use App\Modules\Business\Models\BusinessHour;
use App\Modules\Business\Models\BusinessMedia;
use App\Modules\Business\Models\BusinessMember;
use App\Modules\Business\Models\BusinessReview;
use App\Modules\Business\Models\Category;
use App\Modules\Business\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BusinessModuleSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@khemaramorodok.com')->first();
        $adminId = $admin ? $admin->id : 1;

        // 1. Seed Categories
        $categoriesData = [
            [
                'slug' => 'accommodation',
                'name_en' => 'Accommodation',
                'name_km' => 'កន្លែងស្នាក់នៅ',
                'icon' => 'Hotel',
                'sort_order' => 1,
            ],
            [
                'slug' => 'restaurant-cafe',
                'name_en' => 'Restaurant and Cafe',
                'name_km' => 'ភោជនីយដ្ឋាន និង ហាងកាហ្វេ',
                'icon' => 'UtensilsCrossed',
                'sort_order' => 2,
            ],
            [
                'slug' => 'tour-guide',
                'name_en' => 'Tour Guide',
                'name_km' => 'មគ្គុទ្ទេសក៍ទេសចរណ៍',
                'icon' => 'Compass',
                'sort_order' => 3,
            ],
            [
                'slug' => 'transport',
                'name_en' => 'Transport',
                'name_km' => 'សេវាកម្មដឹកជញ្ជូន',
                'icon' => 'Bus',
                'sort_order' => 4,
            ],
            [
                'slug' => 'crafts-souvenirs',
                'name_en' => 'Crafts and Souvenirs',
                'name_km' => 'វត្ថុអនុស្សាវរីយ៍ និង សិប្បកម្ម',
                'icon' => 'Gift',
                'sort_order' => 5,
            ],
            [
                'slug' => 'spa-wellness',
                'name_en' => 'Spa and Wellness',
                'name_km' => 'ស្ប៉ា និង សុខភាព',
                'icon' => 'Sparkles',
                'sort_order' => 6,
            ],
            [
                'slug' => 'activities',
                'name_en' => 'Activities',
                'name_km' => 'សកម្មភាពកម្សាន្ត',
                'icon' => 'Ticket',
                'sort_order' => 7,
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['slug']] = Category::updateOrCreate(
                ['slug' => $cat['slug']],
                $cat
            );
        }

        // Get key provinces
        $provinces = Province::all()->keyBy('slug');
        if ($provinces->isEmpty()) {
            $this->command?->warn('Provinces table is empty. Running ProvinceSeeder...');
            $this->call(ProvinceSeeder::class);
            $provinces = Province::all()->keyBy('slug');
        }

        $siemReap = $provinces['siem-reap'] ?? $provinces->first();
        $phnomPenh = $provinces['phnom-penh'] ?? $provinces->first();
        $kampot = $provinces['kampot'] ?? $provinces->first();
        $battambang = $provinces['battambang'] ?? $provinces->first();
        $sihanoukville = $provinces['preah-sihanouk'] ?? $provinces->first();
        $kep = $provinces['kep'] ?? $provinces->first();

        // 30 Businesses Dataset
        $businessesData = [
            // Siem Reap
            [
                'slug' => 'angkor-heritage-retreat',
                'category_slug' => 'accommodation',
                'province' => $siemReap,
                'name_en' => 'Angkor Heritage Boutique Retreat',
                'name_km' => 'រីសតប៊ូទិក បេតិកភណ្ឌអង្គរ',
                'tagline_en' => 'Eco-luxury villas enveloped by ancient tropical gardens',
                'tagline_km' => 'វីឡាប្រណីតបែបធម្មជាតិ ព័ទ្ធជុំវិញដោយសួនត្រូពិកបុរាណ',
                'description_en' => 'Located just 10 minutes from Angkor Wat, Angkor Heritage Boutique Retreat features sustainable wooden architecture, salt-water lotus pool, and Khmer traditional hospitality.',
                'description_km' => 'ស្ថិតនៅត្រឹមតែ ១០ នាទីពីប្រាសាទអង្គរវត្ត រីសតប៊ូទិកបេតិកភណ្ឌអង្គរ រចនាឡើងដោយឈើប្រណីតបែបធម្មជាតិ អាងហែលទឹកផ្កាឈូកទឹកប្រៃ និងបដិសណ្ឋារកិច្ចបែបខ្មែរបុរាណ។',
                'address_en' => 'Street 27, Wat Bo Village, Siem Reap',
                'address_km' => 'ផ្លូវលេខ ២៧ ភូមិវត្តបូព៌ ក្រុងសៀមរាប',
                'lat' => 13.3582,
                'lng' => 103.8643,
                'price_level' => 3,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Lok Chumteav Kimleng',
                'owner_phone' => '+855 12 000 101',
                'internal_notes' => 'VIP partner in Siem Reap. Official tourism license verified 2026.',
                'image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'malis-angkor-restaurant',
                'category_slug' => 'restaurant-cafe',
                'province' => $siemReap,
                'name_en' => 'Malis Siem Reap Living Khmer Cuisine',
                'name_km' => 'ភោជនីយដ្ឋាន ម្លិះ សៀមរាប',
                'tagline_en' => 'Masterful Cambodian gastronomy revitalizing forgotten court recipes',
                'tagline_km' => 'រសជាតិអាហារខ្មែររាជវាំងដ៏ពិសិដ្ឋ និងប្រកបដោយភាពច្នៃប្រឌិតខ្ពស់',
                'description_en' => 'Renowned for celebrating genuine Cambodian culinary arts, Malis serves fresh local river fish amok, Kampot pepper crab, and organic herbal infusions beside a tranquil water lily pond.',
                'description_km' => 'ល្បីល្បាញខាងលើកស្ទួយម្ហូបខ្មែរពិតប្រាកដ ម្លិះផ្ដល់ជូនអាមុកត្រីទឹកសាបស្រស់ៗ ក្តាមឆាម្រេចកំពត និងភេសជ្ជៈរុក្ខជាតិធម្មជាតិក្បែរស្រះផ្កាឈូក។',
                'address_en' => 'Pokambor Avenue, Riverside, Siem Reap',
                'address_km' => 'មហាវិថីពោធិកំបោរ មាត់ស្ទឹងសៀមរាប',
                'lat' => 13.3524,
                'lng' => 103.8549,
                'price_level' => 3,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Chef Luu Meng',
                'owner_phone' => '+855 12 000 102',
                'internal_notes' => 'Celebrity master chef restaurant; top priority partner.',
                'image' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'angkor-cycling-adventures',
                'category_slug' => 'activities',
                'province' => $siemReap,
                'name_en' => 'Angkor Cycling & Jungle Expeditions',
                'name_km' => 'ដំណើរផ្សងព្រេងជិះកង់ព្រៃអង្គរ',
                'tagline_en' => 'Off-the-beaten-track bicycle tours through ancient temple tracks',
                'tagline_km' => 'ដំណើរកម្សាន្តជិះកង់តាមផ្លូវលំធម្មជាតិកាត់ប្រាសាទបុរាណក្នុងព្រៃ',
                'description_en' => 'Small-group eco-friendly guided cycling experiences exploring hidden trails behind Preah Khan, Ta Prohm, and rural farming hamlets.',
                'description_km' => 'ដំណើរកម្សាន្តជាក្រុមតូចៗដែលមិនប៉ះពាល់ដល់បរិស្ថាន ស្វែងយល់ពីផ្លូវលំសម្ងាត់នៅខាងក្រោយប្រាសាទព្រះខ័ន ប្រាសាទតាព្រហ្ម និងភូមិស្រុកជនបទ។',
                'address_en' => 'Sivutha Blvd, Old Market Area, Siem Reap',
                'address_km' => 'មហាវិថីស៊ីវត្ថា តំបន់ផ្សារចាស់ ក្រុងសៀមរាប',
                'lat' => 13.3548,
                'lng' => 103.8552,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Vannak Dara',
                'owner_phone' => '+855 12 000 103',
                'internal_notes' => 'Licensed community tour operator.',
                'image' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'artisans-d-angkor-crafts',
                'category_slug' => 'crafts-souvenirs',
                'province' => $siemReap,
                'name_en' => 'Artisans Angkor Silk & Stone Carving',
                'name_km' => 'សិប្បកម្មអង្គរ ចម្លាក់ថ្ម និងសូត្រខ្មែរ',
                'tagline_en' => 'Authentic handmade silk, lacquerware, and stone sculpture workshops',
                'tagline_km' => 'សិប្បកម្មកែច្នៃដោយដៃពិតប្រាកដ រួមមានសូត្រ គំនូរម្រ័ក្សណ៍ និងចម្លាក់ថ្ម',
                'description_en' => 'Preserving classical Khmer craftsmanship while providing fair employment for hundreds of rural artisans. Watch live sculpting demonstrations and purchase certified crafts.',
                'description_km' => 'អភិរក្សស្នាដៃសិប្បកម្មខ្មែរបុរាណ ព្រមទាំងផ្តល់ការងារប្រកបដោយសមធម៌ដល់សិប្បករជនបទរាប់រយនាក់។ ទស្សនាការឆ្លាក់ផ្ទាល់ និងជាវវត្ថុអនុស្សាវរីយ៍ដែលមានការបញ្ជាក់គុណភាព។',
                'address_en' => 'Stung Thmey Street, Siem Reap',
                'address_km' => 'ផ្លូវស្ទឹងថ្មី ក្រុងសៀមរាប',
                'lat' => 13.3512,
                'lng' => 103.8525,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Pierre / Sovann',
                'owner_phone' => '+855 12 000 104',
                'internal_notes' => 'Social enterprise with certified craft workshop.',
                'image' => 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'bodia-spa-siem-reap',
                'category_slug' => 'spa-wellness',
                'province' => $siemReap,
                'name_en' => 'Bodia Cambodian Herbal Sanctuary',
                'name_km' => 'បូឌា ស្ប៉ារុក្ខជាតិខ្មែរ សៀមរាប',
                'tagline_en' => 'Holistic sensory spa therapies utilizing 100% natural Cambodian herbs',
                'tagline_km' => 'ការព្យាបាលសម្រាកកាយបែបបុរាណ ដោយប្រើប្រាស់ឱសថរុក្ខជាតិធម្មជាតិខ្មែរ ១០០%',
                'description_en' => 'A cocoon of warmth and tranquility. Traditional Khmer body compresses, jasmine flower scrubs, and essential oil aromatherapy after temple explorations.',
                'description_km' => 'កន្លែងសម្រាកកាយដ៏ស្ងប់ស្ងាត់។ ស្អំខ្លួនបែបបុរាណខ្មែរ ខាត់ស្បែកដោយផ្កាម្លិះ និងប្រេងក្រអូបធម្មជាតិ បន្ទាប់ពីដើរកម្សាន្តតាមប្រាសាទ។',
                'address_en' => 'Above U-Care Pharmacy, Old Market, Siem Reap',
                'address_km' => 'ខាងលើឱសថស្ថាន យូឃែរ ផ្សារចាស់ ក្រុងសៀមរាប',
                'lat' => 13.3536,
                'lng' => 103.8559,
                'price_level' => 3,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Rasmey Chhay',
                'owner_phone' => '+855 12 000 105',
                'internal_notes' => 'Award-winning spa brand.',
                'image' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
            ],

            // Phnom Penh
            [
                'slug' => 'riverside-heritage-palace',
                'category_slug' => 'accommodation',
                'province' => $phnomPenh,
                'name_en' => 'The Plantation Urban Resort & Spa',
                'name_km' => 'ផ្លេនថេសិន អឺបានរីសត រាជធានីភ្នំពេញ',
                'tagline_en' => 'Colonial heritage sanctuary nestled behind the Royal Palace',
                'tagline_km' => 'រីសតលំហែកាយបែបបេតិកភណ្ឌបារាំង-ខ្មែរ នៅក្បែរព្រះបរមរាជវាំង',
                'description_en' => 'Featuring two tranquil swimming pools, lush palm courtyards, and elegant heritage architecture in the diplomatic quarter of Phnom Penh.',
                'description_km' => 'មានអាងហែលទឹកធំទូលាយពីរកន្លែង សួនដើមត្នោត និងស្ថាបត្យកម្មបេតិកភណ្ឌប្រណីត ស្ថិតនៅចំកណ្តាលរាជធានីភ្នំពេញ។',
                'address_en' => 'Street 184, Daun Penh, Phnom Penh',
                'address_km' => 'ផ្លូវលេខ ១៨៤ សង្កាត់ជ័យជំនះ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ',
                'lat' => 11.5641,
                'lng' => 104.9298,
                'price_level' => 3,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Oknha Meng',
                'owner_phone' => '+855 12 000 106',
                'internal_notes' => 'Premium hotel partner.',
                'image' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'kravanh-khmer-kitchen',
                'category_slug' => 'restaurant-cafe',
                'province' => $phnomPenh,
                'name_en' => 'Kravanh Fine Khmer Dining',
                'name_km' => 'ភោជនីយដ្ឋាន ក្រវាញ ភ្នំពេញ',
                'tagline_en' => 'Aristocratic homestyle Khmer dishes prepared with organic ingredients',
                'tagline_km' => 'ម្ហូបខ្មែរប្រណីតរសជាតិដើម ចម្អិនពីគ្រឿងផ្សំសរីរាង្គធម្មជាតិសុទ្ធសាធ',
                'description_en' => 'Acclaimed for its authentic cardamom and lemongrass curries, river prawn soup, and warm hospitality in an atmospheric French villa.',
                'description_km' => 'ល្បីល្បាញដោយសារការីក្រវាញ សម្លម្ជូរគ្រឿងបង្គាទន្លេ និងការបម្រើប្រកបដោយភាពកក់ក្តៅក្នុងវីឡាបារាំងបុរាណ។',
                'address_en' => 'Street 134, Boeung Keng Kang 1, Phnom Penh',
                'address_km' => 'ផ្លូវលេខ ១៣៤ បឹងកេងកង១ ខណ្ឌចំការមន រាជធានីភ្នំពេញ',
                'lat' => 11.5518,
                'lng' => 104.9271,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Thida Seng',
                'owner_phone' => '+855 12 000 107',
                'internal_notes' => 'Regularly featured in culinary guides.',
                'image' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'mekong-river-cruise-tours',
                'category_slug' => 'activities',
                'province' => $phnomPenh,
                'name_en' => 'Mekong Sunset River Cruises',
                'name_km' => 'ទូកទេសចរណ៍ទស្សនាថ្ងៃលិចទន្លេមេគង្គ',
                'tagline_en' => 'Romantic sunset sails along the junction of the Four Rivers (Chaktomuk)',
                'tagline_km' => 'ដំណើរកម្សាន្តតាមទូកទស្សនាថ្ងៃលិចនៅចំណុចប្រសព្វទន្លេបួនមុខដ៏ស្រស់ត្រកាល',
                'description_en' => 'Enjoy panoramic views of the Royal Palace illuminated against the evening sky while savoring fresh tropical drinks and seasonal Cambodian hors d\'oeuvres.',
                'description_km' => 'រីករាយជាមួយទិដ្ឋភាពថ្ងៃលិចនៃព្រះបរមរាជវាំង ភ្លក្សភេសជ្ជៈផ្លែឈើស្រស់ និងអាហារសម្រន់បែបខ្មែរលើទូកកម្សាន្ត។',
                'address_en' => 'Sisowath Quay, Passenger Port, Phnom Penh',
                'address_km' => 'កំពង់ផែអ្នកដំណើរ វិថីព្រះស៊ីសុវត្ថិ រាជធានីភ្នំពេញ',
                'lat' => 11.5721,
                'lng' => 104.9312,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Chantha Srun',
                'owner_phone' => '+855 12 000 108',
                'internal_notes' => 'Cruises insured and inspected annually.',
                'image' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'larryta-express-transport',
                'category_slug' => 'transport',
                'province' => $phnomPenh,
                'name_en' => 'Larryta Luxury VIP Express',
                'name_km' => 'ឡារីតា អិចស្ព្រេស សេវាឡានវីអាយភី',
                'tagline_en' => 'Safe, comfortable, and punctual VIP limousine vans across Cambodia',
                'tagline_km' => 'សេវារថយន្ត VIP ប្រណីត មានសុវត្ថិភាព ផាសុកភាព និងទាន់ពេលវេលា',
                'description_en' => 'Connecting Phnom Penh to Siem Reap, Sihanoukville, Battambang and Kampot with Wi-Fi equipped, reclining executive seats.',
                'description_km' => 'ភ្ជាប់ការធ្វើដំណើរពីរាជធានីភ្នំពេញ ទៅកាន់សៀមរាប ព្រះសីហនុ បាត់ដំបង និងកំពត ដោយមានវ៉ាយហ្វាយ និងកៅអីពូកគេងទំនើប។',
                'address_en' => 'Russian Federation Blvd, Phnom Penh',
                'address_km' => 'មហាវិថីសហព័ន្ធរុស្ស៊ី រាជធានីភ្នំពេញ',
                'lat' => 11.5678,
                'lng' => 104.8992,
                'price_level' => 1,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Taing Eang',
                'owner_phone' => '+855 12 000 109',
                'internal_notes' => 'Major intercity van transport provider.',
                'image' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'khmer-guide-association-phnom-penh',
                'category_slug' => 'tour-guide',
                'province' => $phnomPenh,
                'name_en' => 'Phnom Penh Heritage Tour Guides',
                'name_km' => 'មគ្គុទ្ទេសក៍ទេសចរណ៍ប្រវត្តិសាស្ត្រភ្នំពេញ',
                'tagline_en' => 'Certified official bilingual guides for museum and historical walks',
                'tagline_km' => 'មគ្គុទ្ទេសក៍ទេសចរណ៍ផ្លូវការ មានវិញ្ញាបនបត្រត្រឹមត្រូវ សម្រាប់ដំណើរស្វែងយល់ប្រវត្តិសាស្ត្រ',
                'description_en' => 'Offering in-depth educational walks through the National Museum, Tuol Sleng, Choeung Ek, and the vibrant Central Market.',
                'description_km' => 'ផ្តល់ជូនដំណើរកម្សាន្តស្វែងយល់ស៊ីជម្រៅនៅសារមន្ទីរជាតិ គុកទួលស្លែង ជើងឯក និងផ្សារធំថ្មី។',
                'address_en' => 'Preah Ang Eng St (13), Daun Penh, Phnom Penh',
                'address_km' => 'ផ្លូវព្រះអង្គអេង (១៣) សង្កាត់ជ័យជំនះ រាជធានីភ្នំពេញ',
                'lat' => 11.5661,
                'lng' => 104.9287,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Samnang Pich',
                'owner_phone' => '+855 12 000 110',
                'internal_notes' => 'Ministry of Tourism licensed guide team.',
                'image' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
            ],

            // Kampot
            [
                'slug' => 'la-plantation-pepper-farm',
                'category_slug' => 'activities',
                'province' => $kampot,
                'name_en' => 'La Plantation Organic Pepper Sanctuary',
                'name_km' => 'ចម្ការម្រេចកំពតធម្មជាតិ ឡា ផ្លេនថេសិន',
                'tagline_en' => 'Award-winning certified organic Kampot pepper plantation and tasting tour',
                'tagline_km' => 'ចម្ការម្រេចកំពតសរីរាង្គកម្រិតពិភពលោក និងដំណើរកម្សាន្តភ្លក្សរសជាតិម្រេច',
                'description_en' => 'Set against the picturesque backdrop of Damrei Mountains, offering free guided discovery tours on the history and cultivation of GI Kampot pepper.',
                'description_km' => 'ស្ថិតនៅក្បែរជួរភ្នំដំរី ផ្តល់ជូនដំណើរកម្សាន្តទស្សនកិច្ចឥតគិតថ្លៃ អំពីប្រវត្តិ និងការដាំដុះម្រេចកំពតសម្គាល់ភូមិសាស្ត្រ។',
                'address_en' => 'Bosjhang Village, Kampot Province',
                'address_km' => 'ភូមិបុះញ៉ាំង ឃុំកូនសត្វ ស្រុកទឹកឈូ ខេត្តកំពត',
                'lat' => 10.6892,
                'lng' => 104.2847,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Nathalie & Guy',
                'owner_phone' => '+855 12 000 111',
                'internal_notes' => 'Certified GI Kampot Pepper Producer #KP-014.',
                'image' => 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'green-cathedral-kayak-tours',
                'category_slug' => 'activities',
                'province' => $kampot,
                'name_en' => 'Green Cathedral Kampot River Kayaking',
                'name_km' => 'កាយ៉ាក់ទស្សនាព្រែកកំពត និងព្រៃកោងកាង',
                'tagline_en' => 'Paddle through magical mangrove canopies and firefly rivers',
                'tagline_km' => 'អុំទូកកាយ៉ាក់កាត់ព្រៃកោងកាងដ៏ស្រស់បំព្រង និងមើលសត្វអំពិលអំពែក',
                'description_en' => 'Navigate peaceful natural loops surrounded by towering palm fronds, gentle breezes, and spectacular sunsets over Bokor Mountain.',
                'description_km' => 'អុំទូកកម្សាន្តតាមព្រែកធម្មជាតិព័ទ្ធជុំវិញដោយដើមចាក ខ្យល់អាកាសបរិសុទ្ធ និងទិដ្ឋភាពថ្ងៃលិចពីក្រោយភ្នំបូកគោ។',
                'address_en' => 'Tuek Chhou Road, Kampot Riverside',
                'address_km' => 'ផ្លូវទឹកឈូ មាត់ព្រែកកំពត ខេត្តកំពត',
                'lat' => 10.6315,
                'lng' => 104.1683,
                'price_level' => 1,
                'status' => 'approved',
                'is_verified' => false,
                'owner_name' => 'Chhaya Bun',
                'owner_phone' => '+855 12 000 112',
                'internal_notes' => 'Local youth cooperative.',
                'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'bokor-mountain-eco-lodge',
                'category_slug' => 'accommodation',
                'province' => $kampot,
                'name_en' => 'Bokor View Riverside Eco Resort',
                'name_km' => 'រីសតធម្មជាតិ ទេសភាពភ្នំបូកគោ កំពត',
                'tagline_en' => 'Tranquil riverside wooden chalets overlooking limestone cliffs',
                'tagline_km' => 'ផ្ទះឈើលំហែកាយមាត់ទឹក គយគន់ទេសភាពជួរភ្នំថ្មក្រានីតដ៏ស្រស់ស្អាត',
                'description_en' => 'Wake up to the sounds of tropical songbirds, enjoy riverside breakfast, and soak in private outdoor river tubs.',
                'description_km' => 'ភ្ញាក់ឡើងជាមួយសំឡេងបក្សីយំ ស្រូបយកខ្យល់អាកាសបរិសុទ្ធមាត់ទឹក និងងូតទឹកក្នុងអាងក្រៅផ្ទះដ៏រ៉ូមែនទិក។',
                'address_en' => 'Andoung Khmer, Kampot',
                'address_km' => 'សង្កាត់អណ្តូងខ្មែរ ក្រុងកំពត ខេត្តកំពត',
                'lat' => 10.6124,
                'lng' => 104.1756,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Somaly Mom',
                'owner_phone' => '+855 12 000 113',
                'internal_notes' => 'Clean verified eco-lodge.',
                'image' => 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'kampot-pepper-crab-house',
                'category_slug' => 'restaurant-cafe',
                'province' => $kampot,
                'name_en' => 'Old Bridge Kampot Pepper Crab House',
                'name_km' => 'ហាងក្តាមឆាម្រេចកំពត ស្ពានចាស់',
                'tagline_en' => 'Crisp fresh crabs wok-tossed with freshly plucked green Kampot peppercorns',
                'tagline_km' => 'ក្តាមសមុទ្រស្រស់ៗ ឆាជាមួយម្រេចខ្ចីកំពតស្រស់ៗពីចម្ការ ឈ្ងុយឆ្ងាញ់ជក់ចិត្ត',
                'description_en' => 'A favorite among foodies, this riverside restaurant serves sea crabs purchased every sunrise directly from local fishing boats.',
                'description_km' => 'ហាងអាហារមាត់ព្រែកដែលទិញក្តាមស្រស់ៗរៀងរាល់ព្រឹកពីទូកនេសាទប្រជាពលរដ្ឋក្នុងតំបន់។',
                'address_en' => 'Riverside Road, Near Entanou Bridge, Kampot',
                'address_km' => 'ផ្លូវមាត់ព្រែក ក្បែរស្ពានឥន្ទធនូ (ស្ពានចាស់) ក្រុងកំពត',
                'lat' => 10.6062,
                'lng' => 104.1798,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Uncle Heng',
                'owner_phone' => '+855 12 000 114',
                'internal_notes' => 'Iconic Kampot seafood dining.',
                'image' => 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80',
            ],

            // Battambang
            [
                'slug' => 'bambootrain-tours-battambang',
                'category_slug' => 'activities',
                'province' => $battambang,
                'name_en' => 'Original Bamboo Train (Norry) Experience',
                'name_km' => 'ដំណើរជិះឡូរីបាត់ដំបង (រទេះភ្លើងឫស្សី)',
                'tagline_en' => 'Cambodia\'s famous unique handmade railway thrill through the countryside',
                'tagline_km' => 'បទពិសោធន៍ជិះរទេះភ្លើងឫស្សីដ៏ល្បីល្បាញកាត់វាលស្រែខេត្តបាត់ដំបង',
                'description_en' => 'Feel the breeze on your face on a motorized bamboo platform cruising historic tracks between Banan and Odambang.',
                'description_km' => 'ទទួលយកភាពរំភើប និងខ្យល់អាកាសវាលស្រែនៅលើបន្ទះឫស្សីដែលមានម៉ូទ័រ បើកកាត់តាមផ្លូវរថភ្លើងប្រវត្តិសាស្ត្រ។',
                'address_en' => 'Wat Odambang, Sangke District, Battambang',
                'address_km' => 'ភូមិអូដំបង ស្រុកសង្កែ ខេត្តបាត់ដំបង',
                'lat' => 13.0645,
                'lng' => 103.2312,
                'price_level' => 1,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Koy Sarun',
                'owner_phone' => '+855 12 000 115',
                'internal_notes' => 'Local tourism association managed.',
                'image' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'battambang-heritage-bicycle-tours',
                'category_slug' => 'tour-guide',
                'province' => $battambang,
                'name_en' => 'Sombath Battambang Countryside Bike Tours',
                'name_km' => 'ដំណើរកម្សាន្តកង់ជនបទ សម្បត្តិ បាត់ដំបង',
                'tagline_en' => 'Interactive tours visiting rice paper makers, banana chips, and ancient houses',
                'tagline_km' => 'ដំណើរកម្សាន្តជិះកង់មើលការធ្វើនំបញ្ចុក នំប៉ោងចេក និងទស្សនាផ្ទះបុរាណវត្តគរ',
                'description_en' => 'Pedal through quiet sugar palm groves, learn how locals make traditional rice wine and sticky bamboo rice (Kralan).',
                'description_km' => 'ជិះកង់កាត់តាមចម្ការត្នោត ស្វែងយល់ពីរបៀបដែលអ្នកភូមិផលិតស្រាអង្ករ និងដុតក្រឡានបែបប្រពៃណី។',
                'address_en' => 'Wat Kor Village, Battambang City',
                'address_km' => 'ភូមិវត្តគរ ក្រុងបាត់ដំបង ខេត្តបាត់ដំបង',
                'lat' => 13.0782,
                'lng' => 103.1954,
                'price_level' => 1,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Sombath Chea',
                'owner_phone' => '+855 12 000 116',
                'internal_notes' => 'High reputation on community tourism.',
                'image' => 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'maisondes-manguiers-battambang',
                'category_slug' => 'accommodation',
                'province' => $battambang,
                'name_en' => 'Maison des Manguiers Riverside Guesthouse',
                'name_km' => 'ផ្ទះសំណាក់មាត់ស្ទឹង ចម្ការស្វាយ បាត់ដំបង',
                'tagline_en' => 'Charming restored wooden Khmer home immersed in mango orchards',
                'tagline_km' => 'ផ្ទះឈើបុរាណខ្មែរដ៏កក់ក្តៅ កណ្តាលចម្ការស្វាយមាត់ស្ទឹងសង្កែ',
                'description_en' => 'Unplug and unwind in traditional stilted bungalows surrounded by organic fruit orchards and tropical bird calls.',
                'description_km' => 'សម្រាកកាយយ៉ាងស្ងប់ចិត្តក្នុងផ្ទះឈើខ្ពស់ផុតពីដី ព័ទ្ធជុំវិញដោយចម្ការផ្លែឈើធម្មជាតិ និងខ្យល់បរិសុទ្ធ។',
                'address_en' => 'Street 1, Sangke Riverbank, Battambang',
                'address_km' => 'ផ្លូវលេខ ១ មាត់ស្ទឹងសង្កែ ក្រុងបាត់ដំបង',
                'lat' => 13.0892,
                'lng' => 103.2014,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Lokru Chhoeun',
                'owner_phone' => '+855 12 000 117',
                'internal_notes' => 'Authentic home stay.',
                'image' => 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'phare-ponleu-selpak-arts',
                'category_slug' => 'activities',
                'province' => $battambang,
                'name_en' => 'Phare Ponleu Selpak Circus & Arts Academy',
                'name_km' => 'សមាគមហ្វារពន្លឺសិល្បៈ បាត់ដំបង',
                'tagline_en' => 'World-famous Cambodian contemporary circus and cultural performance',
                'tagline_km' => 'ការសម្តែងសៀកសហសម័យខ្មែរ និងសិល្បៈវប្បធម៌ដ៏ល្បីល្បាញលើឆាកអន្តរជាតិ',
                'description_en' => 'Witness thrilling acrobatics, theatre, and music telling Cambodian stories while supporting youth education in Battambang.',
                'description_km' => 'ទស្សនាការសម្តែងសៀកដ៏រំភើប អមដោយភ្លេងបុរាណ និងសម័យ ដែលរៀបរាប់ពីជីវិតរស់នៅរបស់ខ្មែរ ព្រមទាំងជួយគាំទ្រការសិក្សារបស់យុវជន។',
                'address_en' => 'Anh Chanh Village, Battambang',
                'address_km' => 'ភូមិអញ្ចាញ ក្រុងបាត់ដំបង ខេត្តបាត់ដំបង',
                'lat' => 13.1118,
                'lng' => 103.1843,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Phare Foundation',
                'owner_phone' => '+855 12 000 118',
                'internal_notes' => 'Internationally recognized NGO.',
                'image' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
            ],

            // Sihanoukville / Islands
            [
                'slug' => 'kohrong-island-ferry-speedferry',
                'category_slug' => 'transport',
                'province' => $sihanoukville,
                'name_en' => 'Buva Sea Speed Ferry Sihanoukville',
                'name_km' => 'ទូកល្បឿនលឿន ប៊ូវ៉ាស៊ី ក្រុងព្រះសីហនុ-កោះរ៉ុង',
                'tagline_en' => 'Fast and reliable catamaran ferries to Koh Rong & Koh Rong Sanloem',
                'tagline_km' => 'សេវាទូកល្បឿនលឿនទំនើប និងមានសុវត្ថិភាព ទៅកាន់កោះរ៉ុង និងកោះរ៉ុងសន្លឹម',
                'description_en' => 'Daily regular departures connecting Serendipity Pier to pristine white sand beaches of Koh Rong in under 45 minutes.',
                'description_km' => 'ចេញដំណើរជារៀងរាល់ថ្ងៃ ភ្ជាប់ពីផែក្រុងព្រះសីហនុ ទៅកាន់ឆ្នេរខ្សាច់សកោះរ៉ុង ក្នុងរយៈពេលត្រឹមតែ ៤៥ នាទី។',
                'address_en' => 'Ochheuteal / Serendipity Pier, Sihanoukville',
                'address_km' => 'ផែអូរឈើទាល ក្រុងព្រះសីហនុ ខេត្តព្រះសីហនុ',
                'lat' => 10.6084,
                'lng' => 103.5284,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Oknha Bunna',
                'owner_phone' => '+855 12 000 119',
                'internal_notes' => 'Major marine ferry line.',
                'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'saracen-bay-beach-resort',
                'category_slug' => 'accommodation',
                'province' => $sihanoukville,
                'name_en' => 'Saracen Bay Island Hideaway Resort',
                'name_km' => 'រីសតឆ្នេរសារ៉ាសេនបេ កោះរ៉ុងសន្លឹម',
                'tagline_en' => 'Barefoot beachfront wooden bungalows facing turquoise crystal waters',
                'tagline_km' => 'បឹងហ្គាឡូឈើប្រណីតជាប់មាត់ឆ្នេរខ្សាច់សក្បុស និងទឹកសមុទ្រថ្លាដូចកញ្ចក់',
                'description_en' => 'Experience ultimate tranquility with direct access to calm shallow waters, snorkeling coral gardens, and nighttime bioluminescent plankton.',
                'description_km' => 'រីករាយជាមួយភាពស្ងប់ស្ងាត់ ហែលទឹកសមុទ្រ មុជទឹកមើលផ្កាថ្ម និងទស្សនាពន្លឺប្លង់តុងភ្លឺចែងចាំងនាពេលរាត្រី។',
                'address_en' => 'Saracen Bay, Koh Rong Sanloem, Sihanoukville',
                'address_km' => 'ឆ្នេរសារ៉ាសេនបេ កោះរ៉ុងសន្លឹម ខេត្តព្រះសីហនុ',
                'lat' => 10.5982,
                'lng' => 103.3051,
                'price_level' => 3,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Vannet Sok',
                'owner_phone' => '+855 12 000 120',
                'internal_notes' => 'Island resort with clean eco-practices.',
                'image' => 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'sihanouk-scuba-dive-center',
                'category_slug' => 'activities',
                'province' => $sihanoukville,
                'name_en' => 'Dive Cambodia Scuba & Coral Exploration',
                'name_km' => 'មជ្ឈមណ្ឌលមុជទឹកស្គូបា និងផ្កាថ្មសមុទ្រកម្ពុជា',
                'tagline_en' => 'PADI certified scuba diving and snorkeling trips around tropical outer islands',
                'tagline_km' => 'ដំណើរកម្សាន្តមុជទឹកស្គូបា និងមើលផ្កាថ្មជុំវិញកោះធម្មជាតិនានា មានគ្រូបង្ហាត់ PADI',
                'description_en' => 'Explore vibrant marine biodiversity, seahorses, stingrays, and healthy coral reefs in the Gulf of Thailand.',
                'description_km' => 'ស្វែងយល់ពីជីវចម្រុះបាតសមុទ្រ សត្វសមុទ្រចម្លែកៗ និងថ្មប៉ប្រះទឹកដ៏ស្រស់ស្អាតក្នុងឈូងសមុទ្រថៃ។',
                'address_en' => 'Otres Beach, Sihanoukville',
                'address_km' => 'ឆ្នេរអូរត្រេះ ក្រុងព្រះសីហនុ ខេត្តព្រះសីហនុ',
                'lat' => 10.5781,
                'lng' => 103.5492,
                'price_level' => 3,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Dave & Kiri',
                'owner_phone' => '+855 12 000 121',
                'internal_notes' => 'Certified dive operators.',
                'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
            ],

            // Kep
            [
                'slug' => 'kep-crab-market-restaurant-kimly',
                'category_slug' => 'restaurant-cafe',
                'province' => $kep,
                'name_en' => 'Kimly Seafood at Kep Crab Market',
                'name_km' => 'ភោជនីយដ្ឋាន គីមលី ផ្សារក្តាមកែប',
                'tagline_en' => 'Legendary ocean-view dining featuring Kampot green peppercorn flower crabs',
                'tagline_km' => 'ភោជនីយដ្ឋានមាត់សមុទ្រដ៏ល្បីល្បាញ ឆាក្តាមសេះជាមួយម្រេចខ្ចីកំពតស្រស់ៗ',
                'description_en' => 'Built on wooden stilts over the waves, offering the freshest catch plucked straight from ocean traps while you watch the sunset.',
                'description_km' => 'សាងសង់លើសសរឈើមាត់សមុទ្រ ផ្តល់ជូនគ្រឿងសមុទ្រស្រស់ៗទើបស្រង់ពីកន្ត្រកសមុទ្រ អមដោយទេសភាពថ្ងៃលិច។',
                'address_en' => 'Crab Market, Kep City',
                'address_km' => 'ផ្សារក្តាម ក្រុងកែប ខេត្តកែប',
                'lat' => 10.4851,
                'lng' => 104.2982,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Lok Yeay Kimly',
                'owner_phone' => '+855 12 000 122',
                'internal_notes' => 'Famous landmark eatery in Kep.',
                'image' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'knai-bang-chatt-resort',
                'category_slug' => 'accommodation',
                'province' => $kep,
                'name_en' => 'Knai Bang Chatt Coastal Sanctuary',
                'name_km' => 'ខ្នារបាំងឆ័ត្រ រីសតលំហែកាយមាត់សមុទ្រកែប',
                'tagline_en' => 'Modernist 1960s Vann Molyvann era architecture turned luxury eco-resort',
                'tagline_km' => 'ស្ថាបត្យកម្មសម័យទសវត្សរ៍ឆ្នាំ៦០ ប្រែក្លាយជារីសតលំដាប់ប្រណីតជាប់មាត់សមុទ្រ',
                'description_en' => 'An exclusive seaside retreat featuring an infinity saltwater pool, private sailing club, yoga pavilion, and sunset sailing.',
                'description_km' => 'កន្លែងលំហែកាយមាត់សមុទ្រដ៏ស្ងប់ស្ងាត់ មានអាងហែលទឹកទឹកប្រៃ ក្លឹបទូកក្តោង កន្លែងហាត់យូហ្គា និងដំណើរជិះទូកកម្សាន្ត។',
                'address_en' => 'Phum Thmey, Sangkat Prey Thom, Kep',
                'address_km' => 'ភូមិថ្មី សង្កាត់ព្រៃធំ ក្រុងកែប ខេត្តកែប',
                'lat' => 10.4812,
                'lng' => 104.3015,
                'price_level' => 4,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Jef Moons',
                'owner_phone' => '+855 12 000 123',
                'internal_notes' => 'Leading luxury boutique in Kep.',
                'image' => 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'kep-national-park-trekkers',
                'category_slug' => 'tour-guide',
                'province' => $kep,
                'name_en' => 'Kep Jungle Trail & Sunset Trekking',
                'name_km' => 'ដំណើរថ្មើរជើងព្រៃឧទ្យានជាតិកែប',
                'tagline_en' => 'Guided rainforest hikes through botanical paths to panoramic coastal peaks',
                'tagline_km' => 'ដំណើរដើរព្រៃកាត់ឧទ្យានជាតិកែប គយគន់ទេសភាពឆ្នេរសមុទ្រ និងកោះនានាពីលើកំពូលភ្នំ',
                'description_en' => 'Discover wild monkeys, hornbills, and historical trails winding around Kep mountain, finishing with chilled fresh coconuts.',
                'description_km' => 'ស្វែងយល់ពីសត្វព្រៃ សត្វស្លាប និងផ្លូវលំធម្មជាតិជុំវិញភ្នំកែប រួចពិសាទឹកដូងក្រអូបស្រស់ៗ។',
                'address_en' => 'Park Entrance near Led Zep Cafe, Kep',
                'address_km' => 'ច្រកចូលឧទ្យានជាតិកែប ក្រុងកែប ខេត្តកែប',
                'lat' => 10.4932,
                'lng' => 104.3121,
                'price_level' => 1,
                'status' => 'approved',
                'is_verified' => false,
                'owner_name' => 'Bunthorn Ngeth',
                'owner_phone' => '+855 12 000 124',
                'internal_notes' => 'Community ecotourism guide.',
                'image' => 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
            ],

            // Additional Provinces & States (Pending, Draft, Suspended, etc. for realistic admin testing)
            [
                'slug' => 'phnom-penh-craft-brewery',
                'category_slug' => 'restaurant-cafe',
                'province' => $phnomPenh,
                'name_en' => 'Botanico Craft Beer & Garden Cafe',
                'name_km' => 'បូតានីកូ ហាងកាហ្វេ និងស្រាបៀរយានដ្ឋាន ភ្នំពេញ',
                'tagline_en' => 'Locally brewed artisan beers and stone-baked pizza in a lush courtyard',
                'tagline_km' => 'ស្រាបៀរផលិតដោយដៃ និងភីហ្សាដុតកម្តៅភ្លើង ក្នុងសួនបៃតងដ៏ត្រជាក់',
                'description_en' => 'Phnom Penh\'s pioneer microbrewery offering flights of passionfruit IPA, ginger cider, and live acoustic music weekends.',
                'description_km' => 'កន្លែងផលិតស្រាបៀរដំបូងគេនៅភ្នំពេញ ដែលមានស្រាបៀររសជាតិផ្លែឈើធម្មជាតិ និងតន្ត្រីបន្តផ្ទាល់ចុងសប្តាហ៍។',
                'address_en' => 'Street 29, Daun Penh, Phnom Penh',
                'address_km' => 'ផ្លូវលេខ ២៩ សង្កាត់ចតុមុខ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ',
                'lat' => 11.5582,
                'lng' => 104.9315,
                'price_level' => 2,
                'status' => 'approved',
                'is_verified' => false,
                'owner_name' => 'Simon & Socheat',
                'owner_phone' => '+855 12 000 125',
                'internal_notes' => 'Popular local craft pub.',
                'image' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'sam-veasna-birding-conservation',
                'category_slug' => 'tour-guide',
                'province' => $siemReap,
                'name_en' => 'Sam Veasna Birding & Wildlife Tours',
                'name_km' => 'ដំណើរកម្សាន្តមើលសត្វស្លាប សំ វាសនា សៀមរាប',
                'tagline_en' => 'Pioneering birdwatching eco-tours protecting critically endangered species',
                'tagline_km' => 'ដំណើរកម្សាន្តអេកូទេសចរណ៍មើលសត្វស្លាប និងអភិរក្សសត្វកម្រជិតផុតពូជនៅកម្ពុជា',
                'description_en' => 'Specialist birding expeditions to Tmatboey and Tonle Sap lake to see Giant Ibis, Bengal Florican, and Sarus Crane.',
                'description_km' => 'ដំណើរទស្សនកិច្ចមើលសត្វស្លាបកម្រ ដូចជាសត្វត្រយងយក្ស ត្រដក់ និងក្រៀល នៅតំបន់បឹងទន្លេសាប និងព្រះវិហារ។',
                'address_en' => 'Street 05, Wat Bo, Siem Reap',
                'address_km' => 'ផ្លូវលេខ ០៥ ភូមិវត្តបូព៌ ក្រុងសៀមរាប',
                'lat' => 13.3562,
                'lng' => 103.8682,
                'price_level' => 3,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Eng Seng',
                'owner_phone' => '+855 12 000 126',
                'internal_notes' => 'Premier wildlife organization.',
                'image' => 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
            ],

            // Draft, Pending Review & Suspended businesses for admin testing
            [
                'slug' => 'mekong-blue-silk-weaving',
                'category_slug' => 'crafts-souvenirs',
                'province' => $phnomPenh,
                'name_en' => 'Mekong Blue Women Silk Weaving',
                'name_km' => 'សិប្បកម្មត្បាញសូត្រខ្មែរ មេគង្គប៊្លូ',
                'tagline_en' => 'Empowering rural women through exquisite hand-loomed 100% Cambodian silk',
                'tagline_km' => 'លើកកម្ពស់ស្ត្រីជនបទ តាមរយៈការត្បាញសូត្រខ្មែរធម្មជាតិដោយដៃ ១០០%',
                'description_en' => 'Fair trade certified silk scarves, wall hangings, and accessories crafted on wooden floor looms.',
                'description_km' => 'ក្រមាសូត្រ គំនូរសូត្រ និងគ្រឿងអលង្ការដែលត្បាញលើកីឈើបុរាណប្រកបដោយគុណភាពខ្ពស់។',
                'address_en' => 'Russian Market Area, Toul Tom Poung, Phnom Penh',
                'address_km' => 'តំបន់ផ្សារទួលទំពូង រាជធានីភ្នំពេញ',
                'lat' => 11.5392,
                'lng' => 104.9152,
                'price_level' => 2,
                'status' => 'pending_review',
                'is_verified' => false,
                'owner_name' => 'Mrs. Sokchan',
                'owner_phone' => '+855 12 000 127',
                'internal_notes' => 'Awaiting business registration document upload before approval.',
                'image' => 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'cambodia-quad-bike-trails',
                'category_slug' => 'activities',
                'province' => $siemReap,
                'name_en' => 'Siem Reap Quad Bike Adventure',
                'name_km' => 'ដំណើរកម្សាន្តម៉ូតូបួនកង់ សៀមរាប',
                'tagline_en' => 'ATV four-wheel adventure rides through muddy trails and sunset paddy fields',
                'tagline_km' => 'ជិះម៉ូតូបួនកង់ផ្សងព្រេងកាត់ផ្លូវភក់ ភូមិស្រុក និងវាលស្រែពេលថ្ងៃលិច',
                'description_en' => 'Drive through remote villages rarely visited by tourists, accompanied by trained safety guides and helmets.',
                'description_km' => 'បើកបរម៉ូតូបួនកង់ឆ្លងកាត់ភូមិជនបទដាច់ស្រយាល មានមគ្គុទ្ទេសក៍សុវត្ថិភាព និងមួកសុវត្ថិភាពត្រឹមត្រូវ។',
                'address_en' => 'Sra Srong, Siem Reap',
                'address_km' => 'ស្រះស្រង់ ក្រុងសៀមរាប',
                'lat' => 13.3421,
                'lng' => 103.8892,
                'price_level' => 2,
                'status' => 'draft',
                'is_verified' => false,
                'owner_name' => 'Kosal Rath',
                'owner_phone' => '+855 12 000 128',
                'internal_notes' => 'Draft submission by staff; still missing insurance documents.',
                'image' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'unlicensed-speed-boat-charter',
                'category_slug' => 'transport',
                'province' => $sihanoukville,
                'name_en' => 'Coastal Speed Boat Charters',
                'name_km' => 'សេវាជួលទូកល្បឿនលឿនកម្សាន្តសមុទ្រ',
                'tagline_en' => 'Private speed boats for island hopping',
                'tagline_km' => 'ទូកល្បឿនលឿនឯកជនសម្រាប់ដំណើរកម្សាន្តតាមកោះ',
                'description_en' => 'Private boat charters to remote archipelago islands.',
                'description_km' => 'សេវាជួលទូកឯកជនទៅកាន់កោះនានា។',
                'address_en' => 'Victory Beach, Sihanoukville',
                'address_km' => 'ឆ្នេរជ័យជំនះ ក្រុងព្រះសីហនុ',
                'lat' => 10.6281,
                'lng' => 103.5042,
                'price_level' => 3,
                'status' => 'suspended',
                'is_verified' => false,
                'owner_name' => 'Unknown',
                'owner_phone' => '+855 12 000 129',
                'internal_notes' => 'Suspended by admin due to safety license expiration. Must remain hidden from public.',
                'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
            ],
            [
                'slug' => 'angkor-botanical-garden-cafe',
                'category_slug' => 'restaurant-cafe',
                'province' => $siemReap,
                'name_en' => 'Angkor Botanical Garden Organic Cafe',
                'name_km' => 'ហាងកាហ្វេធម្មជាតិ សួនរុក្ខសាស្ត្រអង្គរ',
                'tagline_en' => 'Fresh tropical juices and cold brew surrounded by medicinal plant gardens',
                'tagline_km' => 'ទឹកផ្លែឈើស្រស់ និងកាហ្វេត្រជាក់ ព័ទ្ធជុំវិញដោយសួនឱសថបុរាណខ្មែរ',
                'description_en' => 'Nestled inside the lush Angkor Botanical Garden, offering shade, coconut ice cream, and organic salads.',
                'description_km' => 'ស្ថិតនៅក្នុងសួនរុក្ខសាស្ត្រអង្គរ មានម្លប់ត្រជាក់ ទឹកដូង ការ៉េមដូង និងសាឡាត់បន្លែធម្មជាតិ។',
                'address_en' => 'Road 60, Siem Reap',
                'address_km' => 'ផ្លូវ ៦០ ម៉ែត្រ ក្រុងសៀមរាប',
                'lat' => 13.3742,
                'lng' => 103.8721,
                'price_level' => 1,
                'status' => 'approved',
                'is_verified' => true,
                'owner_name' => 'Mrs. Chanleakhena',
                'owner_phone' => '+855 12 000 130',
                'internal_notes' => 'Eco-cafe near botanical grounds.',
                'image' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
            ],
        ];

        $now = now();

        foreach ($businessesData as $bData) {
            $cat = $categories[$bData['category_slug']];
            $province = $bData['province'];

            $business = Business::updateOrCreate(
                ['slug' => $bData['slug']],
                [
                    'category_id' => $cat->id,
                    'province_id' => $province->id,
                    'name_en' => $bData['name_en'],
                    'name_km' => $bData['name_km'],
                    'tagline_en' => $bData['tagline_en'],
                    'tagline_km' => $bData['tagline_km'],
                    'description_en' => $bData['description_en'],
                    'description_km' => $bData['description_km'],
                    'address_en' => $bData['address_en'],
                    'address_km' => $bData['address_km'],
                    'lat' => $bData['lat'],
                    'lng' => $bData['lng'],
                    'price_level' => $bData['price_level'],
                    'status' => $bData['status'],
                    'is_verified' => $bData['is_verified'],
                    'verified_at' => $bData['is_verified'] ? $now : null,
                    'verified_by' => $bData['is_verified'] ? $adminId : null,
                    'approved_at' => $bData['status'] === 'approved' ? $now : null,
                    'owner_name' => $bData['owner_name'],
                    'owner_phone' => $bData['owner_phone'],
                    'internal_notes' => $bData['internal_notes'],
                    'created_by' => $adminId,
                    'updated_by' => $adminId,
                ]
            );

            // Contacts
            $business->contacts()->delete();
            $contacts = [
                [
                    'type' => 'phone',
                    'value' => $bData['owner_phone'],
                    'label' => 'Hotline / Call',
                    'is_primary' => true,
                    'sort_order' => 1,
                ],
                [
                    'type' => 'telegram',
                    'value' => 'https://t.me/khemara_' . str_replace('-', '_', $business->slug),
                    'label' => 'Telegram',
                    'is_primary' => false,
                    'sort_order' => 2,
                ],
                [
                    'type' => 'whatsapp',
                    'value' => 'https://wa.me/855' . substr(preg_replace('/[^0-9]/', '', $bData['owner_phone']), 3),
                    'label' => 'WhatsApp',
                    'is_primary' => false,
                    'sort_order' => 3,
                ],
                [
                    'type' => 'messenger',
                    'value' => 'https://m.me/khemara.' . $business->slug,
                    'label' => 'Messenger',
                    'is_primary' => false,
                    'sort_order' => 4,
                ],
                [
                    'type' => 'email',
                    'value' => 'contact@' . $business->slug . '.com',
                    'label' => 'Email',
                    'is_primary' => false,
                    'sort_order' => 5,
                ],
                [
                    'type' => 'facebook',
                    'value' => 'https://facebook.com/' . $business->slug,
                    'label' => 'Facebook Page',
                    'is_primary' => false,
                    'sort_order' => 6,
                ],
            ];
            foreach ($contacts as $c) {
                $business->contacts()->create($c);
            }

            // Operating Hours (Mon-Sun: 07:30 to 21:00 or special shift)
            $business->hours()->delete();
            for ($day = 0; $day <= 6; $day++) {
                $business->hours()->create([
                    'weekday' => $day,
                    'opens_at' => '07:30:00',
                    'closes_at' => '21:30:00',
                    'is_closed' => false,
                ]);
            }

            // Media
            $business->media()->delete();
            $media = BusinessMedia::create([
                'business_id' => $business->id,
                'path' => $bData['image'],
                'path_800' => $bData['image'],
                'path_400' => $bData['image'],
                'alt_en' => $bData['name_en'] . ' Main Photo',
                'alt_km' => 'រូបភាពនៃ ' . $bData['name_km'],
                'is_cover' => true,
                'sort_order' => 1,
            ]);
            $business->update(['cover_media_id' => $media->id]);

            // Add secondary image
            BusinessMedia::create([
                'business_id' => $business->id,
                'path' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
                'path_800' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
                'path_400' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
                'alt_en' => $bData['name_en'] . ' Interior View',
                'alt_km' => 'ទិដ្ឋភាពខាងក្នុងនៃ ' . $bData['name_km'],
                'is_cover' => false,
                'sort_order' => 2,
            ]);

            // Add a third image so demo profiles can qualify for the owner trial.
            BusinessMedia::create([
                'business_id' => $business->id,
                'path' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
                'path_800' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
                'path_400' => 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80',
                'alt_en' => $bData['name_en'] . ' Guest Experience',
                'alt_km' => 'Guest experience - ' . $bData['name_en'],
                'is_cover' => false,
                'sort_order' => 3,
            ]);

            // KYC documents for verified businesses
            $business->documents()->delete();
            if ($bData['is_verified']) {
                BusinessDocument::create([
                    'business_id' => $business->id,
                    'type' => 'business_license',
                    'path' => 'business/documents/' . $business->id . '/license_verified.pdf',
                    'file_name' => 'Ministry_Tourism_License_2026.pdf',
                    'file_size' => 1024 * 450,
                    'mime_type' => 'application/pdf',
                    'uploaded_by' => $adminId,
                    'expires_at' => now()->addYears(2),
                    'notes' => 'Verified with Ministry of Tourism National Registry.',
                ]);
            }

            // Recalculate proximity links to tourist destinations
            $business->recalculateDestinationLinks();
        }

        // 3. Seed 60 Reviews in mixed states (approved, pending, rejected)
        $approvedBusinesses = Business::where('status', 'approved')->get();
        if ($approvedBusinesses->isNotEmpty()) {
            BusinessReview::query()->delete();

            $reviewerNames = [
                'Vicheka Soun', 'Michael Henderson', 'Bopha Pich', 'Sarah Jenkins',
                'Dara Sovann', 'Akiko Takahashi', 'Sophea Kim', 'Lucas Dupont',
                'Rithy Meng', 'Camille Laurent', 'Chanthy Ouk', 'David Miller',
                'Sreypov Chhon', 'Elena Vasquez', 'Veasna Tep', 'Klaus Weber',
                'Sreynich Heng', 'Tetsuya Mori', 'Sokunthea Pao', 'Hannah Abbott',
            ];

            $khmerComments = [
                'កន្លែងនេះស្អាតខ្លាំងណាស់ សេវាកម្មរហ័សទាន់ចិត្ត និងម្ហូបឆ្ងាញ់ពិតៗ។ នឹងមកម្តងទៀត!',
                'បុគ្គលិករួសរាយរាក់ទាក់ បរិយាកាសស្ងប់ស្ងាត់ល្អស័ក្តិសមសម្រាប់គ្រួសារសម្រាកកាយ។',
                'តម្លៃសមរម្យ គុណភាពល្អលើសពីការរំពឹងទុក។ ពេញចិត្តខ្លាំងណាស់!',
                'បទពិសោធន៍ដ៏អស្ចារ្យ រសជាតិម្ហូបខ្មែរពិតប្រាកដ និងមានអនាម័យខ្ពស់។',
                'ទីតាំងងាយស្រួលរក ចតឡានស្រួល និងសេវាកម្មប្រកបដោយវិជ្ជាជីវៈ។',
            ];

            $englishComments = [
                'Absolutely phenomenal experience! The staff was incredibly welcoming and attentive.',
                'One of the highlights of our trip to Cambodia. Authentic, clean, and top-notch service.',
                'Great value for money. Very peaceful atmosphere and beautifully maintained facilities.',
                'Exceptional hospitality! We will definitely recommend this place to all our traveling friends.',
                'Seamless booking and direct contact was super fast via Telegram. 5 stars all the way!',
            ];

            $reviewIndex = 0;
            foreach ($approvedBusinesses as $biz) {
                // Generate 2 to 3 reviews per business to total ~60 reviews
                $numReviews = ($reviewIndex < 10) ? 3 : 2;

                for ($i = 0; $i < $numReviews && $reviewIndex < 60; $i++) {
                    $reviewer = $reviewerNames[$reviewIndex % count($reviewerNames)];
                    $isKhmer = ($reviewIndex % 2 === 0);
                    $comment = $isKhmer
                        ? $khmerComments[$reviewIndex % count($khmerComments)]
                        : $englishComments[$reviewIndex % count($englishComments)];

                    // Status distribution: ~80% approved, ~15% pending, ~5% rejected
                    $status = 'approved';
                    if ($reviewIndex % 10 === 8) {
                        $status = 'pending';
                    } elseif ($reviewIndex % 20 === 19) {
                        $status = 'rejected';
                    }

                    $rating = 4;
                    if ($reviewIndex % 3 === 0) $rating = 5;
                    if ($reviewIndex % 7 === 0) $rating = 3;

                    $email = strtolower(str_replace(' ', '.', $reviewer)) . '@example.com';
                    $ip = '103.216.50.' . (10 + ($reviewIndex % 100));

                    BusinessReview::create([
                        'business_id' => $biz->id,
                        'display_name' => $reviewer,
                        'rating' => $rating,
                        'comment' => $comment,
                        'locale' => $isKhmer ? 'km' : 'en',
                        'email_hash' => hash('sha256', $email . config('app.key')),
                        'ip_hash' => hash('sha256', $ip . config('app.key')),
                        'status' => $status,
                        'moderated_by' => $status !== 'pending' ? $adminId : null,
                        'moderated_at' => $status !== 'pending' ? now()->subDays($reviewIndex % 15) : null,
                        'rejection_reason' => $status === 'rejected' ? 'Contains promotional link or spam terms.' : null,
                        'created_at' => now()->subDays($reviewIndex % 30),
                    ]);

                    $reviewIndex++;
                }

                // Recalculate rating avg and count
                $biz->recalculateRatings();
            }
        }

        // 4. Seed initial contact events and aggregate stats for analytics testing
        BusinessContactEvent::query()->delete();
        $channels = ['phone', 'telegram', 'whatsapp', 'messenger', 'email', 'website', 'directions'];

        foreach ($approvedBusinesses->take(8) as $b) {
            for ($k = 0; $k < 12; $k++) {
                BusinessContactEvent::create([
                    'business_id' => $b->id,
                    'channel' => $channels[$k % count($channels)],
                    'occurred_at' => now()->subDays($k % 7)->subHours($k * 2),
                    'locale' => 'km',
                    'session_hash' => hash('sha256', "demo_session_{$k}_{$b->id}"),
                    'source' => $k % 3 === 0 ? 'list' : ($k % 3 === 1 ? 'profile' : 'nearby'),
                ]);
            }
        }

        // 5. Link the demo business owner account to the first approved business
        $businessOwner = User::where('email', 'owner@khemaramorodok.com')->first();
        if ($businessOwner && empty($businessOwner->business_id) && $approvedBusinesses->isNotEmpty()) {
            $businessOwner->update(['business_id' => $approvedBusinesses->first()->id]);
        }

        // 6. Organizations and owner memberships for the Phase 4 team model
        foreach (Business::orderBy('id')->get() as $business) {
            $organization = $business->organization ?: Organization::create([
                'name' => $business->name_en ?: $business->name_km ?: 'Business ' . $business->id,
                'slug' => Str::slug($business->slug ?: 'business-' . $business->id) . '-org-' . $business->id,
                'owner_user_id' => $businessOwner && (int) $business->id === (int) $businessOwner->business_id
                    ? $businessOwner->id
                    : null,
            ]);

            if (!$business->organization_id) {
                $business->update(['organization_id' => $organization->id]);
            }

            if ($businessOwner && (int) $businessOwner->business_id === (int) $business->id) {
                BusinessMember::updateOrCreate(
                    ['business_id' => $business->id, 'user_id' => $businessOwner->id],
                    [
                        'role' => 'owner',
                        'status' => 'active',
                        'accepted_at' => now(),
                    ]
                );
                $organization->update(['owner_user_id' => $businessOwner->id]);
            }
        }

        $this->call(BusinessProfileSchemaSeeder::class);

        $this->command?->info('Business Module seeded successfully: 7 categories, 30 businesses, 60+ reviews & analytics.');
    }
}
