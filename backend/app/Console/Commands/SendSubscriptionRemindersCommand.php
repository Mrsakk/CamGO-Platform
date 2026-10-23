<?php

namespace App\Console\Commands;

use App\Modules\Business\Models\Subscription;
use App\Modules\Business\Services\OwnerNotificationService;
use Illuminate\Console\Command;

class SendSubscriptionRemindersCommand extends Command
{
    protected $signature = 'biz:send-subscription-reminders';

    protected $description = 'Send in-app renewal and trial-ending reminders to business owners';

    public function handle(OwnerNotificationService $notifications): int
    {
        $sent = 0;

        Subscription::with(['business', 'plan'])
            ->where('status', 'active')
            ->whereNotNull('ends_at')
            ->where('ends_at', '>', now())
            ->where('ends_at', '<=', now()->addDays(7))
            ->orderBy('ends_at')
            ->chunkById(100, function ($subscriptions) use ($notifications, &$sent) {
                foreach ($subscriptions as $subscription) {
                    if (!$subscription->business) {
                        continue;
                    }

                    $days = (int) now()->startOfDay()->diffInDays($subscription->ends_at->copy()->startOfDay());

                    if (!in_array($days, [7, 3, 1], true)) {
                        continue;
                    }

                    $isTrial = (bool) $subscription->is_trial;
                    $titleKm = $isTrial ? 'ការសាកល្បងជិតបញ្ចប់' : 'ការជាវជិតផុតកំណត់';
                    $titleEn = $isTrial ? 'Trial ending soon' : 'Subscription renewal reminder';
                    $bodyKm = $isTrial
                        ? "ការសាកល្បង Pro របស់អ្នកនឹងបញ្ចប់ក្នុងរយៈពេល {$days} ថ្ងៃ។ ជ្រើសរើសគម្រោងបន្តដើម្បីរក្សាអត្ថប្រយោជន៍។"
                        : "ការជាវរបស់អ្នកនឹងផុតកំណត់ក្នុងរយៈពេល {$days} ថ្ងៃ។ សូមបន្តការជាវដើម្បីរក្សាអត្ថប្រយោជន៍។";
                    $bodyEn = $isTrial
                        ? "Your Pro trial ends in {$days} day(s). Choose a plan to keep your benefits."
                        : "Your subscription ends in {$days} day(s). Renew to keep your benefits.";

                    $created = $notifications->notify(
                        $subscription->business,
                        $isTrial ? 'billing.trial_ending' : 'billing.renewal',
                        $titleKm,
                        $titleEn,
                        $bodyKm,
                        $bodyEn,
                        [
                            'subscription_id' => $subscription->id,
                            'days_left' => $days,
                            'ends_at' => $subscription->ends_at?->toIso8601String(),
                        ],
                        "billing:{$subscription->id}:{$days}",
                        'billing',
                    );

                    $sent += count($created);
                }
            });

        $this->info("Subscription reminders sent: {$sent}");

        return self::SUCCESS;
    }
}
