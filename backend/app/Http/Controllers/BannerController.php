<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        $query = Banner::latest();
        
        if (!$request->has('admin')) {
            $query->where('status', true);
        }

        if ($request->has('page')) {
            $query->where('page', $request->page);
        }

        if ($request->has('admin')) {
            return response()->json($query->paginate(10));
        }
        
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'page' => 'required|string',
            'image' => 'required|image|max:2048',
            'link' => 'nullable|string',
            'title' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $path = $request->file('image')->store('banners', 'public');

        $banner = Banner::create([
            'page' => $request->page,
            'title' => $request->title,
            'link' => $request->link,
            'image' => $path,
            'status' => $request->status ?? true
        ]);

        return response()->json($banner, 201);
    }

    public function update(Request $request, Banner $banner)
    {
        $request->validate([
            'page' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'link' => 'nullable|string',
            'title' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $data = $request->only(['page', 'title', 'link', 'status']);

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($banner->image);
            $data['image'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);
        return response()->json($banner);
    }

    public function destroy(Banner $banner)
    {
        Storage::disk('public')->delete($banner->image);
        $banner->delete();
        return response()->json(['message' => 'Banner deleted']);
    }
}
