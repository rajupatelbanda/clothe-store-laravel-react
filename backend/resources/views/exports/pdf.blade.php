<!DOCTYPE html>
<html>
<head>
    <title>Export {{ ucfirst($type) }}</title>
    <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h2>{{ ucfirst($type) }} List</h2>
    <table>
        <thead>
            <tr>
                @if(count($data) > 0)
                    @foreach(array_keys($data[0]->toArray()) as $key)
                        <th>{{ ucfirst($key) }}</th>
                    @endforeach
                @endif
            </tr>
        </thead>
        <tbody>
            @foreach($data as $item)
                <tr>
                    @foreach($item->toArray() as $value)
                        <td>{{ is_array($value) ? json_encode($value) : $value }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
