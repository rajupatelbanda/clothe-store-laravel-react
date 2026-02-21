<?php

namespace Database\Seeders;

use App\Models\Subcategory;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SubcategorySeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            "Men's Wear" => ['Shirts', 'T-Shirts', 'Jeans', 'Trousers', 'Suits'],
            "Women's Wear" => ['Dresses', 'Tops', 'Skirts', 'Ethnic Wear', 'Lingerie'],
            "Kids Wear" => ['Infant Wear', 'Boys Clothing', 'Girls Clothing', 'Toys'],
            "Shoes" => ['Sneakers', 'Formal Shoes', 'Sandals', 'Boots'],
            "Accessories" => ['Belts', 'Wallets', 'Sunglasses', 'Hats']
        ];

        foreach ($data as $catName => $subs) {
            $cat = Category::where('name', $catName)->first();
            if ($cat) {
                foreach ($subs as $sub) {
                    Subcategory::create([
                        'category_id' => $cat->id,
                        'name' => $sub,
                        'slug' => Str::slug($sub) . '-' . $cat->id
                    ]);
                }
            }
        }
    }
}
