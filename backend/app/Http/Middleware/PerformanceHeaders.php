<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * PerformanceHeaders Middleware:
 * 1. Computes total request duration and DB query duration/counts.
 * 2. Emits Server-Timing header (total;dur=X, db;dur=Y;desc="N queries").
 * 3. Dev-only query logger flagging > 100ms queries and > 30 queries per request.
 * 4. Adds Cache-Control: public, max-age=60, stale-while-revalidate=600 for public GETs.
 * 5. Generates MD5 ETag and returns 304 Not Modified when If-None-Match matches.
 * 6. Ensures Cache-Control: private, no-store for authenticated / owner / admin endpoints.
 */
class PerformanceHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = hrtime(true);
        $queries = [];
        $totalDbDurationMs = 0.0;

        // Listen to database queries during this request
        DB::listen(function ($query) use (&$queries, &$totalDbDurationMs) {
            $queries[] = [
                'sql' => $query->sql,
                'time_ms' => $query->time,
            ];
            $totalDbDurationMs += $query->time;
        });

        /** @var Response $response */
        $response = $next($request);

        $endTime = hrtime(true);
        $totalDurationMs = ($endTime - $startTime) / 1_000_000;
        $queryCount = count($queries);

        // Flag slow queries (> 100ms) or excessive queries (> 30) in dev/testing/local
        if (config('app.debug') || app()->environment('local', 'testing')) {
            if ($queryCount > 30) {
                Log::warning("[Perf Alert] Excessive queries on {$request->method()} {$request->path()}: {$queryCount} queries executed (total DB: {$totalDbDurationMs}ms)");
            }
            foreach ($queries as $q) {
                if ($q['time_ms'] > 100) {
                    Log::warning("[Perf Alert] Slow query ({$q['time_ms']}ms) on {$request->method()} {$request->path()}: {$q['sql']}");
                }
            }
        }

        // Add Server-Timing headers
        $serverTiming = sprintf(
            'total;dur=%.2f, db;dur=%.2f;desc="%d queries"',
            $totalDurationMs,
            $totalDbDurationMs,
            $queryCount
        );
        $response->headers->set('Server-Timing', $serverTiming);

        // HTTP Caching & ETag for GET requests
        if ($request->isMethod('GET')) {
            $path = $request->path();
            $isPrivate = $request->user() !== null 
                || str_contains($path, '/admin') 
                || str_contains($path, '/owner') 
                || str_contains($path, '/profile')
                || str_contains($path, '/auth/me');

            if ($isPrivate) {
                $response->headers->set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                $response->headers->set('Pragma', 'no-cache');
            } else {
                // Public endpoint
                if (!$response->headers->has('Cache-Control') || str_contains($response->headers->get('Cache-Control'), 'no-cache')) {
                    $response->headers->set('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
                }
                $response->headers->set('Vary', 'Accept-Encoding, Accept-Language, Origin');

                // Compute ETag if status is 200
                if ($response->getStatusCode() === 200) {
                    $content = $response->getContent();
                    if ($content !== false && $content !== '') {
                        $rawHash = md5($content);
                        $etag = '"' . $rawHash . '"';
                        $response->headers->set('ETag', $etag);

                        // Check If-None-Match
                        $ifNoneMatch = $request->header('If-None-Match');
                        if ($ifNoneMatch) {
                            $matches = array_map(fn($v) => trim($v, ' "'), explode(',', $ifNoneMatch));
                            if (in_array($rawHash, $matches, true) || in_array('*', $matches, true)) {
                                $response->setStatusCode(304);
                                $response->setContent('');
                            }
                        }
                    }
                }
            }
        }

        return $response;
    }
}
