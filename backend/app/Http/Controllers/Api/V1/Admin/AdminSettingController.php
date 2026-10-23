<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class AdminSettingController extends ApiController
{
    /**
     * Get all settings grouped.
     */
    public function index(): JsonResponse
    {
        $all = Setting::all();
        return $this->successResponse([
            'items' => $all,
            'grouped' => $all->groupBy('group'),
        ]);
    }

    /**
     * Batch update site settings.
     */
    public function update(Request $request): JsonResponse
    {
        $settingsInput = $request->input('settings', $request->all());
        if (!is_array($settingsInput)) {
            $settingsInput = [];
        }

        foreach ($settingsInput as $item) {
            if (is_array($item) && isset($item['key'])) {
                Setting::set($item['key'], $item['value'] ?? null, $item['group'] ?? 'general');
            }
        }

        Cache::forget('all_public_settings');
        Cache::forget('all_settings');
        Cache::flush();
        AuditLog::record('settings_updated', 'Setting', null, $settingsInput);

        return $this->successResponse(null, 'Settings updated successfully');
    }

    /**
     * Upload website logo image.
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp,ico|max:4096',
        ]);

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $path = $file->store('settings', 'public');
            $url = Storage::url($path);

            Setting::set('logo_url', $url, 'general');

            Cache::forget('setting_logo_url');
            Cache::forget('all_public_settings');
            Cache::forget('all_settings');
            Cache::flush();

            AuditLog::record('logo_uploaded', 'Setting', null, ['logo_url' => $url]);

            return $this->successResponse([
                'logo_url' => $url,
            ], 'Logo uploaded successfully');
        }

        return $this->errorResponse('No image file provided', 400);
    }

    /**
     * Upload website favicon image.
     */
    public function uploadFavicon(Request $request): JsonResponse
    {
        $request->validate([
            'favicon' => 'required|file|mimes:jpeg,png,jpg,ico,svg,webp|max:2048',
        ]);

        if ($request->hasFile('favicon')) {
            $file = $request->file('favicon');
            $path = $file->store('settings', 'public');
            $url = Storage::url($path);

            Setting::set('favicon_url', $url, 'general');

            Cache::forget('setting_favicon_url');
            Cache::forget('all_public_settings');
            Cache::forget('all_settings');
            Cache::flush();

            AuditLog::record('favicon_uploaded', 'Setting', null, ['favicon_url' => $url]);

            return $this->successResponse([
                'favicon_url' => $url,
            ], 'Favicon uploaded successfully');
        }

        return $this->errorResponse('No favicon file provided', 400);
    }
}

