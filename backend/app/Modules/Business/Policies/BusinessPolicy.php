<?php

namespace App\Modules\Business\Policies;

use App\Models\User;
use App\Modules\Business\Models\Business;
use Illuminate\Auth\Access\HandlesAuthorization;

class BusinessPolicy
{
    use HandlesAuthorization;

    /**
     * Pre-check permissions: Super Admin can bypass all checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasAnyRole(['Super Admin', 'super_admin'])) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        // Business Manager / Staff with business.view permission
        return $user->isAdmin() && $user->hasPermissionTo('business.view');
    }

    public function view(User $user, Business $business): bool
    {
        // Admin or the owner of this specific business
        if ($user->isAdmin() && $user->hasPermissionTo('business.view')) {
            return true;
        }

        return $user->isBusinessOwner() && $user->canAccessBusiness((int) $business->id);
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() && $user->hasPermissionTo('business.create');
    }

    public function update(User $user, Business $business): bool
    {
        // Admin with permission or the specific business owner
        if ($user->isAdmin() && $user->hasPermissionTo('business.update')) {
            return true;
        }

        return $user->isBusinessOwner() && $user->canAccessBusiness((int) $business->id);
    }

    public function delete(User $user, Business $business): bool
    {
        return $user->isAdmin() && $user->hasPermissionTo('business.update');
    }

    public function publish(User $user, Business $business): bool
    {
        // Business owner can NEVER approve/publish directly
        return $user->isAdmin() && $user->hasPermissionTo('business.publish');
    }

    public function verify(User $user, ?Business $business = null): bool
    {
        // Business owner can NEVER grant verified badge
        return $user->isAdmin() && $user->hasPermissionTo('business.verify');
    }

    public function feature(User $user, ?Business $business = null): bool
    {
        return $user->isAdmin() && $user->hasPermissionTo('business.feature');
    }

    public function viewKyc(User $user, ?Business $business = null): bool
    {
        return $user->isAdmin() && $user->hasPermissionTo('business.kyc.view');
    }

    public function moderateReviews(User $user): bool
    {
        return $user->isAdmin() && $user->hasPermissionTo('business.reviews.moderate');
    }

    public function manageCategories(User $user): bool
    {
        return $user->isAdmin() && $user->hasPermissionTo('business.categories.manage');
    }

    public function viewStats(User $user, ?Business $business = null): bool
    {
        if ($user->isAdmin() && $user->hasPermissionTo('business.stats.view')) {
            return true;
        }

        if ($business) {
            return $user->isBusinessOwner() && $user->canAccessBusiness((int) $business->id);
        }

        return false;
    }

    public function managePlans(User $user): bool
    {
        return $user->isAdmin() && $user->hasPermissionTo('plans.manage');
    }

    public function manageBilling(User $user): bool
    {
        return $user->isAdmin() && $user->hasPermissionTo('subscriptions.manage');
    }

    public function verifyPayments(User $user): bool
    {
        return $user->isAdmin() && $user->hasPermissionTo('payments.verify');
    }
}
