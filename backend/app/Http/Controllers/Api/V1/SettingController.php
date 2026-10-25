<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends ApiController
{
    /**
     * Get public site settings.
     */
    public function index(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        return $this->successResponse($settings, 'Settings retrieved');
    }
}
