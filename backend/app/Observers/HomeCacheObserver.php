<?php

namespace App\Observers;

use Illuminate\Support\Facades\Cache;

/**
 * HomeCacheObserver – invalidates the home:v1 cache whenever
 * a Destination, Province, Category, Event or BlogPost is saved or deleted.
 *
 * Register all five models in AppServiceProvider::boot().
 */
class HomeCacheObserver
{
    private const CACHE_KEY = 'home:v1';

    public function saved($model): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    public function deleted($model): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    public function restored($model): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
