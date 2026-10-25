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
        // Core seeders required for production operation
        $this->call([
            RolesAndPermissionsSeeder::class,
            ProvinceSeeder::class,
            CategorySeeder::class,
            SettingSeeder::class,
            PlanSeeder::class,
            BusinessProfileSchemaSeeder::class,
        ]);

        // Demo seeders guarded to run only in non-production environments
        if (! app()->environment('production')) {
            $this->call([
                UserSeeder::class,
                DestinationSeeder::class,
                ReviewSeeder::class,
                BlogPostSeeder::class,
                EventSeeder::class,
                BannerSeeder::class,
                FaqSeeder::class,
                PageSeeder::class,
                BusinessModuleSeeder::class,
            ]);
        } else {
            $this->command?->info('Production environment detected: Demo accounts and mock destinations skipped.');
            $this->command?->info('Run [php artisan app:create-super-admin] to provision your production administrator.');
        }
    }
}
