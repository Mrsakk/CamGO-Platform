<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions list
        $permissions = [
            // Destinations
            'view destinations',
            'create destinations',
            'edit destinations',
            'delete destinations',
            'publish destinations',
            // Provinces & Categories
            'manage provinces',
            'manage categories',
            // Reviews
            'moderate reviews',
            'delete reviews',
            // Blog & Events
            'manage blog',
            'manage events',
            // Static content & banners
            'manage banners',
            'manage faqs',
            'manage pages',
            // Users & roles
            'view users',
            'edit users',
            'delete users',
            'manage roles',
            // Inquiries & Settings
            'view inquiries',
            'manage settings',
            'view audit logs',
            // Business Module (Phase 2)
            'business.view',
            'business.create',
            'business.edit',
            'business.delete',
            'business.update',
            'business.publish',
            'business.verify',
            'business.feature',
            'business.leads',
            'business.reviews',
            'business.plans',
            'business.payments',
            'business.settings',
            'business.audit',
            'business.kyc.view',
            'business.reviews.moderate',
            'business.categories.manage',
            'business.stats.view',
            // Billing Module (Phase 1)
            'plans.manage',
            'subscriptions.manage',
            'payments.verify',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create Super Admin role with all permissions
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        $superAdminSlug = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdminSlug->syncPermissions(Permission::all());

        $businessAdmin = Role::firstOrCreate(['name' => 'business_admin', 'guard_name' => 'web']);
        $businessAdmin->syncPermissions([
            'business.view',
            'business.create',
            'business.edit',
            'business.publish',
            'business.verify',
            'business.feature',
            'business.leads',
            'business.reviews',
            'business.plans',
            'business.payments',
            'business.settings',
            'business.audit',
            'business.kyc.view',
            'business.reviews.moderate',
            'business.categories.manage',
            'business.stats.view',
            'view users',
            'edit users',
            'manage settings',
            'view audit logs',
        ]);

        $businessStaff = Role::firstOrCreate(['name' => 'business_staff', 'guard_name' => 'web']);
        $businessStaff->syncPermissions([
            'business.view',
            'business.leads',
            'business.reviews',
            'business.stats.view',
        ]);

        // Create Content Manager role
        $contentManager = Role::firstOrCreate(['name' => 'Content Manager', 'guard_name' => 'web']);
        $contentManager->syncPermissions([
            'view destinations',
            'create destinations',
            'edit destinations',
            'publish destinations',
            'manage provinces',
            'manage categories',
            'moderate reviews',
            'manage blog',
            'manage events',
            'manage banners',
            'manage faqs',
            'manage pages',
            'view inquiries',
        ]);

        // Create Moderator role
        $moderator = Role::firstOrCreate(['name' => 'Moderator', 'guard_name' => 'web']);
        $moderator->syncPermissions([
            'view destinations',
            'moderate reviews',
            'delete reviews',
            'view inquiries',
        ]);

        // Create Business Manager role
        $businessManager = Role::firstOrCreate(['name' => 'Business Manager', 'guard_name' => 'web']);
        $businessManager->syncPermissions([
            'business.view',
            'business.create',
            'business.update',
            'business.publish',
            'business.verify',
            'business.reviews.moderate',
            'business.stats.view',
        ]);

        // Also alias 'business_manager'
        $businessManagerSlug = Role::firstOrCreate(['name' => 'business_manager', 'guard_name' => 'web']);
        $businessManagerSlug->syncPermissions([
            'business.view',
            'business.create',
            'business.update',
            'business.publish',
            'business.verify',
            'business.reviews.moderate',
            'business.stats.view',
        ]);

        // Create Tourist / User role
        Role::firstOrCreate(['name' => 'Tourist', 'guard_name' => 'web']);

        // Phase 2 ready: Business Owner role
        $bizOwner = Role::firstOrCreate(['name' => 'Business Owner', 'guard_name' => 'web']);
        $bizOwner->syncPermissions([
            'business.view',
            'business.update',
            'business.stats.view',
        ]);

        $bizOwnerSlug = Role::firstOrCreate(['name' => 'business_owner', 'guard_name' => 'web']);
        $bizOwnerSlug->syncPermissions([
            'business.view',
            'business.update',
            'business.stats.view',
            'business.leads',
            'business.reviews',
        ]);
    }
}
