<?php

namespace App\Modules\Business\Observers;

use App\Modules\Business\Models\BusinessReview;
use Illuminate\Support\Facades\Cache;

class BusinessReviewObserver
{
    public function saved(BusinessReview $review): void
    {
        $review->business?->recalculateRatings();
        $this->clearCache();
    }

    public function deleted(BusinessReview $review): void
    {
        $review->business?->recalculateRatings();
        $this->clearCache();
    }

    public function restored(BusinessReview $review): void
    {
        $review->business?->recalculateRatings();
        $this->clearCache();
    }

    private function clearCache(): void
    {
        try {
            if (Cache::supportsTags()) {
                Cache::tags(['biz'])->flush();
            } else {
                Cache::forget('biz:public:home');
            }
        } catch (\Throwable $e) {
            // Ignore
        }
    }
}
