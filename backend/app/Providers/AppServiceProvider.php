<?php

namespace App\Providers;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Event;
use App\Models\Province;
use App\Observers\HomeCacheObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(
            \App\Modules\Business\Contracts\PaymentGateway::class,
            \App\Modules\Business\Gateways\ManualPaymentGateway::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Invalidate the home:v1 cache whenever any of these models change
        $observer = HomeCacheObserver::class;
        Destination::observe($observer);
        Province::observe($observer);
        Category::observe($observer);
        Event::observe($observer);
        BlogPost::observe($observer);

        // Business module observers
        \App\Modules\Business\Models\Business::observe(\App\Modules\Business\Observers\BusinessObserver::class);
        \App\Modules\Business\Models\BusinessReview::observe(\App\Modules\Business\Observers\BusinessReviewObserver::class);

        // Business policy
        \Illuminate\Support\Facades\Gate::policy(
            \App\Modules\Business\Models\Business::class,
            \App\Modules\Business\Policies\BusinessPolicy::class
        );

        // Business console commands
        if ($this->app->runningInConsole()) {
            $this->commands([
                \App\Modules\Business\Console\AggregateStatsCommand::class,
                \App\Modules\Business\Console\RebuildNearbyCommand::class,
                \App\Console\Commands\ExpireSubscriptionsCommand::class,
                \App\Console\Commands\SendSubscriptionRemindersCommand::class,
            ]);
        }
    }
}
