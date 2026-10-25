<?php

namespace App\Modules\Business\Services;

use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessContactEvent;
use App\Modules\Business\Models\Lead;

class LeadService
{
    private const CONTACT_CHANNELS = ['phone', 'telegram', 'whatsapp', 'messenger', 'email', 'website'];

    public function __construct(private OwnerNotificationService $notifications)
    {
    }

    public function recordContact(BusinessContactEvent $event): ?Lead
    {
        if (!in_array($event->channel, self::CONTACT_CHANNELS, true) || !$event->session_hash) {
            return null;
        }

        $lead = Lead::firstOrNew([
            'business_id' => $event->business_id,
            'session_hash' => $event->session_hash,
        ]);

        $isNew = !$lead->exists;

        $lead->primary_channel = $event->channel;
        $lead->source = $event->source ?: 'profile';
        $lead->locale = $event->locale ?: 'km';
        $lead->contact_count = $isNew ? 1 : (int) $lead->contact_count + 1;
        $lead->first_contact_at = $isNew ? $event->occurred_at : $lead->first_contact_at;
        $lead->last_contact_at = $event->occurred_at;
        $lead->status = $lead->status ?: 'new';
        $lead->save();

        if ($isNew) {
            $business = $event->business ?: Business::find($event->business_id);

            if ($business) {
                $this->notifications->notifyNewLead($business, [
                    'lead_id' => $lead->id,
                    'channel' => $lead->primary_channel,
                    'source' => $lead->source,
                ]);
            }
        }

        return $lead;
    }

    public function stats(Business $business, int $days = 30): array
    {
        $days = max(1, min($days, 365));
        $from = now()->subDays($days - 1)->startOfDay();

        $base = Lead::where('business_id', $business->id);
        $inRange = (clone $base)->where('last_contact_at', '>=', $from);

        $statusCounts = (clone $inRange)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $total = (int) $inRange->count();
        $won = (int) ($statusCounts['won'] ?? 0);

        $dailyCounts = (clone $inRange)
            ->selectRaw('DATE(last_contact_at) as contact_date, count(*) as total')
            ->groupBy(\Illuminate\Support\Facades\DB::raw('DATE(last_contact_at)'))
            ->pluck('total', 'contact_date')
            ->toArray();

        $series = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $series[] = [
                'date' => $date,
                'total' => (int) ($dailyCounts[$date] ?? 0),
            ];
        }

        $channelBreakdown = (clone $inRange)
            ->selectRaw('primary_channel, count(*) as total')
            ->groupBy('primary_channel')
            ->pluck('total', 'primary_channel');

        return [
            'days' => $days,
            'total' => $total,
            'new' => (int) ($statusCounts['new'] ?? 0),
            'contacted' => (int) ($statusCounts['contacted'] ?? 0),
            'qualified' => (int) ($statusCounts['qualified'] ?? 0),
            'won' => $won,
            'lost' => (int) ($statusCounts['lost'] ?? 0),
            'conversion_rate' => $total > 0 ? round(($won / $total) * 100, 1) : 0.0,
            'series' => $series,
            'by_channel' => $channelBreakdown,
        ];
    }

    public function updateStatus(Lead $lead, string $status, ?string $note = null, ?int $assignedTo = null): Lead
    {
        $lead->status = $status;

        if ($note !== null) {
            $lead->note = $note;
        }

        if ($assignedTo !== null) {
            $lead->assigned_to = $assignedTo;
        }

        $lead->save();

        return $lead;
    }

    public function recentStats(Business $business, int $days = 30): array
    {
        $from = now()->subDays($days)->startOfDay();
        $now = now();
        $previousFrom = (clone $from)->subDays($days);

        $current = Lead::where('business_id', $business->id)
            ->whereBetween('last_contact_at', [$from, $now])
            ->count();

        $previous = Lead::where('business_id', $business->id)
            ->whereBetween('last_contact_at', [$previousFrom, $from])
            ->count();

        return [
            'current' => (int) $current,
            'previous' => (int) $previous,
            'change_percent' => $previous > 0
                ? round((($current - $previous) / $previous) * 100, 1)
                : ($current > 0 ? 100.0 : 0.0),
        ];
    }
}
