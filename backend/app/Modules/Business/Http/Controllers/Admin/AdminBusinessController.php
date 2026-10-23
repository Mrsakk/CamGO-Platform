<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Models\User;
use App\Modules\Business\Http\Requests\StatusBusinessRequest;
use App\Modules\Business\Http\Requests\StoreBusinessRequest;
use App\Modules\Business\Http\Requests\UpdateBusinessRequest;
use App\Modules\Business\Http\Resources\BusinessAdminDetailResource;
use App\Modules\Business\Http\Resources\BusinessAdminListResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessMember;
use App\Modules\Business\Models\Plan;
use App\Modules\Business\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AdminBusinessController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Business::class);

        $query = Business::query()->with(['category', 'province', 'coverMedia', 'media']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('province_id')) {
            $query->where('province_id', $request->input('province_id'));
        }

        if ($request->filled('is_verified')) {
            $query->where('is_verified', $request->boolean('is_verified'));
        }

        if ($request->boolean('missing_info')) {
            $query->missingPublishingInfo();
        }

        if ($request->filled('search')) {
            $s = trim($request->input('search'));
            $query->where(function ($q) use ($s) {
                $q->where('name_en', 'like', "%{$s}%")
                    ->orWhere('name_km', 'like', "%{$s}%")
                    ->orWhere('slug', 'like', "%{$s}%")
                    ->orWhere('owner_name', 'like', "%{$s}%")
                    ->orWhere('owner_phone', 'like', "%{$s}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $paginated = $query->latest('id')->paginate($perPage);

        return $this->successResponse([
            'items' => BusinessAdminListResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ], 'Businesses retrieved successfully');
    }

    public function store(StoreBusinessRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['created_by'] = Auth::id();
        $validated['updated_by'] = Auth::id();
        $validated['status'] = 'draft';

        $business = Business::create($validated);
        $business->recalculateDestinationLinks();

        AuditLog::record('business_created', $business, null, $business->toArray());

        return $this->successResponse([
            'business' => new BusinessAdminDetailResource($business->load(['category', 'province', 'contacts', 'services', 'hours', 'closures', 'media', 'documents', 'owners'])),
        ], 'Business created as draft successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $business = Business::with([
            'category',
            'province',
            'contacts',
            'services',
            'hours',
            'closures',
            'media',
            'documents.uploader',
            'verifier',
            'owners',
        ])->find($id);

        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $this->authorize('view', $business);

        return $this->successResponse([
            'business' => new BusinessAdminDetailResource($business),
        ], 'Business details retrieved');
    }

    public function update(UpdateBusinessRequest $request, int $id): JsonResponse
    {
        $business = Business::find($id);
        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $this->authorize('update', $business);

        $validated = $request->validated();
        $validated['updated_by'] = Auth::id();

        $old = $business->toArray();
        $business->update($validated);

        AuditLog::record('business_updated', $business, $old, $business->toArray());

        return $this->successResponse([
            'business' => new BusinessAdminDetailResource($business->load(['category', 'province', 'contacts', 'services', 'hours', 'closures', 'media', 'documents', 'owners'])),
        ], 'Business updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $business = Business::find($id);
        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $this->authorize('delete', $business);

        $business->delete();
        AuditLog::record('business_deleted', $business);

        return $this->successResponse(null, 'Business deleted successfully');
    }

    /**
     * Transition business status (draft, pending_review, approved, suspended).
     * Enforces the "cannot approve without required fields" rule.
     */
    public function updateStatus(StatusBusinessRequest $request, int $id): JsonResponse
    {
        $business = Business::with(['contacts', 'media'])->find($id);
        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $this->authorize('publish', $business);

        $newStatus = $request->input('status');

        if (in_array($newStatus, ['published', 'approved'], true)) {
            $missing = $business->getPublishingMissingRequirements();
            if (! empty($missing)) {
                return $this->errorResponse(
                    'Cannot publish business. Mandatory publishing requirements are missing.',
                    422,
                    ['missing_requirements' => $missing]
                );
            }
            $business->approved_at ??= now();
            $business->published_at = now();
        }

        if ($newStatus === 'draft') {
            $business->published_at = null;
        }

        $oldStatus = $business->status;
        $business->status = $newStatus === 'published' ? 'published' : $newStatus;
        $business->updated_by = Auth::id();
        $business->rejection_reason = $request->input('reason');
        $business->save();

        if (in_array($newStatus, ['published', 'approved'], true)) {
            \Illuminate\Support\Facades\Cache::forget('biz:public:home');
        }

        AuditLog::record('business_status_changed', $business, ['status' => $oldStatus], [
            'status' => $newStatus,
            'reason' => $request->input('reason'),
        ]);

        return $this->successResponse([
            'id' => $business->id,
            'status' => $business->status,
            'published_at' => $business->published_at?->toIso8601String(),
            'approved_at' => $business->approved_at?->toIso8601String(),
        ], "Business status transitioned to {$newStatus}");
    }

    /**
     * Grant verified badge. Requires at least one KYC document.
     */
    public function verify(Request $request, int $id): JsonResponse
    {
        $business = Business::with('documents')->find($id);
        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $this->authorize('verify', $business);

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if ($business->documents->isEmpty()) {
            return $this->errorResponse(
                'Cannot verify business without at least one uploaded KYC document (ID card or business license).',
                422,
                ['documents' => 'At least one KYC document is required to verify a business.']
            );
        }

        $business->is_verified = true;
        $business->verified_at = now();
        $business->verified_by = Auth::id();
        $business->save();

        AuditLog::record('business_verified', $business, null, [
            'is_verified' => true,
            'reason' => $request->input('reason'),
            'verified_by' => Auth::id(),
        ]);

        return $this->successResponse([
            'id' => $business->id,
            'is_verified' => true,
            'verified_at' => $business->verified_at->toIso8601String(),
        ], 'Business verified successfully');
    }

    /**
     * Revoke verified badge with required reason.
     */
    public function unverify(Request $request, int $id): JsonResponse
    {
        $business = Business::find($id);
        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $this->authorize('verify', $business);

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $business->is_verified = false;
        $business->verified_at = null;
        $business->verified_by = null;
        $business->save();

        AuditLog::record('business_unverified', $business, null, [
            'is_verified' => false,
            'reason' => $request->input('reason'),
        ]);

        return $this->successResponse([
            'id' => $business->id,
            'is_verified' => false,
        ], 'Business verification revoked');
    }

    /**
     * Create a new user with role business_owner linked to this business.
     *
     * The account is created without a shared password. A one-time setup token
     * is returned so the administrator can send the owner a secure setup link.
     */
    public function createOwnerAccount(Request $request, int $id): JsonResponse
    {
        $business = Business::find($id);
        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $this->authorize('update', $business);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:50',
        ]);

        $user = DB::transaction(function () use ($validated, $business) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make(Str::random(64)),
                'must_change_password' => true,
                'phone' => $validated['phone'] ?? $business->owner_phone,
                'business_id' => $business->id,
                'is_active' => true,
                'email_verified_at' => null,
            ]);

            $user->assignRole('business_owner');

            BusinessMember::firstOrCreate(
                ['business_id' => $business->id, 'user_id' => $user->id],
                [
                    'role' => 'owner',
                    'status' => 'active',
                    'invited_by' => Auth::id(),
                    'accepted_at' => now(),
                ]
            );

            $organization = $business->organization;
            if ($organization && ! $organization->owner_user_id) {
                $organization->update(['owner_user_id' => $user->id]);
            }

            return $user;
        });

        AuditLog::record('business_owner_created', $business, null, [
            'user_id' => $user->id,
            'email' => $user->email,
            'created_by' => Auth::id(),
        ]);

        return $this->successResponse(
            $this->ownerSetupPayload($user, $business),
            'Owner account created successfully. Send the setup link to the business owner.',
            201
        );
    }

    /**
     * Issue a fresh setup link for an owner who has not completed onboarding.
     */
    public function regenerateOwnerSetupLink(int $id, int $userId): JsonResponse
    {
        $business = Business::find($id);
        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $this->authorize('update', $business);

        $user = $business->owners()->whereKey($userId)->first();
        if (! $user) {
            return $this->errorResponse('Owner account not found for this business', 404);
        }

        if (! $user->must_change_password) {
            return $this->errorResponse('This owner has already completed account setup.', 422);
        }

        AuditLog::record('business_owner_setup_link_regenerated', $business, null, [
            'user_id' => $user->id,
            'email' => $user->email,
            'created_by' => Auth::id(),
        ]);

        return $this->successResponse(
            $this->ownerSetupPayload($user, $business),
            'A new owner setup link has been generated.'
        );
    }

    private function ownerSetupPayload(User $user, Business $business): array
    {
        $token = Password::broker()->createToken($user);
        $expiresAt = now()->addMinutes((int) config('auth.passwords.users.expire', 60));

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'business_id' => $business->id,
                'roles' => ['business_owner'],
                'must_change_password' => (bool) $user->must_change_password,
                'created_at' => $user->created_at->toIso8601String(),
            ],
            'setup_token' => $token,
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }

    /**
     * Set subscription tier, expiration date, and featured promotion.
     */
    public function updateSubscription(Request $request, int $id, SubscriptionService $service): JsonResponse
    {
        $business = Business::find($id);
        if (! $business) {
            return $this->errorResponse('Business not found', 404);
        }

        $this->authorize('manageBilling', Business::class);

        $validated = $request->validate([
            'tier' => 'required|in:free,pro,premium',
            'subscription_expires_at' => 'nullable|date',
            'featured_until' => 'nullable|date',
            'sponsored_category_until' => 'nullable|date',
            'sponsored_province_until' => 'nullable|date',
            'is_verified' => 'nullable|boolean',
            'note' => 'nullable|string|max:500',
        ]);

        $tier = $validated['tier'];

        $plan = Plan::firstOrCreate(
            ['code' => $tier],
            [
                'name_km' => ucfirst($tier),
                'name_en' => ucfirst($tier),
                'price_usd' => 0,
                'billing_cycle' => $tier === 'free' ? 'none' : 'monthly',
                'features' => [],
                'is_active' => true,
                'sort_order' => $tier === 'free' ? 0 : ($tier === 'pro' ? 1 : 2),
            ]
        );

        $data = [
            'starts_at' => now(),
            'notes' => $validated['note'] ?? null,
        ];

        if (array_key_exists('subscription_expires_at', $validated)) {
            $data['ends_at'] = $validated['subscription_expires_at'];
        }
        if (array_key_exists('featured_until', $validated)) {
            $data['featured_until'] = $validated['featured_until'];
        }
        if (array_key_exists('sponsored_category_until', $validated)) {
            $data['sponsored_category_until'] = $validated['sponsored_category_until'];
        }
        if (array_key_exists('sponsored_province_until', $validated)) {
            $data['sponsored_province_until'] = $validated['sponsored_province_until'];
        }
        if (array_key_exists('is_verified', $validated)) {
            $data['is_verified'] = $validated['is_verified'];
        }

        $result = $service->activate($business, $plan, $data, $request->user());
        $business = $result['business'];

        return $this->successResponse([
            'id' => $business->id,
            'tier' => $business->tier,
            'effective_tier' => $business->effectiveTier(),
            'is_featured' => $business->isFeatured(),
            'is_sponsored_category' => $business->isSponsoredCategory(),
            'is_sponsored_province' => $business->isSponsoredProvince(),
            'subscription_expires_at' => $business->subscription_expires_at?->toIso8601String(),
            'featured_until' => $business->featured_until?->toIso8601String(),
            'sponsored_category_until' => $business->sponsored_category_until?->toIso8601String(),
            'sponsored_province_until' => $business->sponsored_province_until?->toIso8601String(),
            'is_subscription_active' => $business->isSubscriptionActive(),
            'is_verified' => (bool) $business->is_verified,
            'subscription_id' => $result['subscription']->id,
            'warning' => $result['warning'],
        ], 'Business subscription tier updated successfully');
    }
}
