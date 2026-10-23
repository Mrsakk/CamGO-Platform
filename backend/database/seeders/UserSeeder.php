<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@khemaramorodok.com'],
            [
                'name' => 'Khemara Administrator',
                'password' => Hash::make('password123'),
                'phone' => '+855 12 888 999',
                'country' => 'Cambodia',
                'bio' => 'Lead Administrator for CamGO Travel Platform.',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('Super Admin');

        // 2. Content Manager
        $manager = User::firstOrCreate(
            ['email' => 'manager@khemaramorodok.com'],
            [
                'name' => 'Dara Sovann (Content Manager)',
                'password' => Hash::make('password123'),
                'phone' => '+855 16 777 888',
                'country' => 'Cambodia',
                'bio' => 'Senior Tourism Content Editor for Cambodia National Heritage.',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $manager->assignRole('Content Manager');

        // 3. Moderator
        $moderator = User::firstOrCreate(
            ['email' => 'moderator@khemaramorodok.com'],
            [
                'name' => 'Bopha Chea (Moderator)',
                'password' => Hash::make('password123'),
                'phone' => '+855 92 333 444',
                'country' => 'Cambodia',
                'bio' => 'Review and Community Moderator.',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $moderator->assignRole('Moderator');

        // 4. Business Owner Demo Account
        $businessOwner = User::firstOrCreate(
            ['email' => 'owner@khemaramorodok.com'],
            [
                'name' => 'Sokha Business Owner',
                'password' => Hash::make('password123'),
                'phone' => '+855 12 345 678',
                'country' => 'Cambodia',
                'bio' => 'Demo business owner account for the owner portal.',
                'avatar' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $businessOwner->assignRole('business_owner');

        // 5. Sample Tourists
        $tourists = [
            [
                'name' => 'Chan Sokha',
                'email' => 'sokha@example.com',
                'phone' => '+855 93 111 222',
                'country' => 'Cambodia',
                'bio' => 'Passionate local explorer, landscape photographer, and temple researcher.',
                'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Elena Rostova',
                'email' => 'elena@example.com',
                'phone' => '+33 6 12 34 56 78',
                'country' => 'France',
                'bio' => 'Architectural historian in love with Southeast Asian ancient temples.',
                'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Johnathan Smith',
                'email' => 'john@example.com',
                'phone' => '+1 415 555 2671',
                'country' => 'United States',
                'bio' => 'Backpacker and digital nomad traveling through Indochina.',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Aoi Tanaka',
                'email' => 'tanaka@example.com',
                'phone' => '+81 90 1234 5678',
                'country' => 'Japan',
                'bio' => 'Culinary and cultural enthusiast documenting Cambodian street cuisine.',
                'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            ],
        ];

        foreach ($tourists as $t) {
            $user = User::firstOrCreate(
                ['email' => $t['email']],
                [
                    'name' => $t['name'],
                    'password' => Hash::make('password123'),
                    'phone' => $t['phone'],
                    'country' => $t['country'],
                    'bio' => $t['bio'],
                    'avatar' => $t['avatar'],
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]
            );
            $user->assignRole('Tourist');
        }
    }
}
