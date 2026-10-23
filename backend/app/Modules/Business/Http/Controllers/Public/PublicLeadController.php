<?php

namespace App\Modules\Business\Http\Controllers\Public;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Lead;
use App\Modules\Business\Services\OwnerNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicLeadController extends ApiController
{
    public function store(Request $request, string $slug, OwnerNotificationService $notifications): JsonResponse
    {
        $business = Business::query()->published()->where('slug', $slug)->first();

        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:120',
            'phone' => 'required|string|min:6|max:30',
            'email' => 'nullable|email|max:255',
            'message' => 'required|string|min:10|max:2000',
            'preferred_date' => 'nullable|date|after_or_equal:today',
            'party_size' => 'nullable|integer|between:1,50',
            'locale' => 'nullable|string|in:km,en',
            'website' => 'nullable|max:0',
        ]);

        $lead = Lead::create([
            'business_id' => $business->id,
            'session_hash' => hash('sha256', $request->ip().Str::random(32)),
            'status' => 'new',
            'primary_channel' => 'website',
            'source' => 'lead_form',
            'locale' => $validated['locale'] ?? 'km',
            'contact_count' => 1,
            'first_contact_at' => now(),
            'last_contact_at' => now(),
            'name' => strip_tags($validated['name']),
            'phone' => strip_tags($validated['phone']),
            'email' => $validated['email'] ?? null,
            'message' => strip_tags($validated['message']),
            'preferred_date' => $validated['preferred_date'] ?? null,
            'party_size' => $validated['party_size'] ?? null,
            'ip_hash' => hash('sha256', (string) $request->ip().config('app.key')),
            'user_agent' => Str::limit((string) $request->userAgent(), 500, ''),
            'user_id' => $request->user()?->id,
        ]);

        $notifications->notifyNewLead($business, [
            'lead_id' => $lead->id,
            'channel' => 'lead_form',
        ]);

        return $this->successResponse([
            'id' => $lead->id,
            'status' => $lead->status,
        ], 'Inquiry submitted successfully.', 201);
    }
}
