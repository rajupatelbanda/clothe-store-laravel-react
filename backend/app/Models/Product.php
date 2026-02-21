<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'subcategory_id', 'brand_id', 'name', 'slug', 'description', 
        'price', 'discount_price', 'discount_percentage', 'stock', 'colors', 'sizes', 
        'images', 'video', 'is_featured', 'is_trending', 'status'
    ];

    protected $casts = [
        'colors' => 'array',
        'sizes' => 'array',
        'images' => 'array',
        'is_featured' => 'boolean',
        'is_trending' => 'boolean',
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2'
    ];

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function variations()
    {
        return $this->hasMany(ProductVariation::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class)->with('user')->latest();
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
