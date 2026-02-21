<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['user', 'product']);
        
        if ($request->has('admin')) {
            // Admin sees everything
        } else {
            // Public only sees approved
            $query->where('is_approved', true);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
        ]);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_approved' => false, // Always false on creation for manual approval
        ]);

        return response()->json($review->load('user'), 201);
    }

    public function updateStatus(Request $request, Review $review)
    {
        $request->validate(['is_approved' => 'required|boolean']);
        $review->update(['is_approved' => $request->is_approved]);
        return response()->json(['message' => 'Review status updated successfully', 'review' => $review]);
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return response()->json(['message' => 'Review deleted']);
    }
}
