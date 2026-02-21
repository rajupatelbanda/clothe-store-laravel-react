<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $order->id }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; line-height: 1.6; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #FF5E78; padding-bottom: 20px; }
        .title { color: #FF5E78; font-size: 30px; font-weight: bold; }
        .info { margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        th { background: #f8f9fa; border-bottom: 1px solid #dee2e6; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .total { margin-top: 30px; text-align: right; font-size: 20px; font-weight: bold; color: #FF5E78; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div className="invoice-box">
        <div className="header">
            <div className="title">GEMINI CLOTH STORE</div>
            <div style="text-align: right">
                <strong>Invoice #{{ $order->id }}</strong><br>
                Date: {{ $order->created_at->format('d M Y') }}
            </div>
        </div>

        <div className="info">
            <div style="width: 50%; float: left">
                <strong>Billed To:</strong><br>
                {{ $order->user->name }}<br>
                {{ $order->user->email }}<br>
                Phone: {{ $order->phone }}
            </div>
            <div style="width: 50%; float: right; text-align: right">
                <strong>Shipping Address:</strong><br>
                {{ $order->address }}
            </div>
            <div style="clear: both;"></div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Specs</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->orderItems as $item)
                <tr>
                    <td>{{ $item->product->name }}</td>
                    <td>{{ $item->size }} / {{ $item->color }}</td>
                    <td>${{ number_format($item->price, 2) }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>${{ number_format($item->price * $item->quantity, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div className="total">
            Grand Total: ${{ number_format($order->total, 2) }}
        </div>

        <div className="footer">
            Thank you for shopping with Gemini Cloth Store!<br>
            Visit us again at: www.geministore.com
        </div>
    </div>
</body>
</html>
