<?php

namespace App\Modules\Business\Services;

use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\OwnerNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OwnerNotificationService
{
    public function notify(
        Business $business,
        string $type,
        string $titleKm,
        string $titleEn,
        string $bodyKm,
        string $bodyEn,
        array $data = [],
        ?string $dedupeKey = null,
        ?string $preferenceKey = null,
    ): array {
        $members = $business->members()
            ->where('status', 'active')
            ->with('user')
            ->get();

        $recipients = $members
            ->map(fn ($member) => $member->user)
            ->filter()
            ->unique('id');

        if ($recipients->isEmpty()) {
            $recipients = $business->owners()->get();
        }

        $created = [];

        foreach ($recipients as $user) {
            if (!$user->is_active || !$user->notificationPreference('in_app', true)) {
                continue;
            }

            if ($preferenceKey && !$user->notificationPreference($preferenceKey, true)) {
                continue;
            }

            if ($dedupeKey) {
                $exists = OwnerNotification::where('business_id', $business->id)
                    ->where('user_id', $user->id)
                    ->where('dedupe_key', $dedupeKey)
                    ->exists();

                if ($exists) {
                    continue;
                }
            }

            $notification = OwnerNotification::create([
                'business_id' => $business->id,
                'user_id' => $user->id,
                'type' => $type,
                'dedupe_key' => $dedupeKey,
                'title_km' => $titleKm,
                'title_en' => $titleEn,
                'body_km' => $bodyKm,
                'body_en' => $bodyEn,
                'data' => $data,
            ]);

            $created[] = $notification;
            $this->sendTelegram($user, "{$titleKm}\n{$bodyKm}");
        }

        return $created;
    }

    public function notifyNewLead(Business $business, array $data): array
    {
        return $this->notify(
            $business,
            'lead.created',
            'មានអ្នកចាប់អារម្មណ៍ថ្មី',
            'New customer inquiry',
            'មានភ្ញៀវទាក់ទងអាជីវកម្មរបស់អ្នកតាម ' . ($data['channel'] ?? 'គេហទំព័រ') . '។',
            'A visitor contacted your business via ' . ($data['channel'] ?? 'the website') . '.',
            $data,
            'lead:' . ($data['lead_id'] ?? uniqid()),
            'leads',
        );
    }

    private function sendTelegram($user, string $message): void
    {
        $token = config('services.telegram.bot_token');
        $chatId = $user->telegram_chat_id;

        if (!$token || !$chatId || !$user->notificationPreference('telegram', false)) {
            return;
        }

        try {
            Http::timeout(3)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
            ]);
        } catch (\Throwable $e) {
            Log::warning('Telegram notification failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
