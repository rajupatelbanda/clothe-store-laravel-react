<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $query = Coupon::with(['category', 'product', 'user'])->latest();
        if ($request->has('admin')) {
            return response()->json($query->paginate(10));
        }
        return response()->json($query->where('status', true)->get());
    }

    public function apply(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'cart_items' => 'required|array',
        ]);

        $coupon = Coupon::where('code', $request->code)
            ->where('status', true)
            ->where(function ($q) {
                $q->whereNull('valid_from')->orWhere('valid_from', '<=', Carbon::now());
            })
            ->where(function ($q) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>=', Carbon::now());
            })
            ->first();

        if (!$coupon) {
            return response()->json(['message' => 'Invalid or expired coupon code'], 422);
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json(['message' => 'Coupon usage limit reached'], 422);
        }

        if ($coupon->user_id && $coupon->user_id != auth()->id()) {
            return response()->json(['message' => 'This coupon is not for your account'], 422);
        }

        // Validate items
        $validItems = collect($request->cart_items);
        
        if ($coupon->category_id) {
            $validItems = $validItems->filter(fn($item) => $item['category_id'] == $coupon->category_id);
        }

        if ($coupon->product_id) {
            $validItems = $validItems->filter(fn($item) => $item['product_id'] == $coupon->product_id);
        }

        if ($validItems->isEmpty()) {
            return response()->json(['message' => 'Coupon is not applicable to the items in your cart'], 422);
        }

        $totalEligibleAmount = $validItems->sum(fn($item) => $item['price'] * $item['quantity']);
        $discount = 0;

        if ($coupon->type === 'fixed') {
            $discount = min($coupon->value, $totalEligibleAmount);
        } else {
            $discount = ($totalEligibleAmount * $coupon->value) / 100;
        }

        return response()->json([
            'coupon' => $coupon,
            'discount' => round($discount, 2),
            'message' => 'Coupon applied successfully!'
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|unique:coupons',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric',
            'usage_limit' => 'nullable|integer',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date',
        ]);

        $coupon = Coupon::create($request->all());
        return response()->json($coupon, 201);
    }

    public function update(Request $request, Coupon $coupon)
    {
        $request->validate([
            'code' => 'required|unique:coupons,code,' . $coupon->id,
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric',
        ]);

        $coupon->update($request->all());
        return response()->json($coupon);
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();
        return response()->json(['message' => 'Coupon deleted']);
    }
}
