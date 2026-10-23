<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\OwnerNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerNotificationController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        [$business, $user] = $this->context($request);

        $validated = $request->validate([
            'unread' => 'nullable|boolean',
            'per_page' => 'nullable|integer|between:1,100',
        ]);

        $notifications = OwnerNotification::where('business_id', $business->id)
            ->where('user_id', $user->id)
            ->when($request->boolean('unread'), fn ($query) => $query->unread())
            ->orderByDesc('id')
            ->paginate($validated['per_page'] ?? 20)
            ->through(fn (OwnerNotification $notification) => $this->serialize($notification));

        return $this->paginateResponse($notifications, 'Notifications retrieved successfully');
    }

    public function unreadCount(Request $request): JsonResponse
    {
        [$business, $user] = $this->context($request);

        return $this->successResponse([
            'unread_count' => OwnerNotification::where('business_id', $business->id)
                ->where('user_id', $user->id)
                ->unread()
                ->count(),
        ]);
    }

    public function markRead(Request $request, int $notificationId): JsonResponse
    {
        [$business, $user] = $this->context($request);

        $notification = OwnerNotification::where('business_id', $business->id)
            ->where('user_id', $user->id)
            ->findOrFail($notificationId);

        if (!$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return $this->successResponse($this->serialize($notification), 'Notification marked as read');
    }

    public function markAllRead(Request $request): JsonResponse
    {
        [$business, $user] = $this->context($request);

        $updated = OwnerNotification::where('business_id', $business->id)
            ->where('user_id', $user->id)
            ->unread()
            ->update(['read_at' => now()]);

        return $this->successResponse(['updated' => $updated], 'Notifications marked as read');
    }

    public function settings(Request $request): JsonResponse
    {
        [, $user] = $this->context($request);

        return $this->successResponse([
            'telegram_chat_id' => $user->telegram_chat_id,
            'notification_preferences' => [
                'in_app' => $user->notificationPreference('in_app', true),
                'telegram' => $user->notificationPreference('telegram', false),
                'leads' => $user->notificationPreference('leads', true),
                'reviews' => $user->notificationPreference('reviews', true),
                'billing' => $user->notificationPreference('billing', true),
            ],
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        [, $user] = $this->context($request);

        $validated = $request->validate([
            'telegram_chat_id' => 'nullable|string|max:64',
            'notification_preferences' => 'nullable|array',
            'notification_preferences.in_app' => 'nullable|boolean',
            'notification_preferences.telegram' => 'nullable|boolean',
            'notification_preferences.leads' => 'nullable|boolean',
            'notification_preferences.reviews' => 'nullable|boolean',
            'notification_preferences.billing' => 'nullable|boolean',
        ]);

        $current = $user->notification_preferences ?? [];
        if (array_key_exists('telegram_chat_id', $validated)) {
            $user->telegram_chat_id = $validated['telegram_chat_id'];
        }
        $user->notification_preferences = array_merge($current, $validated['notification_preferences'] ?? []);
        $user->save();

        return $this->settings($request);
    }

    private function serialize(OwnerNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title_km' => $notification->title_km,
            'title_en' => $notification->title_en,
            'body_km' => $notification->body_km,
            'body_en' => $notification->body_en,
            'data' => $notification->data,
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->toIso8601String(),
        ];
    }

    private function context(Request $request): array
    {
        $user = $request->user();

        if (empty($user->business_id)) {
            abort(404, 'No business is linked to this account.');
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('view', $business);

        return [$business, $user];
    }
}
