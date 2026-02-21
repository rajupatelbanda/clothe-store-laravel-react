<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        Banner::create([
            'title' => 'Exclusive Winter Drop 2026',
            'link' => '/shop',
            'image' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000', // External for now, usually local
            'status' => true
        ]);

        Banner::create([
            'title' => 'The Denim Revolution',
            'link' => '/shop?category=11',
            'image' => 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000',
            'status' => true
        ]);
    }
}
