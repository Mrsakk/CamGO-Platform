<?php

namespace App\Modules\Business\Observers;

use App\Modules\Business\Models\Business;
use Illuminate\Support\Facades\Cache;

class BusinessObserver
{
    /**
     * Clear all business-related cache tags or keys.
     */
    public function clearCache(): void
    {
        // Flush all biz: cache keys or tag
        try {
            if (Cache::supportsTags()) {
                Cache::tags(['biz'])->flush();
            } else {
                // For file/array/database cache driver without tags
                Cache::forget('biz:public:home');
                Cache::forget('biz:public:categories');
                Cache::forget('biz:public:provinces');
            }
        } catch (\Throwable $e) {
            // Ignore cache flush failures
        }
    }

    public function saving(Business $business): void
    {
        // If status changed to suspended, ensure it immediately drops from cache
        if ($business->isDirty('status') && $business->status === 'suspended') {
            $this->clearCache();
        }
    }

    public function saved(Business $business): void
    {
        if ($business->isDirty(['lat', 'lng'])) {
            $business->recalculateDestinationLinks();
        }

        $this->clearCache();
    }

    public function deleted(Business $business): void
    {
        $this->clearCache();
    }

    public function restored(Business $business): void
    {
        $this->clearCache();
    }
}
