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
        $this->invalidate($model);
    }

    public function deleted($model): void
    {
        $this->invalidate($model);
    }

    public function restored($model): void
    {
        $this->invalidate($model);
    }

    private function invalidate($model): void
    {
        Cache::forget(self::CACHE_KEY);

        if ($model instanceof \App\Models\Destination) {
            if ($model->slug) {
                Cache::forget("dest:detail:{$model->slug}");
            }
            if ($model->id) {
                Cache::forget("dest:detail:{$model->id}");
            }
            if (!empty($model->ulid)) {
                Cache::forget("dest:detail:{$model->ulid}");
            }
        }
    }
}
