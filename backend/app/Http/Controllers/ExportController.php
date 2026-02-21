<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    public function exportExcel($type)
    {
        $model = $this->getModel($type);
        if (!$model) return response()->json(['message' => 'Invalid type'], 400);
        
        $data = $model::all();
        
        return Excel::download(new class($data) implements \Maatwebsite\Excel\Concerns\FromCollection, \Maatwebsite\Excel\Concerns\WithHeadings {
            protected $data;
            public function __construct($data) { $this->data = $data; }
            public function collection() { return $this->data; }
            public function headings(): array {
                return $this->data->count() > 0 ? array_keys($this->data->first()->toArray()) : [];
            }
        }, "$type.xlsx");
    }

    public function exportPdf($type)
    {
        $model = $this->getModel($type);
        if (!$model) return response()->json(['message' => 'Invalid type'], 400);
        
        $data = $model::all();
        $pdf = Pdf::loadView('exports.pdf', ['data' => $data, 'type' => $type]);
        
        // Use stream() for instant display or download() for forced download
        return $pdf->download("$type.pdf");
    }

    private function getModel($type)
    {
        switch($type) {
            case 'products': return Product::class;
            case 'categories': return Category::class;
            case 'brands': return Brand::class;
            case 'orders': return Order::class;
            default: return null;
        }
    }
}
