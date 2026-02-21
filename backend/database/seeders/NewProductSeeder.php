<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NewProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Elite Tech Hoodie',
                'category_id' => 1, // Men's Wear
                'brand_id' => 1, // Nike
                'price' => 89.99,
                'discount_price' => 74.99,
                'description' => 'A premium tech hoodie designed for maximum comfort and style.',
                'images' => ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000'],
            ],
            [
                'name' => 'Swift Runner v2',
                'category_id' => 4, // Shoes
                'brand_id' => 9, // Reebok
                'price' => 120.00,
                'discount_price' => 99.00,
                'description' => 'Lightweight running shoes for high-performance training.',
                'images' => ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000'],
            ],
            [
                'name' => 'Classic Denim Jacket',
                'category_id' => 10, // Casual Wear
                'brand_id' => 8, // Levis
                'price' => 95.00,
                'discount_price' => null,
                'description' => 'The original denim jacket since 1967. A versatile layer.',
                'images' => ['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=1000'],
            ],
            [
                'name' => 'Minimalist Leather Bag',
                'category_id' => 5, // Accessories
                'brand_id' => 7, // Prada
                'price' => 450.00,
                'discount_price' => 399.00,
                'description' => 'Handcrafted premium leather bag for the modern professional.',
                'images' => ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000'],
            ],
            [
                'name' => 'Winter Parka Coat',
                'category_id' => 7, // Winter Collection
                'brand_id' => 4, // Zara
                'price' => 180.00,
                'discount_price' => 149.00,
                'description' => 'Heavy-duty insulated parka for extreme winter protection.',
                'images' => ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000'],
            ],
        ];

        foreach ($products as $p) {
            $product = Product::create([
                'category_id' => $p['category_id'],
                'brand_id' => $p['brand_id'],
                'name' => $p['name'],
                'slug' => Str::slug($p['name']) . '-' . time(),
                'description' => $p['description'],
                'price' => $p['price'],
                'discount_price' => $p['discount_price'],
                'discount_percentage' => $p['discount_price'] ? round((($p['price'] - $p['discount_price']) / $p['price']) * 100) : null,
                'stock' => 50,
                'video' => 'products/videos/sample.mp4',
                'images' => $p['images'],
                'is_featured' => true,
                'status' => true,
            ]);

            // Add variations
            $colors = ['Black', 'White', 'Blue'];
            $sizes = ['S', 'M', 'L', 'XL'];

            foreach ($colors as $color) {
                foreach ($sizes as $size) {
                    ProductVariation::create([
                        'product_id' => $product->id,
                        'color' => $color,
                        'size' => $size,
                        'price' => $product->price,
                        'stock' => 10,
                    ]);
                }
            }
        }
    }
}
