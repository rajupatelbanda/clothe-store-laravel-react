<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariation;
use App\Models\User;
use App\Models\Coupon;
use App\Notifications\OrderPlacedNotification;
use App\Notifications\OrderStatusNotification;
use App\Notifications\LowStockNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    public function index()
    {
        if (request()->user()->role === 'admin') {
            return response()->json(Order::with(['user', 'orderItems.product'])->latest()->get());
        }
        return response()->json(Order::where('user_id', request()->user()->id)->with(['orderItems.product'])->latest()->get());
    }

    public function show(Order $order)
    {
        if (request()->user()->role !== 'admin' && $order->user_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($order->load(['user', 'orderItems.product']));
    }

    public function track($id)
    {
        $order = Order::with(['user', 'orderItems.product'])->findOrFail($id);
        return response()->json($order);
    }

    public function downloadInvoice($id)
    {
        $order = Order::with(['user', 'orderItems.product'])->findOrFail($id);
        
        if (request()->user()->role !== 'admin' && $order->user_id !== request()->user()->id) {
            abort(403);
        }

        $pdf = Pdf::loadView('exports.invoice', ['order' => $order]);
        return $pdf->download("Gemini_Invoice_{$id}.pdf");
    }

        $request->validate([
            'items' => 'required|array',
            'total' => 'required|numeric',
            'shipping' => 'required|numeric',
            'address' => 'required|string',
            'phone' => 'required|string',
            'payment_method' => 'required|string|in:razorpay,cod',
            'payment_id' => 'required_if:payment_method,razorpay|nullable|string',
            'payment_status' => 'required|string',
            'coupon_id' => 'nullable|exists:coupons,id'
        ]);

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id' => $request->user()->id,
                'coupon_id' => $request->coupon_id,
                'total' => $request->total,
                'shipping' => $request->shipping,
                'status' => 'processing',
                'address' => $request->address,
                'phone' => $request->phone,
                'payment_id' => $request->payment_id,
                'payment_status' => $request->payment_status,
                'payment_method' => $request->payment_method,
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'color' => $item['color'] ?? null,
                    'size' => $item['size'] ?? null,
                ]);

                $this->handleStockReduction($item);
            }

            if ($request->coupon_id) {
                Coupon::find($request->coupon_id)->increment('used_count');
            }

            DB::commit();

            $user = $request->user();
            $notification = new OrderPlacedNotification($order->load(['user', 'orderItems.product']));
            $user->notify($notification);
            
            $phone = $order->phone ?? $user->phone;
            if ($phone) {
                $notification->sendWhatsApp($phone);
            }

            return response()->json($order, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    private function handleStockReduction($item)
    {
        $variation = ProductVariation::where('product_id', $item['product_id'])
            ->where('color', $item['color'])
            ->where('size', $item['size'])
            ->first();

        if ($variation) {
            $variation->decrement('stock', $item['quantity']);
            if ($variation->stock <= 5) {
                $this->notifyAdminLowStock($variation->product, $variation);
            }
        } else {
            $product = Product::find($item['product_id']);
            if ($product) {
                $product->decrement('stock', $item['quantity']);
                if ($product->stock <= 5) {
                    $this->notifyAdminLowStock($product);
                }
            }
        }
    }

    private function notifyAdminLowStock($product, $variation = null)
    {
        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            $notification = new LowStockNotification($product, $variation);
            $admin->notify($notification);
            if ($admin->phone) {
                $notification->sendWhatsApp($admin->phone);
            }
        }
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate(['status' => 'required|string']);
        $order->update(['status' => $request->status]);
        
        $user = $order->user;
        $notification = new OrderStatusNotification($order);
        $user->notify($notification);
        
        $phone = $order->phone ?? $user->phone;
        if ($phone) {
            $notification->sendWhatsApp($phone);
        }

        return response()->json($order);
    }
}
