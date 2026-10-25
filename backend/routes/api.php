<?php

use App\Http\Controllers\Api\V1\Admin\AdminAuditLogController;
use App\Http\Controllers\Api\V1\Admin\AdminBannerController;
use App\Http\Controllers\Api\V1\Admin\AdminBlogController;
use App\Http\Controllers\Api\V1\Admin\AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\AdminContactController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminDestinationController;
use App\Http\Controllers\Api\V1\Admin\AdminEventController;
use App\Http\Controllers\Api\V1\Admin\AdminFaqController;
use App\Http\Controllers\Api\V1\Admin\AdminPageController;
use App\Http\Controllers\Api\V1\Admin\AdminProvinceController;
use App\Http\Controllers\Api\V1\Admin\AdminReviewController;
use App\Http\Controllers\Api\V1\Admin\AdminRoleController;
use App\Http\Controllers\Api\V1\Admin\AdminSettingController;
use App\Http\Controllers\Api\V1\Admin\AdminSubscriberController;
use App\Http\Controllers\Api\V1\Admin\AdminTeamMemberController;
use App\Http\Controllers\Api\V1\Admin\AdminTestimonialController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BannerController;
use App\Http\Controllers\Api\V1\BlogController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\DestinationController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\FaqController;
use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\PageController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ProvinceController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\SubscriberController;
use App\Http\Controllers\Api\V1\TeamMemberController;
use App\Http\Controllers\Api\V1\TestimonialController;
use App\Http\Controllers\Api\V1\HomeController;
use App\Http\Controllers\Api\V1\MetricController;
use App\Http\Controllers\Api\V1\TripController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ==========================================
    // AUTHENTICATION ROUTES (Rate Limited)
    // ==========================================
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    // ==========================================
    // USER PROFILE ROUTES (Authenticated)
    // ==========================================
    Route::middleware('auth:sanctum')->prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('/avatar', [ProfileController::class, 'uploadAvatar']);
        Route::post('/change-password', [ProfileController::class, 'changePassword']);
        Route::get('/favorites', [ProfileController::class, 'favorites']);
        Route::get('/reviews', [ProfileController::class, 'reviews']);
    });

    // ==========================================
    // PUBLIC ROUTES
    // ==========================================

    // Home – single aggregated payload (40 featured pool, categories, provinces, events, posts)
    Route::get('/home', [HomeController::class, 'index']);

    // Destinations
    Route::prefix('destinations')->group(function () {
        Route::get('/', [DestinationController::class, 'index']);
        Route::get('/featured', [DestinationController::class, 'featured']);
        Route::get('/popular', [DestinationController::class, 'popular']);
        Route::get('/suggestions', [DestinationController::class, 'searchSuggestions']);
        Route::get('/{slug}', [DestinationController::class, 'show']);
        Route::get('/{id}/related', [DestinationController::class, 'related']);
        Route::get('/{id}/reviews', [ReviewController::class, 'index']);
    });

    // Provinces
    Route::prefix('provinces')->group(function () {
        Route::get('/', [ProvinceController::class, 'index']);
        Route::get('/{slugOrCode}', [ProvinceController::class, 'show']);
    });

    // Categories
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index']);
        Route::get('/{slug}', [CategoryController::class, 'show']);
    });

    // Blog / News
    Route::prefix('blog')->group(function () {
        Route::get('/', [BlogController::class, 'index']);
        Route::get('/recent', [BlogController::class, 'recent']);
        Route::get('/{slug}', [BlogController::class, 'show']);
    });

    // Events
    Route::prefix('events')->group(function () {
        Route::get('/', [EventController::class, 'index']);
        Route::get('/upcoming', [EventController::class, 'upcoming']);
        Route::get('/{slug}', [EventController::class, 'show']);
    });

    // Banners, FAQs, Static Pages, Settings
    Route::get('/banners', [BannerController::class, 'index']);
    Route::get('/faqs', [FaqController::class, 'index']);
    Route::get('/pages/{slug}', [PageController::class, 'show']);
    Route::get('/team-members', [TeamMemberController::class, 'index']);
    Route::get('/settings', [SettingController::class, 'index']);

    // Inquiries and Newsletter (Rate Limited)
    Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1');
    Route::post('/subscribe', [SubscriberController::class, 'store'])->middleware('throttle:10,1');

    // Website Testimonials ("Loved by Explorers Worldwide")
    Route::get('/testimonials', [TestimonialController::class, 'index']);
    Route::post('/testimonials', [TestimonialController::class, 'store'])->middleware('throttle:10,1');

    // RUM Web Vitals Telemetry (Rate Limited)
    Route::post('/metrics/vitals', [MetricController::class, 'store'])->middleware('throttle:60,1');

    // Community & Users Stats
    Route::get('/community/stats', function () {
        $totalUsers = \App\Models\User::count();
        $sampleUsers = \App\Models\User::where('is_active', true)
            ->whereNotNull('name')
            ->orderByRaw('avatar IS NULL, id ASC')
            ->take(6)
            ->get(['id', 'name', 'avatar', 'country']);

        $avgRating = \App\Models\Testimonial::where('status', 'approved')->avg('rating');
        if (!$avgRating) {
            $avgRating = \App\Models\Review::avg('rating') ?: 5.0;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'sample_users' => $sampleUsers,
                'average_rating' => round((float)$avgRating, 1),
                'total_reviews' => \App\Models\Review::count(),
            ]
        ]);
    });

    // ==========================================
    // AUTHENTICATED USER ACTIONS
    // ==========================================
    Route::middleware('auth:sanctum')->group(function () {
        // Reviews
        Route::post('/destinations/{id}/reviews', [ReviewController::class, 'store']);
        Route::put('/reviews/{id}', [ReviewController::class, 'update']);
        Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

        // Favorites
        Route::post('/destinations/{id}/favorite', [FavoriteController::class, 'toggle']);
        Route::get('/favorites/ids', [FavoriteController::class, 'ids']);

        // Trips (Trip Planner)
        Route::get('/trips', [TripController::class, 'index']);
        Route::post('/trips', [TripController::class, 'store']);
        Route::get('/trips/{id}', [TripController::class, 'show']);
        Route::put('/trips/{id}', [TripController::class, 'update']);
        Route::delete('/trips/{id}', [TripController::class, 'destroy']);
        Route::post('/trips/sync', [TripController::class, 'sync']);
    });

    // ==========================================
    // ADMIN PANEL ROUTES (Protected by Sanctum + Admin Role)
    // ==========================================
    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        // Dashboard Stats & Analytics
        Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/dashboard/user-registrations', [AdminDashboardController::class, 'userRegistrations']);

        // Destinations CRUD + Media
        Route::apiResource('destinations', AdminDestinationController::class);
        Route::patch('/destinations/{id}/publish', [AdminDestinationController::class, 'togglePublish']);
        Route::patch('/destinations/{id}/toggle-status', [AdminDestinationController::class, 'togglePublish']);
        Route::patch('/destinations/{id}/feature', [AdminDestinationController::class, 'toggleFeatured']);
        Route::patch('/destinations/{id}/toggle-featured', [AdminDestinationController::class, 'toggleFeatured']);
        Route::post('/destinations/{id}/images', [AdminDestinationController::class, 'uploadImage']);
        Route::delete('/destinations/{destinationId}/images/{imageId}', [AdminDestinationController::class, 'deleteImage']);

        // Provinces CRUD
        Route::apiResource('provinces', AdminProvinceController::class);

        // Categories CRUD
        Route::apiResource('categories', AdminCategoryController::class);

        // Reviews Moderation
        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::patch('/reviews/{id}/approve', [AdminReviewController::class, 'approve']);
        Route::patch('/reviews/{id}/reject', [AdminReviewController::class, 'reject']);
        Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);

        // Website Testimonials Moderation ("Loved by Explorers Worldwide")
        Route::get('/testimonials', [AdminTestimonialController::class, 'index']);
        Route::patch('/testimonials/{id}/approve', [AdminTestimonialController::class, 'approve']);
        Route::patch('/testimonials/{id}/reject', [AdminTestimonialController::class, 'reject']);
        Route::delete('/testimonials/{id}', [AdminTestimonialController::class, 'destroy']);

        // Users Management
        Route::apiResource('users', AdminUserController::class);
        Route::patch('/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);
        Route::patch('/users/{id}/change-role', [AdminUserController::class, 'changeRole']);
        Route::patch('/users/{id}/role', [AdminUserController::class, 'changeRole']);

        // Blog & Events CRUD
        Route::apiResource('blog', AdminBlogController::class);
        Route::apiResource('blog-posts', AdminBlogController::class);
        Route::apiResource('events', AdminEventController::class);

        // Banners & FAQs CRUD
        Route::apiResource('banners', AdminBannerController::class);
        Route::apiResource('faqs', AdminFaqController::class);

        // Static Pages & Team Members CRUD
        Route::apiResource('pages', AdminPageController::class);
        Route::apiResource('team-members', AdminTeamMemberController::class);

        // Contact Messages Inbox
        Route::get('/contact-messages', [AdminContactController::class, 'index']);
        Route::get('/contact-messages/{id}', [AdminContactController::class, 'show']);
        Route::patch('/contact-messages/{id}/read', [AdminContactController::class, 'markRead']);
        Route::post('/contact-messages/{id}/reply', [AdminContactController::class, 'reply']);
        Route::delete('/contact-messages/{id}', [AdminContactController::class, 'destroy']);
        Route::get('/contacts', [AdminContactController::class, 'index']);
        Route::get('/contacts/{id}', [AdminContactController::class, 'show']);
        Route::patch('/contacts/{id}/read', [AdminContactController::class, 'markRead']);
        Route::delete('/contacts/{id}', [AdminContactController::class, 'destroy']);

        // Newsletter Subscribers & CSV Export
        Route::get('/subscribers', [AdminSubscriberController::class, 'index']);
        Route::get('/subscribers/export', [AdminSubscriberController::class, 'exportCsv']);
        Route::delete('/subscribers/{id}', [AdminSubscriberController::class, 'destroy']);

        // Roles & Permissions
        Route::get('/roles', [AdminRoleController::class, 'index']);
        Route::post('/roles/{role}/permissions', [AdminRoleController::class, 'syncPermissions']);

        // Site Settings
        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::post('/settings', [AdminSettingController::class, 'update']);
        Route::post('/settings/upload-logo', [AdminSettingController::class, 'uploadLogo']);
        Route::post('/settings/upload-favicon', [AdminSettingController::class, 'uploadFavicon']);

        // Audit Logs
        Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);

        // RUM Performance Telemetry Report
        Route::get('/metrics/vitals/report', [MetricController::class, 'report']);
    });
});

// Load Business Module (Step 2A) routes
require __DIR__ . '/business.php';
