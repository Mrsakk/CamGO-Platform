<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class AdminUserController extends ApiController
{
    /**
     * List users with search, role filters, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with('roles');

        if ($request->filled('role')) {
            $roleInput = $request->input('role');
            $roleObj = Role::where('name', $roleInput)
                ->orWhere('name', ucwords(str_replace('_', ' ', $roleInput)))
                ->orWhere('name', strtolower(str_replace(' ', '_', $roleInput)))
                ->first();
            if ($roleObj) {
                $query->role($roleObj->name);
            }
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $paginated = $query->latest()->paginate($perPage);

        return $this->successResponse([
            'items' => UserResource::collection($paginated->items()),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'roles' => Role::pluck('name'),
        ]);
    }

    /**
     * Show single user details.
     */
    public function show(string $id): JsonResponse
    {
        $user = User::with(['roles', 'favorites.destination', 'reviews.reviewable'])->find($id);
        if (!$user) {
            return $this->errorResponse('User not found', 404);
        }

        return $this->successResponse([
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Toggle active/inactive status.
     */
    public function toggleStatus(string $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return $this->errorResponse('User not found', 404);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        AuditLog::record('user_status_toggled', $user, null, ['is_active' => $user->is_active]);

        return $this->successResponse([
            'user' => new UserResource($user),
        ], 'User status updated');
    }

    /**
     * Change user role.
     */
    public function changeRole(Request $request, string $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return $this->errorResponse('User not found', 404);
        }

        $request->validate([
            'role' => 'required|string',
        ]);

        $roleInput = $request->input('role');
        $roleObj = Role::where('name', $roleInput)
            ->orWhere('name', ucwords(str_replace('_', ' ', $roleInput)))
            ->orWhere('name', strtolower(str_replace(' ', '_', $roleInput)))
            ->first();

        if (!$roleObj) {
            return $this->errorResponse("Role '{$roleInput}' does not exist.", 422);
        }

        $oldRoles = $user->getRoleNames()->toArray();
        $user->syncRoles([$roleObj->name]);

        AuditLog::record('user_role_changed', $user, ['roles' => $oldRoles], ['roles' => [$roleObj->name]]);

        return $this->successResponse([
            'user' => new UserResource($user),
        ], 'User role updated successfully');
    }

    /**
     * Update user basic details.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return $this->errorResponse('User not found', 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        $user->update($validated);

        if ($request->filled('role')) {
            $user->syncRoles([$request->input('role')]);
        }

        AuditLog::record('user_updated_by_admin', $user);

        return $this->successResponse([
            'user' => new UserResource($user),
        ], 'User updated successfully');
    }

    /**
     * Delete user account.
     */
    public function destroy(string $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return $this->errorResponse('User not found', 404);
        }

        // Prevent deleting self
        if ($user->id === auth()->id()) {
            return $this->errorResponse('Cannot delete your own administrator account', 422);
        }

        $user->delete();
        AuditLog::record('user_deleted_by_admin', $user);

        return $this->successResponse(null, 'User deleted successfully');
    }
}
