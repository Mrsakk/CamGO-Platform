<?php

namespace App\Console\Commands;

use App\Modules\Business\Services\SubscriptionService;
use Illuminate\Console\Command;

class ExpireSubscriptionsCommand extends Command
{
    protected $signature = 'biz:expire-subscriptions';

    protected $description = 'Expire due business subscriptions and downgrade businesses to the free tier';

    public function handle(SubscriptionService $service): int
    {
        $result = $service->expireDue();

        $this->info("Expired {$result['subscriptions']} subscription(s) and downgraded {$result['businesses']} business(es).");

        return self::SUCCESS;
    }
}
