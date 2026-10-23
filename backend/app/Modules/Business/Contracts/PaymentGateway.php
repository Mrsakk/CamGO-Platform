<?php

namespace App\Modules\Business\Contracts;

use App\Models\User;
use App\Modules\Business\Models\Payment;
use App\Modules\Business\Models\Subscription;

interface PaymentGateway
{
    public function key(): string;

    public function record(Subscription $subscription, array $payload, ?User $actor = null): Payment;
}
