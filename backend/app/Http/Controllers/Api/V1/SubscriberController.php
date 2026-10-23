<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Models\Subscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriberController extends ApiController
{
    /**
     * Subscribe email to tourism newsletter.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:150',
        ]);

        $subscriber = Subscriber::firstOrCreate(
            ['email' => $validated['email']],
            ['is_active' => true, 'verified_at' => now()]
        );

        if (!$subscriber->wasRecentlyCreated && !$subscriber->is_active) {
            $subscriber->update(['is_active' => true]);
        }

        AuditLog::record('newsletter_subscribed', $subscriber);

        return $this->successResponse([
            'email' => $subscriber->email,
        ], 'Thank you for subscribing to CamGO Travel updates!');
    }
}
