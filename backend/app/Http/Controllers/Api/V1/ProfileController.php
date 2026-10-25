<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\DestinationListResource;
use App\Http\Resources\ReviewResource;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Services\StorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends ApiController
{
    /**
     * Get profile of authenticated user.
     */
    public function show(Request $request): JsonResponse
    {
        return $this->successResponse([
            'user' => new UserResource($request->user()),
        ]);
    }

    /**
     * Update user profile information.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|string|max:1000',
        ]);

        $oldValues = $user->only(['name', 'phone', 'country', 'bio', 'avatar']);
        $user->update($validated);

        try {
            AuditLog::record('profile_updated', $user, $oldValues, $user->only(['name', 'phone', 'country', 'bio', 'avatar']));
        } catch (\Throwable $e) {
            Log::warning('AuditLog profile_updated error: '.$e->getMessage());
        }

        return $this->successResponse([
            'user' => new UserResource($user),
        ], 'Profile updated successfully');
    }

    /**
     * Change account password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string|current_password',
            'new_password' => ['required', 'string', 'confirmed', Password::min(8)],
        ]);

        $user = $request->user();
        $user->update([
            'password' => Hash::make($validated['new_password']),
            'must_change_password' => false,
        ]);

        try {
            AuditLog::record('password_changed', $user);
        } catch (\Throwable $e) {
            Log::warning('AuditLog password_changed error: '.$e->getMessage());
        }

        return $this->successResponse(null, 'Password updated successfully');
    }

    /**
     * Upload profile avatar image.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:4096', // 4MB max
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $url = StorageService::upload($request->file('avatar'), 'avatars', 'user_'.$user->id);

            $user->update(['avatar' => $url]);

            try {
                AuditLog::record('avatar_uploaded', $user);
            } catch (\Throwable $e) {
                Log::warning('AuditLog avatar_uploaded error: '.$e->getMessage());
            }

            return $this->successResponse([
                'avatar_url' => $url,
                'user' => new UserResource($user),
            ], 'Avatar uploaded successfully');
        }

        return $this->errorResponse('No image uploaded', 400);
    }

    /**
     * Get user's favorited destinations.
     */
    public function favorites(Request $request): JsonResponse
    {
        $user = $request->user();

        $destinations = $user->favoriteDestinations()
            ->with(['province', 'category'])
            ->latest('favorites.created_at')
            ->paginate(12);

        return $this->successResponse([
            'items' => DestinationListResource::collection($destinations->items()),
            'meta' => [
                'current_page' => $destinations->currentPage(),
                'last_page' => $destinations->lastPage(),
                'per_page' => $destinations->perPage(),
                'total' => $destinations->total(),
            ],
        ], 'User favorites retrieved');
    }

    /**
     * Get reviews submitted by user.
     */
    public function reviews(Request $request): JsonResponse
    {
        $user = $request->user();

        $reviews = $user->reviews()
            ->with(['reviewable', 'images'])
            ->latest()
            ->paginate(10);

        return $this->successResponse([
            'items' => ReviewResource::collection($reviews->items()),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ], 'User reviews retrieved');
    }
}
