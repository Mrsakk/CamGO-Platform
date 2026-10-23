<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerReviewController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $business = $this->business($request);

        $validated = $request->validate([
            'status' => 'nullable|in:pending,approved,rejected',
            'per_page' => 'nullable|integer|between:1,100',
        ]);

        $reviews = BusinessReview::where('business_id', $business->id)
            ->when($validated['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate($validated['per_page'] ?? 20)
            ->through(fn (BusinessReview $review) => $this->serialize($review));

        return $this->paginateResponse($reviews, 'Reviews retrieved successfully');
    }

    public function stats(Request $request): JsonResponse
    {
        $business = $this->business($request);
        $base = BusinessReview::where('business_id', $business->id);

        $counts = (clone $base)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $approved = (clone $base)->where('status', 'approved');

        return $this->successResponse([
            'total' => (int) (clone $base)->count(),
            'pending' => (int) ($counts['pending'] ?? 0),
            'approved' => (int) ($counts['approved'] ?? 0),
            'rejected' => (int) ($counts['rejected'] ?? 0),
            'rating_avg' => round((float) (clone $approved)->avg('rating'), 2),
            'replied' => (int) (clone $approved)->whereNotNull('owner_reply')->count(),
            'unreplied' => (int) (clone $approved)->whereNull('owner_reply')->count(),
        ]);
    }

    public function reply(Request $request, int $reviewId): JsonResponse
    {
        $business = $this->business($request);
        $review = BusinessReview::where('business_id', $business->id)->findOrFail($reviewId);

        if ($review->status !== 'approved') {
            return $this->errorResponse('Only approved reviews can be replied to.', 422);
        }

        $validated = $request->validate([
            'owner_reply' => 'nullable|string|max:2000',
        ]);

        $old = $review->only(['owner_reply', 'owner_replied_at', 'owner_replied_by']);
        $reply = trim((string) ($validated['owner_reply'] ?? ''));

        $review->owner_reply = $reply !== '' ? $reply : null;
        $review->owner_replied_at = $reply !== '' ? now() : null;
        $review->owner_replied_by = $reply !== '' ? $request->user()->id : null;
        $review->save();

        AuditLog::record('business_review_owner_replied', $review, $old, [
            'owner_reply' => $review->owner_reply,
            'owner_replied_at' => $review->owner_replied_at?->toIso8601String(),
        ]);

        return $this->successResponse($this->serialize($review), 'Review reply saved successfully');
    }

    private function serialize(BusinessReview $review): array
    {
        return [
            'id' => $review->id,
            'display_name' => $review->display_name,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'locale' => $review->locale,
            'status' => $review->status,
            'owner_reply' => $review->owner_reply,
            'owner_replied_at' => $review->owner_replied_at?->toIso8601String(),
            'created_at' => $review->created_at?->toIso8601String(),
        ];
    }

    private function business(Request $request): Business
    {
        $user = $request->user();

        if (empty($user->business_id)) {
            abort(404, 'No business is linked to this account.');
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('view', $business);

        return $business;
    }
}
