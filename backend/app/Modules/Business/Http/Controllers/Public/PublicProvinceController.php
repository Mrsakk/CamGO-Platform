<?php

namespace App\Modules\Business\Http\Controllers\Public;

use App\Http\Controllers\Api\ApiController;
use App\Models\Province;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PublicProvinceController extends ApiController
{
    public function index(): JsonResponse
    {
        $provinces = Cache::remember('biz:public:provinces', 600, function () {
            return Province::whereNull('deleted_at')
                ->withCount(['destinations'])
                ->get()
                ->map(function ($p) {
                    $bizCount = \App\Modules\Business\Models\Business::where('province_id', $p->id)
                        ->published()
                        ->count();

                    return [
                        'id' => $p->id,
                        'slug' => $p->slug,
                        'name_km' => $p->name_km,
                        'name_en' => $p->name_en,
                        'image' => $p->image,
                        'latitude' => $p->latitude,
                        'longitude' => $p->longitude,
                        'businesses_count' => $bizCount,
                    ];
                });
        });

        return response()->json([
            'success' => true,
            'message' => 'Provinces retrieved',
            'data' => $provinces,
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
    }
}
