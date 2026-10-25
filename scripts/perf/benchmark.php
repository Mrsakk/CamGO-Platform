<?php

/**
 * Repeatable Backend Performance Benchmark
 * Usage: php scripts/perf/benchmark.php
 */

$baseDir = dirname(__DIR__, 2);
require $baseDir . '/backend/vendor/autoload.php';
$app = require_once $baseDir . '/backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$owner = \App\Models\User::where('email', 'owner@khemaramorodok.com')->first();
$ownerToken = null;
if ($owner) {
    $ownerToken = $owner->createToken('perf-benchmark')->plainTextToken;
}

$dest = \App\Models\Destination::first();
$destSlug = $dest ? $dest->slug : 'angkor-wat';

$biz = \App\Modules\Business\Models\Business::first();
$bizSlug = $biz ? $biz->slug : 'angkor-heritage-retreat';

$endpoints = [
    ['GET', '/api/v1/home', false],
    ['GET', '/api/v1/destinations', false],
    ['GET', '/api/v1/destinations/' . $destSlug, false],
    ['GET', '/api/v1/categories', false],
    ['GET', '/api/v1/provinces', false],
    ['GET', '/api/v1/business/public/home', false],
    ['GET', '/api/v1/business/public/businesses', false],
    ['GET', '/api/v1/business/public/businesses/' . $bizSlug, false],
    ['GET', '/api/v1/business/public/categories', false],
];

if ($ownerToken) {
    $endpoints[] = ['GET', '/api/v1/business/owner/my-business', true];
    $endpoints[] = ['GET', '/api/v1/business/owner/stats', true];
    $endpoints[] = ['GET', '/api/v1/business/owner/leads', true];
}

$iterations = 5;
$results = [];

echo "=================================================================================\n";
echo "  KhemaraMorodok / CamGO Repeatable API Benchmark\n";
echo "  Testing " . count($endpoints) . " endpoints across " . $iterations . " iterations\n";
echo "=================================================================================\n\n";

foreach ($endpoints as [$method, $uri, $isAuth]) {
    $times = [];
    $queryCounts = [];
    $rawSizes = [];
    $gzipSizes = [];
    $statuses = [];

    for ($i = 0; $i < $iterations; $i++) {
        \Illuminate\Support\Facades\DB::flushQueryLog();
        \Illuminate\Support\Facades\DB::enableQueryLog();

        $start = microtime(true);
        $req = \Illuminate\Http\Request::create($uri, $method);
        $req->headers->set('Accept', 'application/json');
        if ($isAuth && $ownerToken) {
            $req->headers->set('Authorization', 'Bearer ' . $ownerToken);
        }

        $res = $kernel->handle($req);
        $duration = (microtime(true) - $start) * 1000;

        $content = $res->getContent();
        $rawSize = strlen($content);
        $gzipSize = strlen(gzencode($content, 6));

        $times[] = $duration;
        $queryCounts[] = count(\Illuminate\Support\Facades\DB::getQueryLog());
        $rawSizes[] = $rawSize;
        $gzipSizes[] = $gzipSize;
        $statuses[] = $res->getStatusCode();

        $kernel->terminate($req, $res);
    }

    sort($times);
    $p50 = $times[(int) (count($times) * 0.5)];
    $p95 = $times[(int) (count($times) * 0.95)];
    $avgQuery = round(array_sum($queryCounts) / count($queryCounts), 1);
    $avgRawKb = round((array_sum($rawSizes) / count($rawSizes)) / 1024, 2);
    $avgGzipKb = round((array_sum($gzipSizes) / count($gzipSizes)) / 1024, 2);

    $results[] = [
        'endpoint' => $uri,
        'status' => $statuses[0],
        'p50_ms' => round($p50, 1),
        'p95_ms' => round($p95, 1),
        'queries' => $avgQuery,
        'raw_kb' => $avgRawKb,
        'gzip_kb' => $avgGzipKb,
    ];

    printf("%-52s | Status: %3d | p50: %6.1fms | p95: %6.1fms | Q: %3d | Gzip: %5.1fKB\n",
        $uri, $statuses[0], $p50, $p95, $avgQuery, $avgGzipKb
    );
}

echo "\nBenchmark complete.\n";

$jsonFile = $baseDir . '/docs/perf/latest_benchmark.json';
@file_put_contents($jsonFile, json_encode($results, JSON_PRETTY_PRINT));
echo "Saved results to docs/perf/latest_benchmark.json\n";
