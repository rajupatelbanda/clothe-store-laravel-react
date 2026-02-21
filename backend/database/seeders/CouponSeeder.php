<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::create([
            'code' => 'WELCOME10',
            'type' => 'percentage',
            'value' => 10,
            'usage_limit' => 100,
            'status' => true
        ]);

        Coupon::create([
            'code' => 'FLAT50',
            'type' => 'fixed',
            'value' => 50,
            'usage_limit' => 50,
            'status' => true
        ]);

        Coupon::create([
            'code' => 'MEN20',
            'type' => 'percentage',
            'value' => 20,
            'category_id' => 1, // Assuming category 1 is Men's Wear
            'status' => true
        ]);
    }
}
