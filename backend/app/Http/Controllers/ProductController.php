<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'subcategory']);

        if (!$request->has('admin')) {
            $query->where('status', true);
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('categories')) {
            $catIds = explode(',', $request->categories);
            $query->whereIn('category_id', $catIds);
        }

        if ($request->filled('brands')) {
            $brandIds = explode(',', $request->brands);
            $query->whereIn('brand_id', $brandIds);
        }

        if ($request->filled('subcategory')) {
            $query->where('subcategory_id', $request->subcategory);
        }

        if ($request->filled('brand')) {
            $query->where('brand_id', $request->brand);
        }

        if ($request->filled('search')) {
            $query->where('name', 'LIKE', '%' . $request->search . '%');
        }

        if ($request->filled('price_max')) {
            $query->where(function($q) use ($request) {
                $q->where('discount_price', '<=', $request->price_max)
                  ->orWhere(function($sq) use ($request) {
                      $sq->whereNull('discount_price')->where('price', '<=', $request->price_max);
                  });
            });
        }

        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'a-z': $query->orderBy('name', 'asc'); break;
            case 'z-a': $query->orderBy('name', 'desc'); break;
            case 'price-low': $query->orderByRaw('COALESCE(discount_price, price) asc'); break;
            case 'price-high': $query->orderByRaw('COALESCE(discount_price, price) desc'); break;
            default: $query->latest(); break;
        }

        return response()->json($query->paginate($request->get('limit', 12)));
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['category', 'brand', 'subcategory', 'variations', 'reviews' => function($q) {
            $q->where('is_approved', true)->with('user');
        }]));
    }

    public function featured()
    {
        return response()->json(Product::where('status', true)->where('is_featured', true)->with(['category', 'brand', 'subcategory'])->limit(8)->get());
    }

    public function trending()
    {
        return response()->json(Product::where('status', true)->where('is_trending', true)->with(['category', 'brand', 'subcategory'])->limit(8)->get());
    }

    public function lowStock()
    {
        return response()->json(Product::where('stock', '<=', 5)->with(['category', 'brand'])->get());
    }

    public function updateStock(Request $request, Product $product)
    {
        $request->validate(['stock' => 'required|integer|min:0']);
        $product->update(['stock' => $request->stock]);
        return response()->json(['message' => 'Stock updated successfully', 'product' => $product]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'discount_price' => 'nullable|numeric',
            'images.*' => 'nullable|image|max:2048',
            'video' => 'nullable|mimes:mp4,mov,ogg,qt|max:20000', // 20MB max
        ]);

        DB::beginTransaction();
        try {
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $imagePaths[] = $image->store('products', 'public');
                }
            }

            $videoPath = null;
            if ($request->hasFile('video')) {
                $videoPath = $request->file('video')->store('products/videos', 'public');
            }

            $discountPercentage = null;
            if ($request->discount_price && $request->price > 0) {
                $discountPercentage = round((($request->price - $request->discount_price) / $request->price) * 100);
            }

            $product = Product::create([
                'category_id' => $request->category_id,
                'subcategory_id' => $request->subcategory_id,
                'brand_id' => $request->brand_id,
                'name' => $request->name,
                'slug' => Str::slug($request->name) . '-' . time(),
                'description' => $request->description,
                'price' => $request->price,
                'discount_price' => $request->discount_price,
                'discount_percentage' => $discountPercentage,
                'stock' => $request->stock ?? 0,
                'video' => $videoPath,
                'images' => $imagePaths,
                'is_featured' => $request->is_featured === 'true' || $request->is_featured === true,
            ]);

            // Handle Variations
            if ($request->has('variations')) {
                $variations = is_string($request->variations) ? json_decode($request->variations, true) : $request->variations;
                foreach ($variations as $var) {
                    ProductVariation::create([
                        'product_id' => $product->id,
                        'color' => $var['color'] ?? null,
                        'size' => $var['size'] ?? null,
                        'price' => $var['price'] ?? $product->price,
                        'stock' => $var['stock'] ?? 0,
                    ]);
                }
            }

            DB::commit();
            return response()->json($product, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, Product $product)
    {
        DB::beginTransaction();
        try {
            $data = $request->except(['images', 'video', 'variations']);
            
            if ($request->hasFile('images')) {
                foreach ($product->images ?? [] as $path) {
                    if (!str_starts_with($path, 'http')) Storage::disk('public')->delete($path);
                }
                $imagePaths = [];
                foreach ($request->file('images') as $image) {
                    $imagePaths[] = $image->store('products', 'public');
                }
                $data['images'] = $imagePaths;
            }

            if ($request->hasFile('video')) {
                if ($product->video) Storage::disk('public')->delete($product->video);
                $data['video'] = $request->file('video')->store('products/videos', 'public');
            }

            if ($request->has('price') || $request->has('discount_price')) {
                $price = $request->price ?? $product->price;
                $disc = $request->discount_price ?? $product->discount_price;
                if ($disc && $price > 0) {
                    $data['discount_percentage'] = round((($price - $disc) / $price) * 100);
                } else {
                    $data['discount_percentage'] = null;
                }
            }

            $product->update($data);

            // Update Variations
            if ($request->has('variations')) {
                $product->variations()->delete();
                $variations = is_string($request->variations) ? json_decode($request->variations, true) : $request->variations;
                foreach ($variations as $var) {
                    ProductVariation::create([
                        'product_id' => $product->id,
                        'color' => $var['color'] ?? null,
                        'size' => $var['size'] ?? null,
                        'price' => $var['price'] ?? $product->price,
                        'stock' => $var['stock'] ?? 0,
                    ]);
                }
            }

            DB::commit();
            return response()->json($product);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function destroy(Product $product)
    {
        foreach ($product->images ?? [] as $path) {
            if (!str_starts_with($path, 'http')) Storage::disk('public')->delete($path);
        }
        if ($product->video) Storage::disk('public')->delete($product->video);
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}
