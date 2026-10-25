<?php

namespace App\Console\Commands;

use App\Models\WebVitalsMetric;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class PerfReportCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'perf:report {--limit=20 : Maximum log entries to display}';

    /**
     * The console command description.
     */
    protected $description = 'Generate performance diagnostic report from query logs and RUM metrics';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('====================================================');
        $this->info('  KhemaraMorodok / CamGO Performance Diagnostic Report');
        $this->info('====================================================');

        // 1. RUM Web Vitals (Real User Monitoring)
        $this->newLine();
        $this->info('--- Real User Monitoring (Web Vitals p75 Summary) ---');
        
        $hasTable = DB::getSchemaBuilder()->hasTable('web_vitals_metrics');
        if ($hasTable) {
            $isPgsql = DB::connection()->getDriverName() === 'pgsql';
            if ($isPgsql) {
                $vitals = DB::table('web_vitals_metrics')
                    ->selectRaw("route, metric, count(*) as samples, round(percentile_cont(0.75) within group (order by value)::numeric, 2) as p75, round(avg(value)::numeric, 2) as avg_val")
                    ->groupBy('route', 'metric')
                    ->orderBy('route')
                    ->get();
            } else {
                $vitals = DB::table('web_vitals_metrics')
                    ->selectRaw("route, metric, count(*) as samples, round(avg(value), 2) as p75, round(avg(value), 2) as avg_val")
                    ->groupBy('route', 'metric')
                    ->orderBy('route')
                    ->get();
            }

            if ($vitals->isNotEmpty()) {
                $rows = $vitals->map(fn($v) => [
                    $v->route,
                    $v->metric,
                    $v->p75,
                    $v->avg_val,
                    $v->samples,
                ])->toArray();

                $this->table(
                    ['Route', 'Metric', 'p75 Value', 'Avg Value', 'Sample Count'],
                    $rows
                );
            } else {
                $this->line('No RUM telemetry recorded yet. Clients send telemetry via POST /api/v1/metrics/vitals');
            }
        }

        // 2. Slow Queries & Excessive Query Alerts from Laravel Log
        $this->newLine();
        $this->info('--- Slow Query & Excessive Query Alerts from Logs ---');
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            $lines = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $perfAlerts = [];
            foreach (array_reverse($lines) as $line) {
                if (str_contains($line, '[Perf Alert]')) {
                    $perfAlerts[] = $line;
                    if (count($perfAlerts) >= (int) $this->option('limit')) {
                        break;
                    }
                }
            }

            if (!empty($perfAlerts)) {
                foreach ($perfAlerts as $alert) {
                    $this->warn($alert);
                }
            } else {
                $this->info('No [Perf Alert] entries found in recent log.');
            }
        } else {
            $this->line("Log file not found at: {$logPath}");
        }

        $this->newLine();
        $this->info('Report completed successfully.');
        return Command::SUCCESS;
    }
}
