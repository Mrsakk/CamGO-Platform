<?php

namespace App\Modules\Business\Actions;

use App\Modules\Business\Models\BusinessContactEvent;
use App\Modules\Business\Models\BusinessDailyStat;
use App\Modules\Business\Models\Lead;
use App\Modules\Business\Models\MetricDaily;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AggregateDailyStatsAction
{
    /**
     * Aggregate contact events for a specific date into biz_daily_stats.
     */
    public function execute(?string $date = null): int
    {
        $targetDate = $date ?: Carbon::yesterday()->toDateString();

        $events = BusinessContactEvent::whereDate('occurred_at', $targetDate)
            ->select('business_id', 'channel', DB::raw('COUNT(*) as count'))
            ->groupBy('business_id', 'channel')
            ->get();

        $byBusiness = [];
        foreach ($events as $row) {
            $bId = $row->business_id;
            if (!isset($byBusiness[$bId])) {
                $byBusiness[$bId] = [
                    'views' => 0,
                    'contacts_total' => 0,
                    'channels' => [],
                ];
            }

            if ($row->channel === 'profile_view') {
                $byBusiness[$bId]['views'] += $row->count;
            } else {
                $byBusiness[$bId]['contacts_total'] += $row->count;
                $byBusiness[$bId]['channels'][$row->channel] = $row->count;
            }
        }

        $recordsCount = 0;
        foreach ($byBusiness as $bId => $stat) {
            BusinessDailyStat::updateOrCreate(
                [
                    'business_id' => $bId,
                    'date' => $targetDate,
                ],
                [
                    'views' => $stat['views'],
                    'contacts_total' => $stat['contacts_total'],
                    'contacts_by_channel' => $stat['channels'],
                ]
            );

            $leads = Lead::where('business_id', $bId)
                ->whereDate('created_at', $targetDate)
                ->count();

            MetricDaily::updateOrCreate(
                ['business_id' => $bId, 'date' => $targetDate],
                [
                    'profile_views' => $stat['views'],
                    'phone_clicks' => $stat['channels']['phone'] ?? 0,
                    'website_clicks' => $stat['channels']['website'] ?? 0,
                    'telegram_clicks' => $stat['channels']['telegram'] ?? 0,
                    'direction_requests' => $stat['channels']['directions'] ?? 0,
                    'leads_count' => $leads,
                ]
            );

            $recordsCount++;
        }

        return $recordsCount;
    }
}
