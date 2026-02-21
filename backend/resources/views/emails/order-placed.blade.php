<!DOCTYPE html>
<html>
<head>
    <title>Order Confirmation</title>
</head>
<body>
    <h1>Thank you for your order!</h1>
    <p>Order ID: {{ $order->id }}</p>
    <p>Total: ${{ $order->total }}</p>
    <p>Status: {{ $order->status }}</p>
    <p>Address: {{ $order->address }}</p>
    <p>Phone: {{ $order->phone }}</p>
    
    <h2>Items:</h2>
    <ul>
        @foreach($order->orderItems as $item)
            <li>{{ $item->product->name }} - {{ $item->quantity }} x ${{ $item->price }}</li>
        @endforeach
    </ul>
</body>
</html>
