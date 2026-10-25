<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Actions\ProcessMediaAction;
use App\Modules\Business\Http\Resources\BusinessOwnerDetailResource;
use App\Modules\Business\Http\Resources\BusinessContactResource;
use App\Modules\Business\Http\Resources\BusinessHourResource;
use App\Modules\Business\Http\Resources\BusinessMediaResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessContactEvent;
use App\Modules\Business\Models\Lead;
use App\Modules\Business\Services\LeadService;
use App\Modules\Business\Services\ProfileScoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class OwnerBusinessController extends ApiController
{
    /**
     * Get the authenticated owner's single business profile.
     */
    public function myBusiness(Request $request): JsonResponse
    {
        $user = $request->user();

        if (empty($user->business_id)) {
            return $this->errorResponse('No business is linked to this account.', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('view', $business);

        $payload = Cache::remember("owner:mybiz:{$user->business_id}", 30, function () use ($user) {
            $b = Business::with([
                'category',
                'province',
                'coverMedia',
                'media',
                'contacts',
                'services',
                'hours',
                'closures',
                'documents',
                'owners',
            ])->findOrFail($user->business_id);

            return (new BusinessOwnerDetailResource($b))->response()->getData(true)['data'];
        });

        return $this->successResponse($payload);
    }

    /**
     * Update the authenticated owner's business profile.
     */
    public function updateMyBusiness(Request $request): JsonResponse
    {
        $user = $request->user();

        if (empty($user->business_id)) {
            return $this->errorResponse('No business is linked to this account.', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        $validated = $request->validate([
            'name_km' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'tagline_km' => 'nullable|string|max:255',
            'tagline_en' => 'nullable|string|max:255',
            'description_km' => 'nullable|string',
            'description_en' => 'nullable|string',
            'profile_data' => 'nullable|array',
            'address_km' => 'required|string|max:500',
            'address_en' => 'required|string|max:500',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'price_level' => 'nullable|integer|between:1,4',
            'cover_media_id' => 'nullable|integer|exists:biz_media,id',
        ]);

        $schemaKeys = collect($business->category?->profile_schema ?? [])->pluck('key')->filter()->all();
        if (array_key_exists('profile_data', $validated)) {
            $validated['profile_data'] = $schemaKeys
                ? Arr::only($validated['profile_data'] ?? [], $schemaKeys)
                : ($validated['profile_data'] ?? []);
        }

        $oldValues = $business->only([
            'name_km', 'name_en', 'address_km', 'address_en', 'lat', 'lng', 'status',
        ]);

        // If core business info changed, move status to pending for staff re-approval
        $coreChanged = (
            $business->name_km !== $validated['name_km'] ||
            $business->name_en !== $validated['name_en'] ||
            $business->address_km !== $validated['address_km'] ||
            $business->address_en !== $validated['address_en']
        );

        if ($coreChanged && $business->isPublished()) {
            $validated['status'] = 'pending';
        }

        $business->update($validated);

        if ($business->wasChanged(['lat', 'lng'])) {
            $business->recalculateDestinationLinks();
        }

        // Audit log
        AuditLog::record('business_owner_updated', $business, $oldValues, $business->only([
            'name_km', 'name_en', 'address_km', 'address_en', 'lat', 'lng', 'status',
        ]));

        $business->load([
            'category',
            'province',
            'coverMedia',
            'media',
            'contacts',
            'services',
            'hours',
            'closures',
            'documents',
        ]);

        Cache::forget("owner:mybiz:{$user->business_id}");
        Cache::forget("owner:stats:{$business->id}:7");
        Cache::forget("owner:stats:{$business->id}:30");
        Cache::forget("owner:stats:{$business->id}:90");

        return $this->successResponse(
            new BusinessOwnerDetailResource($business),
            $coreChanged ? 'Profile updated. Core details submitted for staff verification.' : 'Profile updated successfully.'
        );
    }

    /**
     * Get real-time contact analytics for the authenticated owner's business.
     */
    public function stats(
        Request $request,
        ProfileScoreService $profileScore,
        LeadService $leadService,
    ): JsonResponse {
        $user = $request->user();

        if (empty($user->business_id)) {
            return $this->errorResponse('No business is linked to this account.', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('viewStats', $business);

        $range = $request->input('range', '30d');
        $requestedDays = match ($range) {
            '7d' => 7,
            '90d' => 90,
            default => 30,
        };
        $maxAnalyticsDays = $business->planLimit('analytics_days');
        $days = is_numeric($maxAnalyticsDays)
            ? min($requestedDays, (int) $maxAnalyticsDays)
            : $requestedDays;

        $cacheKey = "owner:stats:{$business->id}:{$days}";
        $data = Cache::remember($cacheKey, 30, function () use ($business, $days, $leadService, $profileScore) {
            $startDate = now()->subDays($days);

            // Events by channel
            $channelCounts = BusinessContactEvent::where('business_id', $business->id)
                ->where('occurred_at', '>=', $startDate)
                ->select('channel', DB::raw('COUNT(*) as count'))
                ->groupBy('channel')
                ->pluck('count', 'channel')
                ->toArray();

            // Daily trend
            $dailyTrend = BusinessContactEvent::where('business_id', $business->id)
                ->where('occurred_at', '>=', $startDate)
                ->select(
                    DB::raw('DATE(occurred_at) as date'),
                    DB::raw("SUM(CASE WHEN channel = 'profile_view' THEN 1 ELSE 0 END) as views"),
                    DB::raw("SUM(CASE WHEN channel != 'profile_view' THEN 1 ELSE 0 END) as contacts")
                )
                ->groupBy(DB::raw('DATE(occurred_at)'))
                ->orderBy('date')
                ->get();

            $totalViews = $channelCounts['profile_view'] ?? 0;
            $totalContacts = array_sum(array_filter(
                $channelCounts,
                fn ($k) => $k !== 'profile_view',
                ARRAY_FILTER_USE_KEY
            ));

            $followUpDays = 3;
            $followUpQuery = Lead::where('business_id', $business->id)
                ->whereIn('status', ['new', 'contacted', 'qualified'])
                ->where('last_contact_at', '<=', now()->subDays($followUpDays))
                ->orderBy('last_contact_at');
            $followUpCount = (clone $followUpQuery)->count();
            $followUpLeads = (clone $followUpQuery)
                ->take(5)
                ->get(['id', 'status', 'primary_channel', 'contact_count', 'last_contact_at', 'note'])
                ->map(fn (Lead $lead) => [
                    'id' => $lead->id,
                    'status' => $lead->status,
                    'primary_channel' => $lead->primary_channel,
                    'contact_count' => (int) $lead->contact_count,
                    'last_contact_at' => $lead->last_contact_at?->toIso8601String(),
                    'waiting_days' => $lead->last_contact_at
                        ? (int) $lead->last_contact_at->diffInDays(now())
                        : null,
                    'note' => $lead->note,
                ]);

            return [
                'business_id' => $business->id,
                'range' => "{$days}d",
                'totals' => [
                    'views' => $totalViews,
                    'contacts' => $totalContacts,
                    'rating_avg' => (float) $business->rating_avg,
                    'rating_count' => (int) $business->rating_count,
                ],
                'channels' => $channelCounts,
                'daily_trend' => $dailyTrend,
                'leads' => $leadService->stats($business, $days),
                'lead_change' => $leadService->recentStats($business, $days),
                'profile' => $profileScore->forBusiness($business),
                'plan_limits' => $business->planLimits(),
                'usage' => [
                    'photos' => $business->media()->count(),
                    'services' => $business->services()->count(),
                    'team_members' => $business->members()->where('role', '!=', 'owner')->count(),
                ],
                'follow_ups' => [
                    'days' => $followUpDays,
                    'count' => $followUpCount,
                    'items' => $followUpLeads,
                ],
                'tier' => [
                    'current' => $business->tier ?: 'free',
                    'is_featured' => $business->isFeatured(),
                    'is_on_trial' => $business->isOnTrial(),
                    'has_used_trial' => $business->hasUsedTrial(),
                    'trial_ends_at' => $business->trial_ends_at?->toIso8601String(),
                    'expires_at' => $business->subscription_expires_at?->toIso8601String(),
                    'is_active' => $business->isSubscriptionActive(),
                ],
            ];
        });

        return $this->successResponse($data);
    }

    /**
     * Update operating hours for the owner's business.
     */
    public function syncHours(Request $request): JsonResponse
    {
        $user = $request->user();
        if (empty($user->business_id)) {
            return $this->errorResponse('No business linked', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        $validated = $request->validate([
            'hours' => 'required|array',
            'hours.*.weekday' => 'required|integer|between:0,6',
            'hours.*.opens_at' => 'nullable|string',
            'hours.*.closes_at' => 'nullable|string',
            'hours.*.is_closed' => 'boolean',
        ]);

        $business->hours()->delete();

        foreach ($validated['hours'] as $h) {
            $business->hours()->create([
                'weekday' => $h['weekday'],
                'opens_at' => ! empty($h['is_closed']) ? null : ($h['opens_at'] ?? null),
                'closes_at' => ! empty($h['is_closed']) ? null : ($h['closes_at'] ?? null),
                'is_closed' => ! empty($h['is_closed']),
            ]);
        }

        AuditLog::record('business_hours_synced', $business);

        return $this->successResponse(
            BusinessHourResource::collection($business->hours()->get()),
            'Operating hours updated successfully'
        );
    }

    /**
     * Add a planned closure for the owner's business.
     */
    public function storeClosure(Request $request): JsonResponse
    {
        $user = $request->user();
        if (empty($user->business_id)) {
            return $this->errorResponse('No business linked', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        $validated = $request->validate([
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'note_km' => 'nullable|string|max:255',
            'note_en' => 'nullable|string|max:255',
        ]);

        $closure = $business->closures()->create($validated);
        AuditLog::record('business_closure_created', $business, null, $closure->toArray());

        return $this->successResponse($closure, 'Closure registered successfully', 201);
    }

    /**
     * Remove a closure.
     */
    public function destroyClosure(Request $request, int $closureId): JsonResponse
    {
        $user = $request->user();
        if (empty($user->business_id)) {
            return $this->errorResponse('No business linked', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        $closure = $business->closures()->findOrFail($closureId);
        $closure->delete();

        return $this->successResponse(null, 'Closure removed successfully');
    }

    /**
     * Add a contact channel for the owner's business.
     */
    public function storeContact(Request $request): JsonResponse
    {
        $user = $request->user();
        if (empty($user->business_id)) {
            return $this->errorResponse('No business linked', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        $validated = $request->validate([
            'type' => 'required|string|in:phone,telegram,whatsapp,messenger,email,website,facebook',
            'value' => 'required|string|max:500',
            'label' => 'nullable|string|max:100',
            'is_primary' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if (! empty($validated['is_primary'])) {
            $business->contacts()->update(['is_primary' => false]);
        }

        $contact = $business->contacts()->create($validated);
        AuditLog::record('business_contact_created', $business, null, $contact->toArray());

        return $this->successResponse(new BusinessContactResource($contact), 'Contact added successfully', 201);
    }

    /**
     * Update a contact channel.
     */
    public function updateContact(Request $request, int $contactId): JsonResponse
    {
        $user = $request->user();
        if (empty($user->business_id)) {
            return $this->errorResponse('No business linked', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        $contact = $business->contacts()->findOrFail($contactId);

        $validated = $request->validate([
            'type' => 'sometimes|required|string|in:phone,telegram,whatsapp,messenger,email,website,facebook',
            'value' => 'sometimes|required|string|max:500',
            'label' => 'nullable|string|max:100',
            'is_primary' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if (! empty($validated['is_primary'])) {
            $business->contacts()->where('id', '!=', $contact->id)->update(['is_primary' => false]);
        }

        $contact->update($validated);

        return $this->successResponse(new BusinessContactResource($contact), 'Contact updated successfully');
    }

    /**
     * Delete a contact channel.
     */
    public function destroyContact(Request $request, int $contactId): JsonResponse
    {
        $user = $request->user();
        if (empty($user->business_id)) {
            return $this->errorResponse('No business linked', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        $contact = $business->contacts()->findOrFail($contactId);
        $contact->delete();

        return $this->successResponse(null, 'Contact deleted successfully');
    }

    /**
     * Upload photo(s) for the owner's business.
     */
    public function uploadMedia(Request $request, ProcessMediaAction $processMedia): JsonResponse
    {
        $user = $request->user();
        if (empty($user->business_id)) {
            return $this->errorResponse('No business linked', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        $request->validate([
            'image' => 'required_without:images|file|mimes:jpeg,png,webp,jpg|max:5120',
            'images' => 'required_without:image|array',
            'images.*' => 'file|mimes:jpeg,png,webp,jpg|max:5120',
            'alt_km' => 'nullable|string|max:255',
            'alt_en' => 'nullable|string|max:255',
            'is_cover' => 'boolean',
        ]);

        $files = $request->hasFile('images')
            ? $request->file('images')
            : [$request->file('image')];

        $maxPhotos = $business->planLimit('max_photos');
        if (is_numeric($maxPhotos) && $business->media()->count() + count($files) > (int) $maxPhotos) {
            throw ValidationException::withMessages([
                'images' => "Your current plan allows up to {$maxPhotos} photos. Delete some photos or upgrade your plan.",
            ]);
        }

        $currentMaxOrder = $business->media()->max('sort_order') ?? 0;
        $created = [];

        foreach ($files as $idx => $file) {
            $paths = $processMedia->execute($file, $business->id);
            $isCover = ($idx === 0 && $request->boolean('is_cover')) || $business->media()->count() === 0;

            if ($isCover) {
                $business->media()->update(['is_cover' => false]);
            }

            $media = $business->media()->create([
                'path' => $paths['path'],
                'path_800' => $paths['path_800'],
                'path_400' => $paths['path_400'],
                'alt_km' => $request->input('alt_km'),
                'alt_en' => $request->input('alt_en'),
                'sort_order' => $currentMaxOrder + $idx + 1,
                'is_cover' => $isCover,
            ]);

            if ($isCover) {
                $business->update(['cover_media_id' => $media->id]);
            }

            $created[] = $media;
        }

        AuditLog::record('business_media_uploaded', $business, null, [
            'count' => count($created),
            'owner_id' => $user->id,
        ]);

        return $this->successResponse(
            BusinessMediaResource::collection($created),
            'Media uploaded successfully',
            201
        );
    }

    /**
     * Set a photo as cover photo.
     */
    public function setCoverMedia(Request $request, int $mediaId): JsonResponse
    {
        $user = $request->user();
        if (empty($user->business_id)) {
            return $this->errorResponse('No business linked', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        $media = $business->media()->findOrFail($mediaId);

        $business->media()->update(['is_cover' => false]);
        $media->update(['is_cover' => true]);
        $business->update(['cover_media_id' => $media->id]);

        return $this->successResponse(new BusinessMediaResource($media), 'Cover image updated');
    }

    /**
     * Delete a photo.
     */
    public function destroyMedia(Request $request, int $mediaId): JsonResponse
    {
        $user = $request->user();
        if (empty($user->business_id)) {
            return $this->errorResponse('No business linked', 404);
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        $media = $business->media()->findOrFail($mediaId);

        Storage::disk('public')->delete([
            $media->path,
            $media->path_800,
            $media->path_400,
        ]);

        $media->delete();

        if ($business->cover_media_id === $mediaId) {
            $next = $business->media()->first();
            if ($next) {
                $next->update(['is_cover' => true]);
                $business->update(['cover_media_id' => $next->id]);
            } else {
                $business->update(['cover_media_id' => null]);
            }
        }

        AuditLog::record('business_media_deleted', $business, ['media_id' => $mediaId]);

        return $this->successResponse(null, 'Media deleted successfully');
    }
}
