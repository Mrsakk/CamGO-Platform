<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\AuditLogResource;
use App\Http\Resources\DestinationListResource;
use App\Http\Resources\ReviewResource;
use App\Models\AuditLog;
use App\Models\ContactMessage;
use App\Models\Destination;
use App\Models\Review;
use App\Models\Subscriber;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends ApiController
{
    /**
     * Get overall admin statistics and analytics charts.
     */
    public function stats(): JsonResponse
    {
        $now = Carbon::now();
        $sevenDaysAgo = $now->copy()->subDays(6)->startOfDay();
        $thirtyDaysAgo = $now->copy()->subDays(29)->startOfDay();

        // 1. Summary counters
        $totalUsers = User::count();
        $newUsers30d = User::where('created_at', '>=', $thirtyDaysAgo)->count();

        $totalDestinations = Destination::count();
        $publishedDestinations = Destination::where('is_published', true)->count();
        $featuredDestinations = Destination::where('is_featured', true)->count();

        $totalReviews = Review::count();
        $pendingReviews = Review::where('status', 'pending')->count();
        $approvedReviews = Review::where('status', 'approved')->count();
        $avgRating = Review::where('status', 'approved')->avg('rating') ?: 4.8;

        $totalInquiries = ContactMessage::count();
        $unreadInquiries = ContactMessage::unread()->count();
        $totalSubscribers = Subscriber::where('is_active', true)->count();

        // 2. Registrations chart (last 7 days)
        $dailyRegistrations7d = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i);
            $dateStr = $day->format('Y-m-d');
            $count = User::whereDate('created_at', $dateStr)->count();
            $dailyRegistrations7d[] = [
                'date' => $day->format('M d'),
                'users' => $count,
                'count' => $count,
            ];
        }

        // 3. Registrations chart (last 30 days)
        $dailyRegistrations30d = [];
        for ($i = 29; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i);
            $dateStr = $day->format('Y-m-d');
            $count = User::whereDate('created_at', $dateStr)->count();
            $dailyRegistrations30d[] = [
                'date' => $day->format('M d'),
                'users' => $count,
                'count' => $count,
            ];
        }

        // 4. Top visited destinations
        $topDestinations = Destination::query()
            ->with(['province', 'category'])
            ->orderByDesc('view_count')
            ->take(5)
            ->get();

        // 5. Recent audit activity
        $recentAuditLogs = AuditLog::query()
            ->with('user')
            ->latest()
            ->take(8)
            ->get();

        // 6. Recent reviews needing attention
        $recentReviews = Review::query()
            ->with(['user', 'reviewable'])
            ->latest()
            ->take(5)
            ->get();

        $counters = [
            'total_users' => $totalUsers,
            'new_users_30d' => $newUsers30d,
            'total_destinations' => $totalDestinations,
            'published_destinations' => $publishedDestinations,
            'featured_destinations' => $featuredDestinations,
            'total_reviews' => $totalReviews,
            'pending_reviews' => $pendingReviews,
            'approved_reviews' => $approvedReviews,
            'avg_rating' => round((float) $avgRating, 2),
            'total_inquiries' => $totalInquiries,
            'unread_inquiries' => $unreadInquiries,
            'total_subscribers' => $totalSubscribers,
        ];

        return $this->successResponse(array_merge($counters, [
            'counters' => $counters,
            'charts' => [
                'registrations_7d' => $dailyRegistrations7d,
                'registrations_30d' => $dailyRegistrations30d,
            ],
            'top_destinations' => DestinationListResource::collection($topDestinations),
            'recent_activities' => AuditLogResource::collection($recentAuditLogs),
            'recent_reviews' => ReviewResource::collection($recentReviews),
        ]), 'Dashboard statistics retrieved');
    }

    /**
     * Get dynamic user registrations trend over specified days (7 or 30).
     */
    public function userRegistrations(Request $request): JsonResponse
    {
        $days = (int) $request->input('days', 30);
        $days = in_array($days, [7, 14, 30, 90]) ? $days : 30;
        $now = Carbon::now();

        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i);
            $dateStr = $day->format('Y-m-d');
            $count = User::whereDate('created_at', $dateStr)->count();
            $data[] = [
                'date' => $day->format('M d'),
                'users' => $count,
                'count' => $count,
            ];
        }

        return $this->successResponse([
            'items' => $data,
        ], 'User registrations retrieved');
    }
}
