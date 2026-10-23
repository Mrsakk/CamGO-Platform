<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            UserSeeder::class,
            ProvinceSeeder::class,
            CategorySeeder::class,
            DestinationSeeder::class,
            ReviewSeeder::class,
            BlogPostSeeder::class,
            EventSeeder::class,
            BannerSeeder::class,
            FaqSeeder::class,
            PageSeeder::class,
            SettingSeeder::class,
            PlanSeeder::class,
            BusinessModuleSeeder::class,
        ]);
    }
}
