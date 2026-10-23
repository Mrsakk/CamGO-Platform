<?php

namespace App\Modules\Business\Console;

use App\Modules\Business\Actions\AggregateDailyStatsAction;
use Illuminate\Console\Command;

class AggregateStatsCommand extends Command
{
    protected $signature = 'biz:aggregate-stats {--date= : Specific date in YYYY-MM-DD format}';

    protected $description = 'Aggregate daily business views and contact interaction events into biz_daily_stats';

    public function handle(AggregateDailyStatsAction $action): int
    {
        $date = $this->option('date');
        $this->info("Aggregating business daily statistics for date: " . ($date ?: 'yesterday'));

        $count = $action->execute($date);

        $this->info("Successfully aggregated statistics for {$count} businesses.");
        return self::SUCCESS;
    }
}
