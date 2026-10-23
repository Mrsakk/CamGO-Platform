<?php

namespace App\Modules\Business\Http\Controllers\Public;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Business\Http\Requests\StoreContactEventRequest;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessContactEvent;
use App\Modules\Business\Services\LeadService;
use Illuminate\Http\JsonResponse;

class PublicEventController extends ApiController
{
    /**
     * Record visitor interaction (contact click or profile view) via sendBeacon.
     * Guaranteed fast response without blocking tourist actions.
     */
    public function store(StoreContactEventRequest $request, string $slug, LeadService $leads): JsonResponse
    {
        $business = Business::where('slug', $slug)->published()->first();
        if (!$business) {
            return $this->errorResponse('Business not found', 404);
        }

        // Daily rotating session hash (no raw IP or full user agent stored)
        $sessionHash = hash(
            'sha256',
            $request->ip() . ($request->userAgent() ?: 'unknown') . date('Y-m-d') . config('app.key')
        );

        // Rate limit: max 60 interaction events per session hash per hour
        $recentCount = BusinessContactEvent::where('session_hash', $sessionHash)
            ->where('occurred_at', '>=', now()->subHour())
            ->count();

        if ($recentCount > 60) {
            return $this->errorResponse('Event limit exceeded', 429);
        }

        $event = BusinessContactEvent::create([
            'business_id' => $business->id,
            'channel' => $request->input('channel'),
            'occurred_at' => now(),
            'locale' => $request->input('locale', 'km'),
            'session_hash' => $sessionHash,
            'source' => $request->input('source', 'profile'),
        ]);

        $event->setRelation('business', $business);
        $leads->recordContact($event);

        return $this->successResponse([
            'status' => 'recorded',
            'channel' => $request->input('channel'),
        ], 'Contact interaction event recorded');
    }
}
