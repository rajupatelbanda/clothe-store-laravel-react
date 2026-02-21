<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Subcategory;
use App\Models\Brand;
use App\Models\ProductVariation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $brands = Brand::all();
        $subcategories = Subcategory::all();

        if ($subcategories->isEmpty() || $brands->isEmpty()) {
            return;
        }

        // Apparel specific names for realism
        $clothNames = [
            'Premium Cotton', 'Urban Oversized', 'Classic Fit', 'Elite Sport', 'Vintage Washed',
            'Summer Breeze', 'Midnight Noir', 'Street Style', 'Formal Occasion', 'Daily Comfort',
            'Heritage Denim', 'Luxe Velvet', 'Active Tech', 'Nordic Knit', 'Tropical Print'
        ];

        $apparelTypes = ['T-Shirt', 'Polo', 'Hoodie', 'Jacket', 'Denim', 'Chinos', 'Dress', 'Shorts', 'Sneakers'];

        for ($i = 1; $i <= 99; $i++) {
            $baseName = $faker->randomElement($clothNames) . ' ' . $faker->randomElement($apparelTypes);
            $name = $baseName . ' ' . Str::upper(Str::random(3));
            $price = $faker->randomFloat(2, 45, 450);
            $discountPrice = $faker->boolean(70) ? ($price * $faker->randomFloat(2, 0.6, 0.9)) : null;
            $discountPerc = $discountPrice ? round((($price - $discountPrice) / $price) * 100) : null;
            
            $sub = $subcategories->random();
            
            $product = Product::create([
                'category_id' => $sub->category_id,
                'subcategory_id' => $sub->id,
                'brand_id' => $brands->random()->id,
                'name' => $name,
                'slug' => Str::slug($name) . '-' . time() . '-' . $i,
                'description' => $faker->paragraph(4) . "\n\n" . $faker->sentence(10),
                'video' => null, // Placeholder for actual file
                'price' => $price,
                'discount_price' => $discountPrice,
                'discount_percentage' => $discountPerc,
                'stock' => $faker->numberBetween(20, 200),
                'colors' => ['Red', 'Navy', 'Emerald Green', 'Charcoal', 'Sand'],
                'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
                'images' => [
                    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000',
                    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000',
                    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000'
                ],
                'is_featured' => $faker->boolean(25),
                'status' => true,
            ]);

            // Seed Variations for every product
            $colors = ['Navy', 'Black', 'White'];
            $sizes = ['M', 'L', 'XL'];

            foreach ($colors as $color) {
                foreach ($sizes as $size) {
                    ProductVariation::create([
                        'product_id' => $product->id,
                        'color' => $color,
                        'size' => $size,
                        'price' => $product->discount_price ? ($product->discount_price + rand(5, 15)) : ($product->price + rand(5, 15)),
                        'stock' => rand(5, 50),
                    ]);
                }
            }
        }
    }
}
