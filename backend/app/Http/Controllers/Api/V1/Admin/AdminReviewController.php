<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\ReviewResource;
use App\Models\AuditLog;
use App\Models\Destination;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReviewController extends ApiController
{
    /**
     * List all reviews with status filters for moderation.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::query()->with(['user', 'reviewable', 'images']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->input('rating'));
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $paginated = $query->latest()->paginate($perPage);

        return $this->successResponse([
            'items' => ReviewResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'counts' => [
                'all' => Review::count(),
                'pending' => Review::where('status', 'pending')->count(),
                'approved' => Review::where('status', 'approved')->count(),
                'rejected' => Review::where('status', 'rejected')->count(),
            ],
        ]);
    }

    /**
     * Approve review.
     */
    public function approve(string $id): JsonResponse
    {
        $review = Review::find($id);
        if (!$review) {
            return $this->errorResponse('Review not found', 404);
        }

        $review->update(['status' => 'approved']);

        if ($review->reviewable instanceof Destination) {
            $review->reviewable->updateRatingStats();
        }

        AuditLog::record('review_approved', $review);

        return $this->successResponse([
            'review' => new ReviewResource($review->load(['user', 'reviewable', 'images'])),
        ], 'Review approved successfully');
    }

    /**
     * Reject review.
     */
    public function reject(string $id): JsonResponse
    {
        $review = Review::find($id);
        if (!$review) {
            return $this->errorResponse('Review not found', 404);
        }

        $review->update(['status' => 'rejected']);

        if ($review->reviewable instanceof Destination) {
            $review->reviewable->updateRatingStats();
        }

        AuditLog::record('review_rejected', $review);

        return $this->successResponse([
            'review' => new ReviewResource($review->load(['user', 'reviewable', 'images'])),
        ], 'Review rejected');
    }

    /**
     * Delete review.
     */
    public function destroy(string $id): JsonResponse
    {
        $review = Review::find($id);
        if (!$review) {
            return $this->errorResponse('Review not found', 404);
        }

        $reviewable = $review->reviewable;
        $review->delete();

        if ($reviewable instanceof Destination) {
            $reviewable->updateRatingStats();
        }

        AuditLog::record('review_deleted_by_admin', $review);

        return $this->successResponse(null, 'Review deleted');
    }
}
