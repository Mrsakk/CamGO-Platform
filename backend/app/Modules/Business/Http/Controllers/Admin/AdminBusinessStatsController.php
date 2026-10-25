<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessContactEvent;
use App\Modules\Business\Models\BusinessDailyStat;
use App\Modules\Business\Models\BusinessReview;
use App\Modules\Business\Models\Category;
use App\Modules\Business\Models\Payment;
use App\Modules\Business\Models\SubscriptionRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminBusinessStatsController extends ApiController
{
    /**
     * Overall directory statistics dashboard.
     */
    public function overview(): JsonResponse
    {
        $this->authorize('viewStats', Business::class);

        $payload = Cache::remember('admin:business:stats:overview', 30, function () {
            // Counts by status
            $statusCounts = Business::select('status', DB::raw('COUNT(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status')
                ->toArray();

        // Counts by category
        $byCategory = Category::withCount('businesses')
            ->orderByDesc('businesses_count')
            ->get(['id', 'slug', 'name_en', 'name_km', 'businesses_count']);

        // Counts by province
        $byProvince = Business::join('provinces', 'biz_businesses.province_id', '=', 'provinces.id')
            ->select('provinces.id', 'provinces.name_en', 'provinces.name_km', DB::raw('COUNT(biz_businesses.id) as total'))
            ->groupBy('provinces.id', 'provinces.name_en', 'provinces.name_km')
            ->orderByDesc('total')
            ->take(10)
            ->get();

        // Contact interactions in last 7 and 30 days
        $contacts7d = BusinessContactEvent::where('occurred_at', '>=', now()->subDays(7))
            ->where('channel', '!=', 'profile_view')
            ->count();

        $contacts30d = BusinessContactEvent::where('occurred_at', '>=', now()->subDays(30))
            ->where('channel', '!=', 'profile_view')
            ->count();

        $views30d = BusinessContactEvent::where('occurred_at', '>=', now()->subDays(30))
            ->where('channel', 'profile_view')
            ->count();

        // Top 10 businesses by contacts in last 30 days
        $topBusinesses = Business::leftJoin('biz_contact_events', function ($join) {
                $join->on('biz_businesses.id', '=', 'biz_contact_events.business_id')
                     ->where('biz_contact_events.occurred_at', '>=', now()->subDays(30))
                     ->where('biz_contact_events.channel', '!=', 'profile_view');
            })
            ->select('biz_businesses.id', 'biz_businesses.slug', 'biz_businesses.name_en', 'biz_businesses.name_km', 'biz_businesses.is_verified', DB::raw('COUNT(biz_contact_events.id) as contacts_count'))
            ->groupBy('biz_businesses.id', 'biz_businesses.slug', 'biz_businesses.name_en', 'biz_businesses.name_km', 'biz_businesses.is_verified')
            ->orderByDesc('contacts_count')
            ->take(10)
            ->get();

        // Channels breakdown in last 30 days
        $channels = BusinessContactEvent::where('occurred_at', '>=', now()->subDays(30))
            ->where('channel', '!=', 'profile_view')
            ->select('channel', DB::raw('COUNT(*) as count'))
            ->groupBy('channel')
            ->pluck('count', 'channel')
            ->toArray();

        // Operational queue: pending publishing approvals
        $pendingApprovalsQuery = Business::whereIn('status', ['pending_review', 'pending'])
            ->orderBy('updated_at');
        $pendingApprovalsCount = (clone $pendingApprovalsQuery)->count();
        $pendingApprovals = (clone $pendingApprovalsQuery)
            ->take(5)
            ->get(['id', 'slug', 'name_km', 'name_en', 'status', 'tier', 'updated_at'])
            ->map(fn (Business $business) => [
                'id' => $business->id,
                'slug' => $business->slug,
                'name_km' => $business->name_km,
                'name_en' => $business->name_en,
                'tier' => $business->tier ?: 'free',
                'updated_at' => $business->updated_at?->toIso8601String(),
                'waiting_days' => $business->updated_at ? (int) $business->updated_at->diffInDays(now()) : 0,
                'can_be_approved' => $business->canBeApproved(),
                'missing_count' => count($business->getPublishingMissingRequirements()),
            ]);

        // Operational queue: pending upgrade/subscription requests
        $pendingRequestsQuery = SubscriptionRequest::where('status', 'pending')
            ->with(['business:id,slug,name_km,name_en,tier', 'requestedPlan:id,code,name_km,name_en,price_usd,billing_cycle'])
            ->latest('id');
        $pendingRequestsCount = (clone $pendingRequestsQuery)->count();
        $pendingRequests = (clone $pendingRequestsQuery)
            ->take(5)
            ->get()
            ->map(fn (SubscriptionRequest $request) => [
                'id' => $request->id,
                'contact_phone' => $request->contact_phone,
                'note' => $request->note,
                'created_at' => $request->created_at?->toIso8601String(),
                'business' => $request->business ? [
                    'id' => $request->business->id,
                    'slug' => $request->business->slug,
                    'name_km' => $request->business->name_km,
                    'name_en' => $request->business->name_en,
                    'tier' => $request->business->tier ?: 'free',
                ] : null,
                'requested_plan' => $request->requestedPlan ? [
                    'id' => $request->requestedPlan->id,
                    'code' => $request->requestedPlan->code,
                    'name_km' => $request->requestedPlan->name_km,
                    'name_en' => $request->requestedPlan->name_en,
                    'price_usd' => (float) $request->requestedPlan->price_usd,
                ] : null,
            ]);

        // Operational queue: pending manual payments
        $pendingPaymentsQuery = Payment::where('status', 'pending')
            ->with(['subscription.business:id,slug,name_km,name_en'])
            ->latest('created_at');
        $pendingPaymentsCount = (clone $pendingPaymentsQuery)->count();
        $pendingPayments = (clone $pendingPaymentsQuery)
            ->take(5)
            ->get()
            ->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'subscription_id' => $payment->subscription_id,
                'amount_usd' => (float) $payment->amount_usd,
                'currency' => $payment->currency,
                'method' => $payment->method,
                'reference_no' => $payment->reference_no,
                'paid_at' => $payment->paid_at?->toIso8601String(),
                'created_at' => $payment->created_at?->toIso8601String(),
                'business' => $payment->subscription?->business ? [
                    'id' => $payment->subscription->business->id,
                    'slug' => $payment->subscription->business->slug,
                    'name_km' => $payment->subscription->business->name_km,
                    'name_en' => $payment->subscription->business->name_en,
                ] : null,
            ]);

        // Operational queue: paid plans/trials expiring in the next 30 days
        $expiringPlansQuery = Business::with(['activeSubscription.plan'])
            ->where('tier', '!=', 'free')
            ->whereNotNull('subscription_expires_at')
            ->where('subscription_expires_at', '>', now())
            ->where('subscription_expires_at', '<=', now()->addDays(30))
            ->orderBy('subscription_expires_at');
        $expiringPlansCount = (clone $expiringPlansQuery)->count();
        $expiringTrialsCount = (clone $expiringPlansQuery)
            ->whereHas('activeSubscription', fn ($query) => $query->where('is_trial', true))
            ->count();
        $expiringPlans = (clone $expiringPlansQuery)
            ->take(5)
            ->get(['id', 'slug', 'name_km', 'name_en', 'tier', 'subscription_expires_at'])
            ->map(fn (Business $business) => [
                'id' => $business->id,
                'slug' => $business->slug,
                'name_km' => $business->name_km,
                'name_en' => $business->name_en,
                'tier' => $business->tier ?: 'free',
                'expires_at' => $business->subscription_expires_at?->toIso8601String(),
                'days_left' => $business->subscription_expires_at
                    ? (int) now()->diffInDays($business->subscription_expires_at)
                    : 0,
                'is_trial' => (bool) $business->activeSubscription?->is_trial,
                'plan_name' => $business->activeSubscription?->plan?->name_en,
            ]);

        $overview = [
            'total_businesses' => Business::count(),
            'approved_businesses' => $statusCounts['approved'] ?? 0,
            'draft_businesses' => $statusCounts['draft'] ?? 0,
            'pending_review_businesses' => $statusCounts['pending_review'] ?? 0,
            'suspended_businesses' => $statusCounts['suspended'] ?? 0,
            'verified_businesses' => Business::where('is_verified', true)->count(),
            'contacts_7d' => $contacts7d,
            'contacts_30d' => $contacts30d,
            'views_30d' => $views30d,
            'total_reviews' => BusinessReview::count(),
            'pending_reviews' => BusinessReview::where('status', 'pending')->count(),
        ];

            return [
                'overview' => $overview,
                'channels' => $channels,
                'totals' => [
                    'total_businesses' => Business::count(),
                    'approved' => $statusCounts['approved'] ?? 0,
                    'draft' => $statusCounts['draft'] ?? 0,
                    'pending_review' => $statusCounts['pending_review'] ?? 0,
                    'suspended' => $statusCounts['suspended'] ?? 0,
                    'verified' => Business::where('is_verified', true)->count(),
                ],
                'interactions' => [
                    'contacts_last_7_days' => $contacts7d,
                    'contacts_last_30_days' => $contacts30d,
                    'profile_views_last_30_days' => $views30d,
                ],
                'by_category' => $byCategory,
                'by_province' => $byProvince,
                'top_businesses' => $topBusinesses,
                'queues' => [
                    'counts' => [
                        'pending_approvals' => $pendingApprovalsCount,
                        'pending_subscription_requests' => $pendingRequestsCount,
                        'pending_payments' => $pendingPaymentsCount,
                        'expiring_plans' => $expiringPlansCount,
                        'expiring_trials' => $expiringTrialsCount,
                    ],
                    'pending_approvals' => $pendingApprovals,
                    'subscription_requests' => $pendingRequests,
                    'pending_payments' => $pendingPayments,
                    'expiring_plans' => $expiringPlans,
                ],
            ];
        });

        return $this->successResponse($payload);
    }

    /**
     * Per-business interaction statistics and breakdown.
     */
    public function businessStats(Request $request, int $id): JsonResponse
    {
        $business = Business::findOrFail($id);
        $this->authorize('viewStats', $business);

        $range = $request->input('range', '30d');
        $days = match ($range) {
            '7d' => 7,
            '90d' => 90,
            default => 30,
        };

        $cacheKey = "admin:biz:stats:{$id}:{$days}";
        $data = Cache::remember($cacheKey, 30, function () use ($business, $days, $range) {
            $startDate = now()->subDays($days);

            // Events breakdown by channel
            $events = BusinessContactEvent::where('business_id', $business->id)
                ->where('occurred_at', '>=', $startDate)
                ->select('channel', DB::raw('COUNT(*) as count'))
                ->groupBy('channel')
                ->pluck('count', 'channel')
                ->toArray();

            // Daily trend
            $daily = BusinessContactEvent::where('business_id', $business->id)
                ->where('occurred_at', '>=', $startDate)
                ->select(
                    DB::raw('DATE(occurred_at) as date'),
                    DB::raw("SUM(CASE WHEN channel = 'profile_view' THEN 1 ELSE 0 END) as views"),
                    DB::raw("SUM(CASE WHEN channel != 'profile_view' THEN 1 ELSE 0 END) as contacts")
                )
                ->groupBy(DB::raw('DATE(occurred_at)'))
                ->orderBy('date')
                ->get();

            $totalViews = $events['profile_view'] ?? 0;
            $totalContacts = array_sum(array_filter(
                $events,
                fn ($k) => $k !== 'profile_view',
                ARRAY_FILTER_USE_KEY
            ));

            return [
                'business_id' => $business->id,
                'business_name_en' => $business->name_en,
                'business_name_km' => $business->name_km,
                'range' => $range,
                'summary' => [
                    'total_views' => $totalViews,
                    'total_contacts' => $totalContacts,
                    'channels' => $events,
                ],
                'daily_trend' => $daily,
            ];
        });

        return $this->successResponse($data);
    }


    /**
     * Download or view monthly report (CSV or Printable HTML) for business owner.
     */
    public function monthlyReport(Request $request, int $id): Response|JsonResponse
    {
        $business = Business::with(['category', 'province'])->findOrFail($id);
        $this->authorize('viewStats', $business);

        $month = $request->input('month', now()->format('Y-m')); // e.g. "2026-10"
        $startDate = Carbon::parse("{$month}-01")->startOfMonth();
        $endDate = Carbon::parse("{$month}-01")->endOfMonth();

        $events = BusinessContactEvent::where('business_id', $business->id)
            ->whereBetween('occurred_at', [$startDate, $endDate])
            ->select('channel', DB::raw('COUNT(*) as count'))
            ->groupBy('channel')
            ->pluck('count', 'channel')
            ->toArray();

        $views = $events['profile_view'] ?? 0;
        $contactsOnly = array_filter($events, fn ($k) => $k !== 'profile_view', ARRAY_FILTER_USE_KEY);
        $totalContacts = array_sum($contactsOnly);

        $format = $request->input('format', 'html');

        if ($format === 'csv') {
            $csvHeaders = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => "attachment; filename=\"report-{$business->slug}-{$month}.csv\"",
            ];

            // Add UTF-8 BOM for Excel Khmer text compatibility
            $output = "\xEF\xBB\xBF";
            $output .= "CamGO Business Monthly Report\n";
            $output .= "Month,{$month}\n";
            $output .= "Business (EN),\"" . str_replace('"', '""', $business->name_en) . "\"\n";
            $output .= "Business (KM),\"" . str_replace('"', '""', $business->name_km) . "\"\n";
            $output .= "Province,\"" . ($business->province?->name_en ?? '') . "\"\n";
            $output .= "Category,\"" . ($business->category?->name_en ?? '') . "\"\n";
            $output .= "Profile Views,{$views}\n";
            $output .= "Total Customer Inquiries,{$totalContacts}\n\n";
            $output .= "Channel,Contacts Count\n";

            foreach ($contactsOnly as $ch => $cnt) {
                $output .= ucfirst($ch) . ",{$cnt}\n";
            }

            return response($output, 200, $csvHeaders);
        }

        // Printable HTML Format (Khmer-safe with Kantumruy Pro & Inter fonts)
        $html = view('business.monthly_report', [
            'business' => $business,
            'month' => $month,
            'startDate' => $startDate->format('d M Y'),
            'endDate' => $endDate->format('d M Y'),
            'views' => $views,
            'totalContacts' => $totalContacts,
            'contactsByChannel' => $contactsOnly,
        ])->render();

        return response($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }
}
