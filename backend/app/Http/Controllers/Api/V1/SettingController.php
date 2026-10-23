<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class SettingController extends ApiController
{
    /**
     * Get public site settings.
     */
    public function index(): JsonResponse
    {
        $settings = Cache::remember('all_public_settings', 3600, function () {
            return Setting::all()->pluck('value', 'key');
        });

        return $this->successResponse($settings, 'Settings retrieved');
    }
}
