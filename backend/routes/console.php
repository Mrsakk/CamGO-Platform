<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

\Illuminate\Support\Facades\Schedule::command('biz:aggregate-stats')->dailyAt('01:00');
\Illuminate\Support\Facades\Schedule::command('biz:rebuild-nearby')->weeklyOn(1, '02:00');
\Illuminate\Support\Facades\Schedule::command('biz:expire-subscriptions')->dailyAt('00:15');
\Illuminate\Support\Facades\Schedule::command('biz:send-subscription-reminders')->dailyAt('09:00');
