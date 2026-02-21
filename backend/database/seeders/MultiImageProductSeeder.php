<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MultiImageProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Urban Explorer Set',
                'category_id' => 1, // Men's Wear
                'brand_id' => 4, // Zara
                'price' => 145.00,
                'discount_price' => 129.00,
                'description' => 'A complete urban outfit designed for the modern city dweller. Features a premium cotton blend and relaxed fit.',
                'images' => [
                    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000',
                    'https://images.unsplash.com/photo-1523381294911-8d3ebad063b8?q=80&w=1000',
                    'https://images.unsplash.com/photo-1523381140794-a1eef18a37c7?q=80&w=1000',
                    'https://images.unsplash.com/photo-1479064566235-aa6a0068a80b?q=80&w=1000'
                ],
            ],
            [
                'name' => 'Summer Floral Breeze',
                'category_id' => 2, // Women's Wear
                'brand_id' => 5, // H&M
                'price' => 75.00,
                'discount_price' => 59.99,
                'description' => 'Lightweight and breathable floral dress perfect for summer garden parties and beach walks.',
                'images' => [
                    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000',
                    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1000',
                    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000',
                    'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=1000'
                ],
            ],
            [
                'name' => 'Peak Performance Boots',
                'category_id' => 4, // Shoes
                'brand_id' => 2, // Adidas
                'price' => 185.00,
                'discount_price' => 165.00,
                'description' => 'Professional-grade trekking boots with superior ankle support and weatherproofing.',
                'images' => [
                    'https://images.unsplash.com/photo-1520639889313-7274a616ea1d?q=80&w=1000',
                    'https://images.unsplash.com/photo-1533681018184-68bd1d8f39fe?q=80&w=1000',
                    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1000',
                    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000'
                ],
            ],
            [
                'name' => 'Midnight Gold Chrono',
                'category_id' => 5, // Accessories
                'brand_id' => 7, // Prada
                'price' => 850.00,
                'discount_price' => 749.00,
                'description' => 'A statement timepiece combining midnight black aesthetics with 18k gold accents.',
                'images' => [
                    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000',
                    'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000',
                    'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000',
                    'https://images.unsplash.com/photo-1508685096489-7aac296211f5?q=80&w=1000'
                ],
            ],
            [
                'name' => 'Zen Master Yoga Kit',
                'category_id' => 8, // Activewear
                'brand_id' => 1, // Nike
                'price' => 110.00,
                'discount_price' => null,
                'description' => 'Complete yoga kit including an eco-friendly mat, cork blocks, and a high-tension strap.',
                'images' => [
                    'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=1000',
                    'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=1000',
                    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000',
                    'https://images.unsplash.com/photo-1588282322673-c31965a75c3e?q=80&w=1000'
                ],
            ],
        ];

        foreach ($products as $p) {
            $product = Product::create([
                'category_id' => $p['category_id'],
                'brand_id' => $p['brand_id'],
                'name' => $p['name'],
                'slug' => Str::slug($p['name']) . '-' . (time() + rand(1, 1000)),
                'description' => $p['description'],
                'price' => $p['price'],
                'discount_price' => $p['discount_price'],
                'discount_percentage' => $p['discount_price'] ? round((($p['price'] - $p['discount_price']) / $p['price']) * 100) : null,
                'stock' => 35,
                'video' => 'products/videos/sample.mp4',
                'images' => $p['images'],
                'is_featured' => true,
                'status' => true,
            ]);

            // Variations
            $colors = ['Stone', 'Charcoal', 'Earth'];
            $sizes = ['Standard'];

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
