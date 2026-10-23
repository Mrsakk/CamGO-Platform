<?php

namespace App\Modules\Business\Http\Controllers\Public;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Business\Http\Requests\StoreReviewRequest;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessReview;
use App\Modules\Business\Http\Resources\BusinessReviewResource;
use App\Modules\Business\Services\OwnerNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicReviewController extends ApiController
{
    public function index(string $slug): JsonResponse
    {
        $business = Business::query()->published()->where('slug', $slug)->first();

        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $reviews = $business->approvedReviews()
            ->with('user:id,name,avatar')
            ->paginate(15);

        $paginator = $reviews->through(fn ($review) => (new BusinessReviewResource($review))->resolve(request()));

        return $this->paginateResponse($paginator, 'Reviews retrieved successfully');
    }

    public function storeAuthenticated(Request $request, string $slug, OwnerNotificationService $notifications): JsonResponse
    {
        $business = Business::query()->published()->where('slug', $slug)->first();

        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|between:1,5',
            'title' => 'nullable|string|max:150',
            'comment' => 'required|string|min:10|max:2000',
            'locale' => 'nullable|string|in:km,en',
        ]);

        $user = $request->user();

        $exists = BusinessReview::where('business_id', $business->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($exists) {
            return $this->errorResponse('You have already reviewed this business.', 422);
        }

        $comment = strip_tags($validated['comment']);

        $review = BusinessReview::create([
            'business_id' => $business->id,
            'user_id' => $user->id,
            'display_name' => $user->name,
            'title' => $validated['title'] ?? null,
            'rating' => (int) $validated['rating'],
            'comment' => $comment,
            'locale' => $validated['locale'] ?? 'km',
            'ip_hash' => hash('sha256', (string) $request->ip().date('Y-m-d').config('app.key')),
            'status' => 'pending',
            'rejection_reason' => preg_match('/(https?:\/\/|www\.)/i', $comment)
                ? 'Flagged: contains URL pattern.'
                : null,
        ]);

        $notifications->notify(
            $business,
            'review.created',
            'New review received',
            'New review received',
            'A customer submitted a new review.',
            'A customer submitted a new review.',
            ['review_id' => $review->id, 'rating' => $review->rating],
            'review:'.$review->id,
            'reviews',
        );

        return $this->successResponse([
            'id' => $review->id,
            'status' => $review->status,
        ], 'Review submitted successfully. It will appear after moderation.', 201);
    }

    /**
     * Submit visitor review with anti-spam honeypot and rate limits.
     */
    public function store(
        StoreReviewRequest $request,
        string $slug,
        OwnerNotificationService $notifications,
    ): JsonResponse {
        // 1. Honeypot verification: if honeypot is filled, silently discard or reject as spam
        if ($request->filled('website') || $request->filled('hp_website')) {
            return $this->errorResponse('Spam detected.', 422);
        }

        $business = Business::where('slug', $slug)->published()->first();
        if (!$business) {
            return $this->errorResponse('Business not found', 404);
        }

        $rawEmail = strtolower(trim($request->input('email')));
        $rawIp = $request->ip();

        // 2. Anonymized anti-spam hashes (never stored raw)
        $emailHash = hash('sha256', $rawEmail . config('app.key'));
        $ipHash = hash('sha256', $rawIp . date('Y-m-d') . config('app.key'));

        // 3. Rate Limit Rule A: 1 review per business per email hash
        $alreadyReviewed = BusinessReview::where('business_id', $business->id)
            ->where('email_hash', $emailHash)
            ->exists();

        if ($alreadyReviewed) {
            return $this->errorResponse(
                'You have already submitted a review for this business.',
                422,
                ['email' => 'Duplicate review submission detected.']
            );
        }

        // 4. Rate Limit Rule B: Max 3 reviews per IP hash per day across all businesses
        $ipDailyCount = BusinessReview::where('ip_hash', $ipHash)->count();
        if ($ipDailyCount >= 3) {
            return $this->errorResponse(
                'Daily review limit reached for your connection. Please try again tomorrow.',
                429
            );
        }

        $comment = trim($request->input('comment'));

        // 5. Flag suspicious links in comments
        $containsLink = preg_match('/(https?:\/\/|www\.|\.com|\.net|\.org|\.io|\.me)/i', $comment);

        // 6. Create review as pending
        $review = BusinessReview::create([
            'business_id' => $business->id,
            'display_name' => strip_tags($request->input('display_name')),
            'rating' => (int) $request->input('rating'),
            'comment' => strip_tags($comment),
            'locale' => $request->input('locale', 'km'),
            'email_hash' => $emailHash,
            'ip_hash' => $ipHash,
            'status' => 'pending',
            'rejection_reason' => $containsLink ? 'Flagged: Contains URL or domain pattern.' : null,
        ]);

        $notifications->notify(
            $business,
            'review.created',
            'áž˜áž¶áž“áž€áž¶ážšážœáž¶áž™ážáž˜áŸ’áž›áŸƒážáŸ’áž˜áž¸',
            'New review received',
            'áž˜áž¶áž“áž—áŸ’áž‰áŸ€ážœáž•áŸ’áž‰áž¾áž€áž¶ážšážœáž¶áž™ážáž˜áŸ’áž›áŸƒážáŸ’áž˜áž¸áž…áŸ†áž“áž½áž“ ' . $review->rating . ' áž•áŸ’áž€áž¶áž™áŸ”',
            'A visitor submitted a new ' . $review->rating . '-star review.',
            ['review_id' => $review->id, 'rating' => $review->rating],
            'review:' . $review->id,
            'reviews',
        );

        return $this->successResponse([
            'id' => $review->id,
            'status' => 'pending',
        ], 'Review submitted successfully. It will appear publicly after staff moderation.', 201);
    }
}
