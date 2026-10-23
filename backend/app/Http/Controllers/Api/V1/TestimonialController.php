<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends ApiController
{
    /**
     * Get list of approved website testimonials for "Loved by Explorers Worldwide".
     */
    public function index(): JsonResponse
    {
        $items = Testimonial::approved()
            ->latest()
            ->get();

        return $this->successResponse([
            'items' => $items,
            'total' => $items->count(),
        ]);
    }

    /**
     * Submit a new website review / testimonial.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'role' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:100',
            'trip' => 'nullable|string|max:150',
            'rating' => 'required|integer|min:1|max:5',
            'quote' => 'required|string|min:5|max:1200',
            'quote_km' => 'nullable|string|max:1200',
        ]);

        // Generate initials for avatar badge
        $nameParts = preg_split('/\s+/', trim($validated['name']));
        $avatarInitials = '';
        if (count($nameParts) >= 2) {
            $avatarInitials = mb_substr($nameParts[0], 0, 1) . mb_substr($nameParts[count($nameParts) - 1], 0, 1);
        } else {
            $avatarInitials = mb_substr($validated['name'], 0, 2);
        }
        $avatarInitials = mb_strtoupper($avatarInitials);

        // Curated harmonic palette matching Angkor Sandstone
        $palettes = [
            'bg-laterite-600',
            'bg-amber-600',
            'bg-moss-600',
            'bg-river-600',
            'bg-stone-800',
        ];
        $avatarBg = $palettes[array_rand($palettes)];

        $quote = trim($validated['quote']);
        $quoteKm = !empty($validated['quote_km']) ? trim($validated['quote_km']) : $quote;

        $userAvatar = $request->user()?->avatar;
        $testimonial = Testimonial::create([
            'user_id' => $request->user()?->id,
            'name' => $validated['name'],
            'role' => $validated['role'] ?: 'Explorer',
            'location' => $validated['location'] ?: 'Cambodia',
            'trip' => $validated['trip'] ?: 'Cambodia Heritage Tour',
            'rating' => (int) $validated['rating'],
            'avatar' => $userAvatar ?: $avatarInitials,
            'avatar_bg' => $avatarBg,
            'quote_en' => $quote,
            'quote_km' => $quoteKm,
            'status' => 'pending', // Pending review for admin moderation
            'ip_address' => $request->ip(),
        ]);

        return $this->successResponse([
            'item' => $testimonial,
        ], 'Your review has been submitted successfully and is pending admin moderation.', 201);
    }
}
