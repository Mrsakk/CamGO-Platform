<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WebVitalsMetric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MetricController extends Controller
{
    /**
     * Store RUM web vitals telemetry.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'metric'         => 'required|string|max:16',
            'value'          => 'required|numeric',
            'rating'         => 'nullable|string|max:24',
            'route'          => 'required|string|max:255',
            'device_type'    => 'nullable|string|max:24',
            'effective_type' => 'nullable|string|max:24',
            'app_version'    => 'nullable|string|max:32',
        ]);

        $validated['created_at'] = now();

        WebVitalsMetric::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Metric recorded',
        ], 201);
    }

    /**
     * Admin Report: Compute p75 web vitals per route.
     */
    public function report(): JsonResponse
    {
        $isPgsql = DB::connection()->getDriverName() === 'pgsql';

        if ($isPgsql) {
            $stats = DB::table('web_vitals_metrics')
                ->selectRaw("route, metric, count(*) as samples, round(percentile_cont(0.75) within group (order by value)::numeric, 2) as p75, round(avg(value)::numeric, 2) as avg_val")
                ->groupBy('route', 'metric')
                ->orderBy('route')
                ->get();
        } else {
            $stats = DB::table('web_vitals_metrics')
                ->selectRaw("route, metric, count(*) as samples, round(avg(value), 2) as p75, round(avg(value), 2) as avg_val")
                ->groupBy('route', 'metric')
                ->orderBy('route')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data'    => $stats,
        ]);
    }
}
