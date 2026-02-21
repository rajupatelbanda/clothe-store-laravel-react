<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSlugFixSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        foreach ($products as $product) {
            $product->update([
                'slug' => Str::slug($product->name) . '-' . $product->id
            ]);
        }
    }
}
