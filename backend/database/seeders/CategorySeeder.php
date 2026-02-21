<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Men\'s Wear' => 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=1000',
            'Women\'s Wear' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000',
            'Kids Wear' => 'https://images.unsplash.com/photo-1519704943920-18447022755b?q=80&w=1000',
            'Shoes' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000',
            'Accessories' => 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000',
            'Summer Collection' => 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000',
            'Winter Collection' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000',
            'Activewear' => 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000',
            'Formal Wear' => 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000',
            'Casual Wear' => 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=1000'
        ];

        foreach ($categories as $name => $img) {
            Category::updateOrCreate(['name' => $name], [
                'slug' => Str::slug($name),
                'image' => $img, // Using direct URL for dummy seed
            ]);
        }
    }
}
