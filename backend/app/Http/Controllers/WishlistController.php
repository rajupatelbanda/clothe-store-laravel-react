<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Wishlist::where('user_id', $request->user()->id)->with('product')->get());
    }

    public function store(Request $request)
    {
        $request->validate(['product_id' => 'required|exists:products,id']);

        $exists = Wishlist::where('user_id', $request->user()->id)
                          ->where('product_id', $request->product_id)
                          ->first();

        if ($exists) {
            return response()->json(['message' => 'Product already in wishlist'], 422);
        }

        $wishlist = Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
        ]);

        return response()->json($wishlist->load('product'), 201);
    }

    public function destroy(Wishlist $wishlist, Request $request)
    {
        if ($wishlist->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $wishlist->delete();
        return response()->json(['message' => 'Removed from wishlist']);
    }
}
