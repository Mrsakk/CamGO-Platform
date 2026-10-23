<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OwnerTeamController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $business = $this->business($request);

        $roleOrder = array_flip(BusinessMember::ROLES);

        $members = $business->members()
            ->with('user:id,name,email,phone,avatar,is_active')
            ->orderBy('id')
            ->get()
            ->sortBy(fn (BusinessMember $member) => $roleOrder[$member->role] ?? 99)
            ->values()
            ->map(fn (BusinessMember $member) => $this->serialize($member));

        return $this->successResponse($members);
    }

    public function invite(Request $request): JsonResponse
    {
        $business = $this->business($request);
        $user = $request->user();

        $validated = $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:manager,editor,viewer',
        ]);

        $invited = User::where('email', $validated['email'])->first();
        if (!$invited) {
            throw ValidationException::withMessages([
                'email' => 'No account exists with this email. Ask the team member to create an account first.',
            ]);
        }

        if ((int) $invited->business_id === (int) $business->id) {
            throw ValidationException::withMessages([
                'email' => 'This user is already linked to your business.',
            ]);
        }

        if ($invited->business_id && (int) $invited->business_id !== (int) $business->id) {
            throw ValidationException::withMessages([
                'email' => 'This user already belongs to another business.',
            ]);
        }

        $exists = $business->members()->where('user_id', $invited->id)->exists();
        if ($exists) {
            throw ValidationException::withMessages([
                'email' => 'This user is already a team member or has a pending invitation.',
            ]);
        }

        $maxMembers = $business->planLimit('max_team_members');
        if (is_numeric($maxMembers) && $business->members()->where('role', '!=', 'owner')->count() >= (int) $maxMembers) {
            throw ValidationException::withMessages([
                'email' => "Your current plan allows up to {$maxMembers} team members. Upgrade your plan to invite more.",
            ]);
        }

        $member = $business->members()->create([
            'user_id' => $invited->id,
            'role' => $validated['role'],
            'status' => 'invited',
            'invited_by' => $user->id,
            'invited_email' => $invited->email,
        ]);

        AuditLog::record('business_member_invited', $member, null, [
            'business_id' => $business->id,
            'user_id' => $invited->id,
            'role' => $member->role,
        ]);

        return $this->successResponse([
            'member' => $this->serialize($member->load('user:id,name,email,phone,avatar,is_active')),
            'invite_token' => $member->invite_token,
        ], 'Team invitation created successfully', 201);
    }

    public function update(Request $request, int $memberId): JsonResponse
    {
        $business = $this->business($request);
        $actor = $request->user();
        $member = $business->members()->findOrFail($memberId);

        $validated = $request->validate([
            'role' => 'sometimes|required|in:owner,manager,editor,viewer',
            'status' => 'sometimes|required|in:active,suspended',
        ]);

        if ($member->status === 'invited' && array_key_exists('status', $validated)) {
            throw ValidationException::withMessages([
                'status' => 'An invited member must accept the invitation before their status can be changed.',
            ]);
        }

        if ($member->user_id === $actor->id && ($validated['status'] ?? null) === 'suspended') {
            throw ValidationException::withMessages([
                'status' => 'You cannot suspend your own account.',
            ]);
        }

        $old = $member->only(['role', 'status']);
        $wasActiveOwner = $member->role === 'owner' && $member->isActive();
        $member->fill($validated);
        $isActiveOwner = $member->role === 'owner' && $member->isActive();

        if ($wasActiveOwner && !$isActiveOwner && !$this->hasOtherActiveOwner($business, $member->id)) {
            throw ValidationException::withMessages([
                'role' => 'At least one active owner is required.',
            ]);
        }

        $member->save();

        AuditLog::record('business_member_updated', $member, $old, $member->only(['role', 'status']));

        return $this->successResponse(
            $this->serialize($member->fresh('user:id,name,email,phone,avatar,is_active')),
            'Team member updated successfully'
        );
    }

    public function destroy(Request $request, int $memberId): JsonResponse
    {
        $business = $this->business($request);
        $actor = $request->user();
        $member = $business->members()->findOrFail($memberId);

        if ($member->user_id === $actor->id) {
            throw ValidationException::withMessages([
                'member' => 'You cannot remove yourself from the team.',
            ]);
        }

        if ($member->role === 'owner' && $member->isActive() && !$this->hasOtherActiveOwner($business, $member->id)) {
            throw ValidationException::withMessages([
                'member' => 'At least one active owner is required.',
            ]);
        }

        DB::transaction(function () use ($business, $member) {
            $userId = $member->user_id;

            AuditLog::record('business_member_removed', $member, $member->only(['role', 'status']), [
                'business_id' => $business->id,
                'user_id' => $userId,
            ]);

            $member->delete();

            $user = User::find($userId);
            $hasOtherActiveMembership = BusinessMember::where('user_id', $userId)
                ->where('status', 'active')
                ->exists();

            if ($user && !$hasOtherActiveMembership && (int) $user->business_id === (int) $business->id) {
                $user->update(['business_id' => null]);
            }
        });

        return $this->successResponse(null, 'Team member removed successfully');
    }

    public function accept(Request $request, string $token): JsonResponse
    {
        $user = $request->user();

        $member = BusinessMember::where('invite_token', $token)
            ->where('status', 'invited')
            ->firstOrFail();

        if (strcasecmp((string) $member->invited_email, (string) $user->email) !== 0) {
            abort(403, 'This invitation was sent to a different email address.');
        }

        if ($user->business_id && (int) $user->business_id !== (int) $member->business_id) {
            throw ValidationException::withMessages([
                'business' => 'Your account is already linked to another business.',
            ]);
        }

        DB::transaction(function () use ($member, $user) {
            $member->update([
                'status' => 'active',
                'accepted_at' => now(),
                'invite_token' => null,
                'last_active_at' => now(),
            ]);

            $user->business_id = $member->business_id;
            $user->save();

            if (!$user->hasAnyRole(['Business Owner', 'business_owner'])) {
                $user->assignRole('business_owner');
            }
        });

        AuditLog::record('business_member_invite_accepted', $member, null, [
            'business_id' => $member->business_id,
            'user_id' => $user->id,
        ]);

        return $this->successResponse([
            'business_id' => $member->business_id,
            'role' => $member->role,
        ], 'Invitation accepted successfully');
    }

    private function hasOtherActiveOwner(Business $business, int $memberId): bool
    {
        return $business->members()
            ->where('id', '!=', $memberId)
            ->where('role', 'owner')
            ->where('status', 'active')
            ->exists();
    }

    private function serialize(BusinessMember $member): array
    {
        return [
            'id' => $member->id,
            'user_id' => $member->user_id,
            'name' => $member->user?->name,
            'email' => $member->user?->email ?? $member->invited_email,
            'phone' => $member->user?->phone,
            'avatar' => $member->user?->avatar,
            'role' => $member->role,
            'status' => $member->status,
            'capabilities' => $member->capabilities(),
            'invited_at' => $member->invited_at?->toIso8601String(),
            'accepted_at' => $member->accepted_at?->toIso8601String(),
            'last_active_at' => $member->last_active_at?->toIso8601String(),
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
