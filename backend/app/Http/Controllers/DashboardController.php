<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'products' => Product::count(),
            'orders' => Order::count(),
            'users' => User::count(),
            'revenue' => Order::where('payment_status', 'paid')->sum('total'),
            'low_stock' => Product::where('stock', '<=', 5)->count(),
        ]);
    }
}
