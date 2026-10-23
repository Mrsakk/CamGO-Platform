<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\ReviewResource;
use App\Models\AuditLog;
use App\Models\Destination;
use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReviewController extends ApiController
{
    /**
     * Get approved reviews for a specific destination.
     */
    public function index(Request $request, string $destinationId): JsonResponse
    {
        $destination = Destination::find($destinationId);
        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        $reviews = $destination->approvedReviews()
            ->with(['user', 'images'])
            ->latest()
            ->paginate(10);

        return $this->successResponse([
            'items' => ReviewResource::collection($reviews->items()),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
            'rating_summary' => [
                'avg_rating' => (float) $destination->avg_rating,
                'reviews_count' => (int) $destination->reviews_count,
            ],
        ]);
    }

    /**
     * Store a new review for a destination (authenticated users).
     */
    public function store(Request $request, string $destinationId): JsonResponse
    {
        $destination = Destination::find($destinationId);
        if (!$destination) {
            return $this->errorResponse('Destination not found', 404);
        }

        $user = $request->user();

        // Check if user already reviewed this destination
        $existing = Review::where('user_id', $user->id)
            ->where('reviewable_type', Destination::class)
            ->where('reviewable_id', $destination->id)
            ->first();

        if ($existing) {
            return $this->errorResponse('You have already submitted a review for this destination. You can edit your existing review.', 422);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:2000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $review = Review::create([
            'user_id' => $user->id,
            'reviewable_type' => Destination::class,
            'reviewable_id' => $destination->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'status' => 'approved', // Auto-approved by default, moderatable by admin
            'ip_address' => $request->ip(),
        ]);

        // Upload review images if provided
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('reviews', 'public');
                ReviewImage::create([
                    'review_id' => $review->id,
                    'image_path' => Storage::url($path),
                ]);
            }
        }

        $destination->updateRatingStats();

        AuditLog::record('review_submitted', $review);

        return $this->successResponse([
            'review' => new ReviewResource($review->load(['user', 'images'])),
        ], 'Review submitted successfully', 201);
    }

    /**
     * Update user's own review.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $review = Review::find($id);

        if (!$review) {
            return $this->errorResponse('Review not found', 404);
        }

        if ($review->user_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Unauthorized to edit this review', 403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:2000',
        ]);

        $review->update([
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        if ($review->reviewable instanceof Destination) {
            $review->reviewable->updateRatingStats();
        }

        AuditLog::record('review_updated', $review);

        return $this->successResponse([
            'review' => new ReviewResource($review->load(['user', 'images'])),
        ], 'Review updated successfully');
    }

    /**
     * Delete user's own review.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $review = Review::find($id);

        if (!$review) {
            return $this->errorResponse('Review not found', 404);
        }

        if ($review->user_id !== $user->id && !$user->isAdmin()) {
            return $this->errorResponse('Unauthorized to delete this review', 403);
        }

        $reviewable = $review->reviewable;
        $review->delete();

        if ($reviewable instanceof Destination) {
            $reviewable->updateRatingStats();
        }

        AuditLog::record('review_deleted', $review);

        return $this->successResponse(null, 'Review deleted successfully');
    }
}
