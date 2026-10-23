<?php

namespace App\Modules\Business\Gateways;

use App\Models\User;
use App\Modules\Business\Contracts\PaymentGateway;
use App\Modules\Business\Models\Payment;
use App\Modules\Business\Models\Subscription;
use App\Modules\Business\Services\SubscriptionService;

class ManualPaymentGateway implements PaymentGateway
{
    public function __construct(private SubscriptionService $subscriptions)
    {
    }

    public function key(): string
    {
        return 'manual';
    }

    public function record(Subscription $subscription, array $payload, ?User $actor = null): Payment
    {
        return $this->subscriptions->recordPayment($subscription, array_merge([
            'method' => 'cash',
            'status' => 'recorded',
        ], $payload), $actor);
    }
}
