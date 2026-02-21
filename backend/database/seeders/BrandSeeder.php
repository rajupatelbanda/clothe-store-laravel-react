<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            'Nike' => 'https://logo.clearbit.com/nike.com',
            'Adidas' => 'https://logo.clearbit.com/adidas.com',
            'Puma' => 'https://logo.clearbit.com/puma.com',
            'Zara' => 'https://logo.clearbit.com/zara.com',
            'H&M' => 'https://logo.clearbit.com/hm.com',
            'Gucci' => 'https://logo.clearbit.com/gucci.com',
            'Prada' => 'https://logo.clearbit.com/prada.com',
            'Levis' => 'https://logo.clearbit.com/levi.com',
            'Reebok' => 'https://logo.clearbit.com/reebok.com',
            'Uniqlo' => 'https://logo.clearbit.com/uniqlo.com'
        ];

        foreach ($brands as $name => $img) {
            Brand::updateOrCreate(['name' => $name], [
                'slug' => Str::slug($name),
                'image' => $img,
            ]);
        }
    }
}
