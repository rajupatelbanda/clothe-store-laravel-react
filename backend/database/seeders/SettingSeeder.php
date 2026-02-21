<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::updateOrCreate(['id' => 1], [
            'site_name' => 'Gemini Cloth Store',
            'email' => 'support@geministore.com',
            'phone' => '+1 234 567 890',
            'address' => '123 Fashion Street, New York, NY 10001',
            'social_links' => [
                'facebook' => 'https://facebook.com',
                'twitter' => 'https://twitter.com',
                'instagram' => 'https://instagram.com'
            ]
        ]);
    }
}
