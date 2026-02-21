<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'user')->get();
        $products = Product::all();

        if ($users->isEmpty() || $products->isEmpty()) return;

        // Generate 20 Successful/Paid Orders
        for ($i = 0; $i < 20; $i++) {
            $user = $users->random();
            $total = rand(150, 1500);
            
            $order = Order::create([
                'user_id' => $user->id,
                'total' => $total,
                'status' => ['pending', 'processing', 'shipped', 'delivered'][rand(0, 3)],
                'payment_id' => 'pay_' . Str::random(14),
                'payment_status' => 'paid', // All these are success/paid
                'payment_method' => 'razorpay',
                'address' => rand(100, 999) . ' Luxury Fashion Ave, Style City',
                'phone' => $user->phone ?? '+919908440688',
            ]);

            // Add 2-4 items per order
            $itemCount = rand(2, 4);
            for ($j = 0; $j < $itemCount; $j++) {
                $p = $products->random();
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $p->id,
                    'quantity' => rand(1, 3),
                    'price' => $p->discount_price || $p->price,
                    'color' => $p->colors ? $p->colors[array_rand($p->colors)] : 'Default',
                    'size' => $p->sizes ? $p->sizes[array_rand($p->sizes)] : 'M',
                ]);
            }
        }
    }
}
