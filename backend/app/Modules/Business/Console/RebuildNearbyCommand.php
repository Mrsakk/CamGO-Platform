<?php

namespace App\Modules\Business\Console;

use App\Modules\Business\Actions\RebuildNearbyBusinessesAction;
use Illuminate\Console\Command;

class RebuildNearbyCommand extends Command
{
    protected $signature = 'biz:rebuild-nearby {--limit=10 : Maximum nearby businesses per business}';

    protected $description = 'Rebuild cached nearby-business links within 50 km.';

    public function handle(RebuildNearbyBusinessesAction $action): int
    {
        $count = $action->execute((int) $this->option('limit'));

        $this->info("Rebuilt {$count} nearby-business links.");

        return self::SUCCESS;
    }
}
