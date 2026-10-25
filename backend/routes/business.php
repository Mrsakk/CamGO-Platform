<?php

use App\Modules\Business\Http\Controllers\Admin\AdminBusinessAuditLogController;
use App\Modules\Business\Http\Controllers\Admin\AdminBusinessCategoryController;
use App\Modules\Business\Http\Controllers\Admin\AdminBusinessContactController;
use App\Modules\Business\Http\Controllers\Admin\AdminBusinessController;
use App\Modules\Business\Http\Controllers\Admin\AdminBusinessDocumentController;
use App\Modules\Business\Http\Controllers\Admin\AdminBusinessHourController;
use App\Modules\Business\Http\Controllers\Admin\AdminBusinessMediaController;
use App\Modules\Business\Http\Controllers\Admin\AdminBusinessReviewController;
use App\Modules\Business\Http\Controllers\Admin\AdminBusinessStatsController;
use App\Modules\Business\Http\Controllers\Admin\AdminFeaturedSlotController;
use App\Modules\Business\Http\Controllers\Admin\AdminInvoiceController;
use App\Modules\Business\Http\Controllers\Admin\AdminPartnerRequestController;
use App\Modules\Business\Http\Controllers\Admin\AdminPlanController;
use App\Modules\Business\Http\Controllers\Admin\AdminSubscriptionController;
use App\Modules\Business\Http\Controllers\Admin\AdminSubscriptionRequestController;
use App\Modules\Business\Http\Controllers\Admin\AdminVerificationController;
use App\Modules\Business\Http\Controllers\Owner\OwnerBranchController;
use App\Modules\Business\Http\Controllers\Owner\OwnerBusinessController;
use App\Modules\Business\Http\Controllers\Owner\OwnerInvitationController;
use App\Modules\Business\Http\Controllers\Owner\OwnerKycController;
use App\Modules\Business\Http\Controllers\Owner\OwnerLeadController;
use App\Modules\Business\Http\Controllers\Owner\OwnerNotificationController;
use App\Modules\Business\Http\Controllers\Owner\OwnerPartnerRequestController;
use App\Modules\Business\Http\Controllers\Owner\OwnerReviewController;
use App\Modules\Business\Http\Controllers\Owner\OwnerServiceController;
use App\Modules\Business\Http\Controllers\Owner\OwnerSubscriptionController;
use App\Modules\Business\Http\Controllers\Owner\OwnerTeamController;
use App\Modules\Business\Http\Controllers\Owner\OwnerVerificationController;
use App\Modules\Business\Http\Controllers\Public\NearbyBusinessController;
use App\Modules\Business\Http\Controllers\Public\PublicBusinessController;
use App\Modules\Business\Http\Controllers\Public\PublicCategoryController;
use App\Modules\Business\Http\Controllers\Public\PublicEventController;
use App\Modules\Business\Http\Controllers\Public\PublicLeadController;
use App\Modules\Business\Http\Controllers\Public\PublicProvinceController;
use App\Modules\Business\Http\Controllers\Public\PublicReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Business Module Routes (V1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ==========================================
    // PUBLIC BUSINESS ROUTES (Unauthenticated)
    // ==========================================
    Route::prefix('business/public')->group(function () {
        Route::get('/home', [PublicBusinessController::class, 'home']);
        Route::get('/categories', [PublicCategoryController::class, 'index']);
        Route::get('/provinces', [PublicProvinceController::class, 'index']);
        Route::get('/businesses', [PublicBusinessController::class, 'index']);
        Route::get('/businesses/{slug}', [PublicBusinessController::class, 'show']);
        Route::post('/businesses/{slug}/reviews', [PublicReviewController::class, 'store'])->middleware('throttle:10,1');
        Route::post('/businesses/{slug}/events', [PublicEventController::class, 'store'])->middleware('throttle:60,1');
    });

    // Canonical public directory routes (Prompt 2A-plus).
    Route::prefix('business')->group(function () {
        Route::get('/home', [PublicBusinessController::class, 'home']);
        Route::get('/categories', [PublicCategoryController::class, 'index']);
        Route::get('/provinces', [PublicProvinceController::class, 'index']);
        Route::get('/businesses', [PublicBusinessController::class, 'index']);
        Route::get('/businesses/{slug}', [PublicBusinessController::class, 'show']);
        Route::get('/businesses/{slug}/reviews', [PublicReviewController::class, 'index']);
        Route::post('/businesses/{slug}/leads', [PublicLeadController::class, 'store'])->middleware('throttle:10,1');
        Route::post('/businesses/{slug}/reviews', [PublicReviewController::class, 'storeAuthenticated'])
            ->middleware(['auth:sanctum', 'throttle:10,1']);
    });

    // Destination cross-linking for Travel frontend
    Route::get('/destinations/{slug}/nearby-businesses', [NearbyBusinessController::class, 'forDestination']);

    // ==========================================
    // OWNER BUSINESS ROUTES (Sanctum Authenticated)
    // ==========================================
    Route::prefix('business/owner')->middleware(['auth:sanctum', 'business.context', 'owner'])->group(function () {
        Route::get('/my-business', [OwnerBusinessController::class, 'myBusiness'])->middleware('business.can:business.view');
        Route::put('/my-business', [OwnerBusinessController::class, 'updateMyBusiness'])->middleware('business.can:profile.update');
        Route::get('/stats', [OwnerBusinessController::class, 'stats'])->middleware('business.can:stats.view');

        // Scoped business hours & closures
        Route::put('/hours', [OwnerBusinessController::class, 'syncHours'])->middleware('business.can:hours.manage');
        Route::post('/closures', [OwnerBusinessController::class, 'storeClosure'])->middleware('business.can:hours.manage');
        Route::delete('/closures/{closureId}', [OwnerBusinessController::class, 'destroyClosure'])->middleware('business.can:hours.manage');

        // Scoped business contacts
        Route::post('/contacts', [OwnerBusinessController::class, 'storeContact'])->middleware('business.can:profile.update');
        Route::put('/contacts/{contactId}', [OwnerBusinessController::class, 'updateContact'])->middleware('business.can:profile.update');
        Route::delete('/contacts/{contactId}', [OwnerBusinessController::class, 'destroyContact'])->middleware('business.can:profile.update');

        // Scoped service catalog
        Route::post('/services', [OwnerServiceController::class, 'store'])->middleware('business.can:profile.update');
        Route::put('/services/{serviceId}', [OwnerServiceController::class, 'update'])->middleware('business.can:profile.update');
        Route::delete('/services/{serviceId}', [OwnerServiceController::class, 'destroy'])->middleware('business.can:profile.update');

        // Scoped business media
        Route::post('/media', [OwnerBusinessController::class, 'uploadMedia'])->middleware('business.can:media.manage');
        Route::post('/media/{mediaId}/cover', [OwnerBusinessController::class, 'setCoverMedia'])->middleware('business.can:media.manage');
        Route::delete('/media/{mediaId}', [OwnerBusinessController::class, 'destroyMedia'])->middleware('business.can:media.manage');

        // KYC document vault (private files, owner-scoped)
        Route::get('/kyc', [OwnerKycController::class, 'index'])->middleware('business.can:kyc.manage');
        Route::post('/kyc', [OwnerKycController::class, 'upload'])->middleware('business.can:kyc.manage');
        Route::get('/kyc/{documentId}/download', [OwnerKycController::class, 'download'])->middleware('business.can:kyc.manage');
        Route::delete('/kyc/{documentId}', [OwnerKycController::class, 'destroy'])->middleware('business.can:kyc.manage');

        // Leads and customer inquiries
        Route::get('/leads', [OwnerLeadController::class, 'index'])->middleware('business.can:leads.view');
        Route::get('/leads/stats', [OwnerLeadController::class, 'stats'])->middleware('business.can:leads.view');
        Route::get('/leads/export', [OwnerLeadController::class, 'export'])->middleware('business.can:leads.view');
        Route::put('/leads/{leadId}', [OwnerLeadController::class, 'update'])->middleware('business.can:leads.manage');

        // Reviews and owner replies
        Route::get('/reviews', [OwnerReviewController::class, 'index'])->middleware('business.can:reviews.view');
        Route::get('/reviews/stats', [OwnerReviewController::class, 'stats'])->middleware('business.can:reviews.view');
        Route::put('/reviews/{reviewId}/reply', [OwnerReviewController::class, 'reply'])->middleware('business.can:reviews.manage');

        // In-app notifications and Telegram preferences
        Route::get('/notifications', [OwnerNotificationController::class, 'index'])->middleware('business.can:notifications.view');
        Route::get('/notifications/unread-count', [OwnerNotificationController::class, 'unreadCount'])->middleware('business.can:notifications.view');
        Route::post('/notifications/read-all', [OwnerNotificationController::class, 'markAllRead'])->middleware('business.can:notifications.view');
        Route::post('/notifications/{notificationId}/read', [OwnerNotificationController::class, 'markRead'])->middleware('business.can:notifications.view');
        Route::get('/notifications/settings', [OwnerNotificationController::class, 'settings'])->middleware('business.can:notifications.view');
        Route::put('/notifications/settings', [OwnerNotificationController::class, 'updateSettings'])->middleware('business.can:notifications.view');

        // Team management and roles
        Route::get('/team', [OwnerTeamController::class, 'index'])->middleware('business.can:team.manage');
        Route::post('/team/invite', [OwnerTeamController::class, 'invite'])->middleware('business.can:team.manage');
        Route::put('/team/{memberId}', [OwnerTeamController::class, 'update'])->middleware('business.can:team.manage');
        Route::delete('/team/{memberId}', [OwnerTeamController::class, 'destroy'])->middleware('business.can:team.manage');

        // Subscription plans, trial, and upgrade requests
        Route::get('/plans', [OwnerSubscriptionController::class, 'plans'])->middleware('business.can:billing.manage');
        Route::get('/subscription', [OwnerSubscriptionController::class, 'show'])->middleware('business.can:billing.manage');
        Route::post('/subscription/trial', [OwnerSubscriptionController::class, 'startTrial'])->middleware('business.can:billing.manage');
        Route::post('/subscription/request', [OwnerSubscriptionController::class, 'requestPlan'])->middleware('business.can:billing.manage');
        Route::post('/subscription/requests/{id}/cancel', [OwnerSubscriptionController::class, 'cancelRequest'])->middleware('business.can:billing.manage');
    });

    // Canonical owner dashboard routes mounted under /business/me.
    Route::prefix('business/me')->middleware(['auth:sanctum', 'business.context', 'owner'])->group(function () {
        Route::get('/business', [OwnerBusinessController::class, 'myBusiness'])->middleware('business.can:business.view');
        Route::put('/business', [OwnerBusinessController::class, 'updateMyBusiness'])->middleware('business.can:profile.update');
        Route::get('/stats', [OwnerBusinessController::class, 'stats'])->middleware('business.can:stats.view');

        Route::put('/hours', [OwnerBusinessController::class, 'syncHours'])->middleware('business.can:hours.manage');
        Route::post('/closures', [OwnerBusinessController::class, 'storeClosure'])->middleware('business.can:hours.manage');
        Route::delete('/closures/{closureId}', [OwnerBusinessController::class, 'destroyClosure'])->middleware('business.can:hours.manage');

        Route::post('/contacts', [OwnerBusinessController::class, 'storeContact'])->middleware('business.can:profile.update');
        Route::put('/contacts/{contactId}', [OwnerBusinessController::class, 'updateContact'])->middleware('business.can:profile.update');
        Route::delete('/contacts/{contactId}', [OwnerBusinessController::class, 'destroyContact'])->middleware('business.can:profile.update');

        Route::post('/services', [OwnerServiceController::class, 'store'])->middleware('business.can:profile.update');
        Route::put('/services/{serviceId}', [OwnerServiceController::class, 'update'])->middleware('business.can:profile.update');
        Route::delete('/services/{serviceId}', [OwnerServiceController::class, 'destroy'])->middleware('business.can:profile.update');

        Route::post('/media', [OwnerBusinessController::class, 'uploadMedia'])->middleware('business.can:media.manage');
        Route::post('/media/{mediaId}/cover', [OwnerBusinessController::class, 'setCoverMedia'])->middleware('business.can:media.manage');
        Route::delete('/media/{mediaId}', [OwnerBusinessController::class, 'destroyMedia'])->middleware('business.can:media.manage');

        Route::get('/kyc', [OwnerKycController::class, 'index'])->middleware('business.can:kyc.manage');
        Route::post('/kyc', [OwnerKycController::class, 'upload'])->middleware('business.can:kyc.manage');
        Route::get('/kyc/{documentId}/download', [OwnerKycController::class, 'download'])->middleware('business.can:kyc.manage');
        Route::delete('/kyc/{documentId}', [OwnerKycController::class, 'destroy'])->middleware('business.can:kyc.manage');
        Route::get('/verifications', [OwnerVerificationController::class, 'index'])->middleware('business.can:kyc.manage');
        Route::post('/verifications', [OwnerVerificationController::class, 'store'])->middleware('business.can:kyc.manage');

        Route::get('/leads', [OwnerLeadController::class, 'index'])->middleware('business.can:leads.view');
        Route::get('/leads/stats', [OwnerLeadController::class, 'stats'])->middleware('business.can:leads.view');
        Route::get('/leads/export', [OwnerLeadController::class, 'export'])->middleware('business.can:leads.view');
        Route::put('/leads/{leadId}', [OwnerLeadController::class, 'update'])->middleware('business.can:leads.manage');
        Route::post('/leads/{leadId}/notes', [OwnerLeadController::class, 'addNote'])->middleware('business.can:leads.manage');

        Route::get('/reviews', [OwnerReviewController::class, 'index'])->middleware('business.can:reviews.view');
        Route::get('/reviews/stats', [OwnerReviewController::class, 'stats'])->middleware('business.can:reviews.view');
        Route::put('/reviews/{reviewId}/reply', [OwnerReviewController::class, 'reply'])->middleware('business.can:reviews.manage');

        Route::get('/notifications', [OwnerNotificationController::class, 'index'])->middleware('business.can:notifications.view');
        Route::get('/notifications/unread-count', [OwnerNotificationController::class, 'unreadCount'])->middleware('business.can:notifications.view');
        Route::post('/notifications/read-all', [OwnerNotificationController::class, 'markAllRead'])->middleware('business.can:notifications.view');
        Route::post('/notifications/{notificationId}/read', [OwnerNotificationController::class, 'markRead'])->middleware('business.can:notifications.view');
        Route::get('/notifications/settings', [OwnerNotificationController::class, 'settings'])->middleware('business.can:notifications.view');
        Route::put('/notifications/settings', [OwnerNotificationController::class, 'updateSettings'])->middleware('business.can:notifications.view');

        Route::get('/team', [OwnerInvitationController::class, 'index'])->middleware('business.can:team.manage');
        Route::post('/team/invitations', [OwnerInvitationController::class, 'store'])->middleware('business.can:team.manage');
        Route::delete('/team/invitations/{id}', [OwnerInvitationController::class, 'cancel'])->middleware('business.can:team.manage');

        Route::get('/branches', [OwnerBranchController::class, 'index'])->middleware('business.can:business.view');
        Route::post('/branches', [OwnerBranchController::class, 'store'])->middleware('business.can:profile.update');
        Route::put('/branches/{branchId}', [OwnerBranchController::class, 'update'])->middleware('business.can:profile.update');
        Route::delete('/branches/{branchId}', [OwnerBranchController::class, 'destroy'])->middleware('business.can:profile.update');

        Route::get('/partner-requests', [OwnerPartnerRequestController::class, 'index'])->middleware('business.can:billing.manage');
        Route::post('/partner-requests', [OwnerPartnerRequestController::class, 'store'])->middleware('business.can:billing.manage');

        Route::get('/plans', [OwnerSubscriptionController::class, 'plans'])->middleware('business.can:billing.manage');
        Route::get('/subscription', [OwnerSubscriptionController::class, 'show'])->middleware('business.can:billing.manage');
        Route::post('/subscription/trial', [OwnerSubscriptionController::class, 'startTrial'])->middleware('business.can:billing.manage');
        Route::post('/subscription/request', [OwnerSubscriptionController::class, 'requestPlan'])->middleware('business.can:billing.manage');
        Route::post('/subscription/requests/{id}/cancel', [OwnerSubscriptionController::class, 'cancelRequest'])->middleware('business.can:billing.manage');
    });

    // Invited team members accept before they are linked to the business.
    Route::post('business/team/accept/{token}', [OwnerTeamController::class, 'accept'])
        ->middleware('auth:sanctum');
    Route::post('business/me/team/invitations/{token}/accept', [OwnerInvitationController::class, 'accept'])
        ->middleware(['auth:sanctum', 'business.context']);

    // ==========================================
    // ADMIN BUSINESS ROUTES (Sanctum + Admin)
    // ==========================================
    Route::prefix('admin/business')->middleware(['auth:sanctum', 'admin'])->group(function () {
        // Dashboard & Analytics
        Route::get('/stats', [AdminBusinessStatsController::class, 'overview']);
        Route::get('/businesses/{id}/stats', [AdminBusinessStatsController::class, 'businessStats']);
        Route::get('/businesses/{id}/report', [AdminBusinessStatsController::class, 'monthlyReport']);

        // Businesses CRUD
        Route::get('/businesses', [AdminBusinessController::class, 'index']);
        Route::post('/businesses', [AdminBusinessController::class, 'store']);
        Route::get('/businesses/{id}', [AdminBusinessController::class, 'show']);
        Route::put('/businesses/{id}', [AdminBusinessController::class, 'update']);
        Route::delete('/businesses/{id}', [AdminBusinessController::class, 'destroy']);
        Route::post('/businesses/{id}/status', [AdminBusinessController::class, 'updateStatus']);
        Route::post('/businesses/{id}/verify', [AdminBusinessController::class, 'verify']);
        Route::post('/businesses/{id}/unverify', [AdminBusinessController::class, 'unverify']);
        Route::post('/businesses/{id}/owner-account', [AdminBusinessController::class, 'createOwnerAccount']);
        Route::post('/businesses/{id}/owner-accounts/{userId}/setup-link', [AdminBusinessController::class, 'regenerateOwnerSetupLink']);
        Route::post('/businesses/{id}/subscription', [AdminBusinessController::class, 'updateSubscription']);

        // Contacts CRUD
        Route::get('/businesses/{id}/contacts', [AdminBusinessContactController::class, 'index']);
        Route::post('/businesses/{id}/contacts', [AdminBusinessContactController::class, 'store']);
        Route::put('/businesses/{id}/contacts/{contactId}', [AdminBusinessContactController::class, 'update']);
        Route::delete('/businesses/{id}/contacts/{contactId}', [AdminBusinessContactController::class, 'destroy']);

        // Hours & Closures
        Route::get('/businesses/{id}/hours', [AdminBusinessHourController::class, 'getHours']);
        Route::put('/businesses/{id}/hours', [AdminBusinessHourController::class, 'syncHours']);
        Route::get('/businesses/{id}/closures', [AdminBusinessHourController::class, 'getClosures']);
        Route::post('/businesses/{id}/closures', [AdminBusinessHourController::class, 'storeClosure']);
        Route::delete('/businesses/{id}/closures/{closureId}', [AdminBusinessHourController::class, 'destroyClosure']);

        // Media Gallery
        Route::post('/businesses/{id}/media', [AdminBusinessMediaController::class, 'upload']);
        Route::post('/businesses/{id}/media/{mediaId}/cover', [AdminBusinessMediaController::class, 'setCover']);
        Route::put('/businesses/{id}/media/reorder', [AdminBusinessMediaController::class, 'reorder']);
        Route::delete('/businesses/{id}/media/{mediaId}', [AdminBusinessMediaController::class, 'destroy']);

        // Documents (KYC Vault)
        Route::get('/businesses/{id}/documents', [AdminBusinessDocumentController::class, 'index']);
        Route::post('/businesses/{id}/documents', [AdminBusinessDocumentController::class, 'upload']);
        Route::get('/businesses/{id}/documents/{documentId}/download', [AdminBusinessDocumentController::class, 'download']);
        Route::delete('/businesses/{id}/documents/{documentId}', [AdminBusinessDocumentController::class, 'destroy']);

        // Reviews Moderation Queue
        Route::get('/reviews', [AdminBusinessReviewController::class, 'index']);
        Route::post('/reviews/{id}/approve', [AdminBusinessReviewController::class, 'approve']);
        Route::post('/reviews/{id}/reject', [AdminBusinessReviewController::class, 'reject']);
        Route::post('/reviews/bulk-moderate', [AdminBusinessReviewController::class, 'bulkModerate']);
        Route::delete('/reviews/{id}', [AdminBusinessReviewController::class, 'destroy']);

        // Categories CRUD
        Route::get('/categories', [AdminBusinessCategoryController::class, 'index']);
        Route::post('/categories', [AdminBusinessCategoryController::class, 'store']);
        Route::put('/categories/{id}', [AdminBusinessCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AdminBusinessCategoryController::class, 'destroy']);

        // Verification workflow
        Route::get('/verifications', [AdminVerificationController::class, 'index']);
        Route::post('/verifications/{id}/approve', [AdminVerificationController::class, 'approve']);
        Route::post('/verifications/{id}/reject', [AdminVerificationController::class, 'reject']);

        // Partner requests
        Route::get('/partner-requests', [AdminPartnerRequestController::class, 'index']);
        Route::post('/partner-requests/{id}/review', [AdminPartnerRequestController::class, 'review']);

        // Featured slots
        Route::get('/featured-slots', [AdminFeaturedSlotController::class, 'index']);
        Route::post('/featured-slots', [AdminFeaturedSlotController::class, 'store']);
        Route::put('/featured-slots/{id}', [AdminFeaturedSlotController::class, 'update']);

        // Invoices
        Route::get('/invoices', [AdminInvoiceController::class, 'index']);
        Route::post('/invoices', [AdminInvoiceController::class, 'store']);
        Route::post('/invoices/{id}/paid', [AdminInvoiceController::class, 'markPaid']);
        Route::post('/invoices/{id}/void', [AdminInvoiceController::class, 'void']);

        // Billing: plans, subscriptions, payments, upgrade requests
        Route::prefix('billing')->group(function () {
            Route::get('/plans', [AdminPlanController::class, 'index']);
            Route::post('/plans', [AdminPlanController::class, 'store']);
            Route::put('/plans/{id}', [AdminPlanController::class, 'update']);

            Route::get('/stats', [AdminSubscriptionController::class, 'stats']);
            Route::get('/subscriptions', [AdminSubscriptionController::class, 'index']);
            Route::post('/businesses/{id}/activate', [AdminSubscriptionController::class, 'activate']);
            Route::post('/subscriptions/{id}/payments', [AdminSubscriptionController::class, 'recordPayment']);
            Route::get('/payments', [AdminSubscriptionController::class, 'payments']);
            Route::put('/payments/{id}', [AdminSubscriptionController::class, 'updatePaymentStatus']);
            Route::post('/payments/{id}/void', [AdminSubscriptionController::class, 'voidPayment']);

            Route::get('/subscription-requests', [AdminSubscriptionRequestController::class, 'index']);
            Route::post('/subscription-requests/{id}/approve', [AdminSubscriptionRequestController::class, 'approve']);
            Route::post('/subscription-requests/{id}/reject', [AdminSubscriptionRequestController::class, 'reject']);
        });

        // Audit Logs
        Route::get('/audit-logs', [AdminBusinessAuditLogController::class, 'index']);
    });
});
