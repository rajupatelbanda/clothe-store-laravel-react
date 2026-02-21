<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::updateOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Cloth Pro Admin',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);

        // Settings
        Setting::updateOrCreate(['id' => 1], [
            'site_name' => 'Gemini Cloth Pro',
            'email' => 'support@geministore.com',
            'phone' => '+1 234 567 890',
            'address' => '123 Fashion Blvd, New York',
            'social_links' => [
                'facebook' => 'https://facebook.com',
                'twitter' => 'https://twitter.com',
                'instagram' => 'https://instagram.com'
            ]
        ]);

        $this->call([
            CategorySeeder::class,
            SubcategorySeeder::class,
            BrandSeeder::class,
            ProductSeeder::class,
            BannerSeeder::class,
            PageSeeder::class,
            OrderSeeder::class
        ]);
    }
}
