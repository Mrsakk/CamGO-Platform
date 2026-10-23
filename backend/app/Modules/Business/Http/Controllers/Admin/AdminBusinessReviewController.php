<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Http\Resources\BusinessReviewResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessReview;
use App\Modules\Business\Services\OwnerNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminBusinessReviewController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('moderateReviews', Business::class);

        $query = BusinessReview::with(['business', 'moderator']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('business_id')) {
            $query->where('business_id', $request->input('business_id'));
        }

        if ($request->filled('search')) {
            $s = trim($request->input('search'));
            $query->where(function ($q) use ($s) {
                $q->where('display_name', 'like', "%{$s}%")
                  ->orWhere('comment', 'like', "%{$s}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 20), 100);
        $paginated = $query->latest('id')->paginate($perPage);

        return $this->successResponse([
            'items' => BusinessReviewResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'pending_count' => BusinessReview::where('status', 'pending')->count(),
        ]);
    }

    public function approve(int $id, OwnerNotificationService $notifications): JsonResponse
    {
        $this->authorize('moderateReviews', Business::class);

        $review = BusinessReview::with('business')->findOrFail($id);
        $review->update([
            'status' => 'approved',
            'moderated_by' => Auth::id(),
            'moderated_at' => now(),
            'rejection_reason' => null,
        ]);

        $review->business?->recalculateRatings();

        AuditLog::record('business_review_approved', $review->business, null, ['review_id' => $id]);

        if ($review->business) {
            $notifications->notify(
                $review->business,
                'review.approved',
                'ការវាយតម្លៃត្រូវបានផ្សព្វផ្សាយ',
                'Review published',
                'ការវាយតម្លៃថ្មីត្រូវបានអនុម័ត និងបង្ហាញនៅលើទំព័រអាជីវកម្មរបស់អ្នក។',
                'A new review has been approved and is now visible on your business profile.',
                ['review_id' => $review->id, 'rating' => $review->rating],
                'review-approved:' . $review->id,
                'reviews',
            );
        }

        return $this->successResponse(new BusinessReviewResource($review, true), 'Review approved and published');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $this->authorize('moderateReviews', Business::class);

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $review = BusinessReview::with('business')->findOrFail($id);
        $review->update([
            'status' => 'rejected',
            'moderated_by' => Auth::id(),
            'moderated_at' => now(),
            'rejection_reason' => $request->input('reason'),
        ]);

        $review->business?->recalculateRatings();

        AuditLog::record('business_review_rejected', $review->business, null, [
            'review_id' => $id,
            'reason' => $request->input('reason'),
        ]);

        return $this->successResponse(new BusinessReviewResource($review, true), 'Review rejected');
    }

    public function bulkModerate(Request $request): JsonResponse
    {
        $this->authorize('moderateReviews', Business::class);

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:biz_reviews,id',
            'action' => 'required|in:approve,reject',
            'reason' => 'required_if:action,reject|nullable|string|max:500',
        ]);

        $ids = $request->input('ids');
        $action = $request->input('action');
        $status = $action === 'approve' ? 'approved' : 'rejected';

        $reviews = BusinessReview::whereIn('id', $ids)->get();
        foreach ($reviews as $rev) {
            $rev->update([
                'status' => $status,
                'moderated_by' => Auth::id(),
                'moderated_at' => now(),
                'rejection_reason' => $action === 'reject' ? $request->input('reason') : null,
            ]);
            $rev->business?->recalculateRatings();
        }

        return $this->successResponse([
            'count' => count($reviews),
            'action' => $action,
        ], count($reviews) . " reviews {$status} successfully");
    }

    public function destroy(int $id): JsonResponse
    {
        $this->authorize('moderateReviews', Business::class);

        $review = BusinessReview::with('business')->findOrFail($id);
        $biz = $review->business;
        $review->delete();

        $biz?->recalculateRatings();

        return $this->successResponse(null, 'Review permanently deleted');
    }
}
