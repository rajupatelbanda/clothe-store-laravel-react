<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        return response()->json(Setting::first());
    }

    public function update(Request $request)
    {
        $request->validate([
            'site_name' => 'required|string',
            'logo' => 'nullable|image|max:2048',
            'favicon' => 'nullable|image|max:1024',
        ]);

        $setting = Setting::first();
        $data = $request->except(['logo', 'favicon']);

        if ($request->hasFile('logo')) {
            if ($setting->logo) Storage::disk('public')->delete($setting->logo);
            $data['logo'] = $request->file('logo')->store('settings', 'public');
        }

        if ($request->hasFile('favicon')) {
            if ($setting->favicon) Storage::disk('public')->delete($setting->favicon);
            $data['favicon'] = $request->file('favicon')->store('settings', 'public');
        }

        $setting->update($data);
        return response()->json($setting);
    }
}
