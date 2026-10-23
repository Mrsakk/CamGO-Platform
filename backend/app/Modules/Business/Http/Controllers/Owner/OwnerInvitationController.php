<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessUser;
use App\Modules\Business\Models\Invitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OwnerInvitationController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $business = $this->business($request);

        return $this->successResponse([
            'members' => BusinessUser::with('user:id,name,email,phone,avatar')
                ->where('business_id', $business->id)
                ->orderBy('id')
                ->get(),
            'invitations' => Invitation::where('business_id', $business->id)
                ->latest('id')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $business = $this->business($request);

        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'role' => 'required|in:admin,staff',
        ]);

        $existingMember = BusinessUser::where('business_id', $business->id)
            ->whereHas('user', fn ($query) => $query->where('email', $validated['email']))
            ->exists();

        if ($existingMember) {
            throw ValidationException::withMessages(['email' => 'This user is already a team member.']);
        }

        $maxMembers = $business->planLimit('max_team_members');
        $activeCount = $business->businessUsers()->where('status', 'active')->where('role', '!=', 'owner')->count();
        if (is_numeric($maxMembers) && $activeCount >= (int) $maxMembers) {
            throw ValidationException::withMessages([
                'email' => "Your current plan allows up to {$maxMembers} team members.",
            ]);
        }

        $invitation = Invitation::updateOrCreate(
            [
                'business_id' => $business->id,
                'email' => strtolower($validated['email']),
                'status' => 'pending',
            ],
            [
                'role' => $validated['role'],
                'invited_by' => $request->user()->id,
                'expires_at' => now()->addDays(7),
            ]
        );

        AuditLog::record('business_invitation_created', $invitation, null, $invitation->toArray());

        return $this->successResponse($invitation, 'Invitation created successfully', 201);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $business = $this->business($request);
        $invitation = Invitation::where('business_id', $business->id)->findOrFail($id);

        $invitation->update(['status' => 'canceled']);

        return $this->successResponse($invitation, 'Invitation canceled');
    }

    public function accept(Request $request, string $token): JsonResponse
    {
        $user = $request->user();

        $invitation = Invitation::where('token', $token)->where('status', 'pending')->first();
        if (! $invitation || ! $invitation->isPending()) {
            return $this->errorResponse('This invitation is invalid or has expired.', 422);
        }

        if (strcasecmp($invitation->email, (string) $user->email) !== 0) {
            return $this->errorResponse('This invitation was sent to a different email address.', 403);
        }

        DB::transaction(function () use ($invitation, $user) {
            $invitation->update(['status' => 'accepted', 'accepted_at' => now()]);

            BusinessUser::updateOrCreate(
                ['business_id' => $invitation->business_id, 'user_id' => $user->id],
                [
                    'role' => $invitation->role,
                    'status' => 'active',
                    'invited_by' => $invitation->invited_by,
                    'accepted_at' => now(),
                ]
            );
        });

        return $this->successResponse([
            'business_id' => $invitation->business_id,
            'role' => $invitation->role,
        ], 'Invitation accepted successfully');
    }

    private function business(Request $request): Business
    {
        $user = $request->user();

        if (empty($user->business_id)) {
            abort(404, 'No business is linked to this account.');
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('update', $business);

        return $business;
    }
}
