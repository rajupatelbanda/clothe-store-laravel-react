<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariation;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Subcategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RichProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::all();
        $brands = Brand::all();
        $subcategories = Subcategory::all();

        if ($categories->isEmpty() || $brands->isEmpty()) {
            return;
        }

        $products = [
            [
                'name' => 'Elite Performance Cyber Jacket',
                'description' => 'Unleash your potential with the Elite Performance Cyber Jacket. Engineered for the modern athlete, this jacket features high-tech breathable fabric, water-resistant coating, and ergonomic design for maximum mobility. Perfect for high-intensity training or urban exploration.',
                'price' => 2999.00,
                'discount_price' => 2499.00,
                'is_featured' => true,
                'is_trending' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000',
                    'https://images.unsplash.com/photo-1544022613-e87ce7526a63?q=80&w=1000',
                    'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1000'
                ],
                'video' => 'https://www.w3schools.com/html/mov_bbb.mp4', // External video for demo
                'colors' => ['Cyber Black', 'Neon Blue', 'Phantom Grey'],
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'name' => 'Luxe Silk Evening Dress',
                'description' => 'Radiate elegance in our Luxe Silk Evening Dress. Crafted from 100% pure Mulberry silk, this dress offers a liquid-like drape and a subtle sheen that captures the light beautifully. Featuring a delicate slip design and adjustable straps for a perfect fit.',
                'price' => 5499.00,
                'discount_price' => 4999.00,
                'is_featured' => true,
                'is_trending' => false,
                'images' => [
                    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000',
                    'https://images.unsplash.com/photo-1539008835279-4346745082bc?q=80&w=1000',
                    'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=1000'
                ],
                'video' => 'https://www.w3schools.com/html/movie.mp4',
                'colors' => ['Champagne', 'Midnight Rose', 'Emerald'],
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],
            [
                'name' => 'Heritage Rugged Denim',
                'description' => 'Built to last, our Heritage Rugged Denim is made from heavy-weight Japanese selvedge denim. These jeans are designed to age uniquely with your wear, developing a personalized patina over time. Classic straight-leg fit with reinforced stitching.',
                'price' => 1899.00,
                'discount_price' => 1599.00,
                'is_featured' => false,
                'is_trending' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000',
                    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000',
                    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=1000'
                ],
                'video' => null,
                'colors' => ['Indigo', 'Stone Wash', 'Deep Black'],
                'sizes' => ['30', '32', '34', '36'],
            ],
            [
                'name' => 'Cloud-Walk Knit Sneakers',
                'description' => 'Experience the sensation of walking on clouds with our Cloud-Walk Knit Sneakers. The ultra-flexible knit upper conforms to your foot for a sock-like fit, while the responsive foam midsole provides exceptional cushioning and energy return.',
                'price' => 3999.00,
                'discount_price' => 3499.00,
                'is_featured' => true,
                'is_trending' => true,
                'images' => [
                    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000',
                    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1000',
                    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000'
                ],
                'video' => null,
                'colors' => ['Arctic White', 'Core Black', 'Sunset Orange'],
                'sizes' => ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
            ]
        ];

        foreach ($products as $p) {
            $cat = $categories->random();
            $sub = $subcategories->where('category_id', $cat->id)->first() ?? $subcategories->random();
            
            $product = Product::create([
                'category_id' => $cat->id,
                'subcategory_id' => $sub->id,
                'brand_id' => $brands->random()->id,
                'name' => $p['name'],
                'slug' => Str::slug($p['name']) . '-' . rand(1000, 9999),
                'description' => $p['description'],
                'price' => $p['price'],
                'discount_price' => $p['discount_price'],
                'discount_percentage' => round((($p['price'] - $p['discount_price']) / $p['price']) * 100),
                'stock' => rand(50, 100),
                'colors' => $p['colors'],
                'sizes' => $p['sizes'],
                'images' => $p['images'],
                'video' => $p['video'],
                'is_featured' => $p['is_featured'],
                'is_trending' => $p['is_trending'],
                'status' => true,
            ]);

            // Create Variations
            foreach ($p['colors'] as $color) {
                foreach ($p['sizes'] as $size) {
                    ProductVariation::create([
                        'product_id' => $product->id,
                        'color' => $color,
                        'size' => $size,
                        'price' => $p['discount_price'] + rand(-100, 200),
                        'stock' => rand(5, 20),
                    ]);
                }
            }
        }
    }
}
