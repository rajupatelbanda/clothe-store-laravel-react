<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;

class ImportController extends Controller
{
    public function import(Request $request, $type)
    {
        $request->validate(['file' => 'required|mimes:xlsx,xls,csv']);

        try {
            $data = Excel::toArray(new class implements \Maatwebsite\Excel\Concerns\ToCollection {
                public function collection(\Illuminate\Support\Collection $collection) {}
            }, $request->file('file'))[0];

            if (count($data) < 2) return response()->json(['message' => 'File is empty'], 400);

            $headers = array_shift($data);

            foreach ($data as $row) {
                $item = array_combine($headers, $row);
                $this->processItem($type, $item);
            }

            return response()->json(['message' => ucfirst($type) . ' imported successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    private function processItem($type, $item)
    {
        switch ($type) {
            case 'categories':
                Category::updateOrCreate(['name' => $item['name']], [
                    'slug' => Str::slug($item['name']),
                    'image' => $item['image'] ?? null
                ]);
                break;
            case 'brands':
                Brand::updateOrCreate(['name' => $item['name']], [
                    'slug' => Str::slug($item['name']),
                    'image' => $item['image'] ?? null
                ]);
                break;
            case 'products':
                Product::updateOrCreate(['name' => $item['name']], [
                    'category_id' => $item['category_id'],
                    'brand_id' => $item['brand_id'],
                    'slug' => Str::slug($item['name']) . '-' . time(),
                    'description' => $item['description'] ?? '',
                    'price' => $item['price'],
                    'discount_price' => $item['discount_price'] ?? null,
                    'stock' => $item['stock'] ?? 0,
                ]);
                break;
        }
    }
}
