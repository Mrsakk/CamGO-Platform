<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminRoleController extends ApiController
{
    /**
     * List all roles with their assigned permissions.
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'name' => $r->name,
                'guard_name' => $r->guard_name ?? 'web',
                'users_count' => $r->users()->count(),
                'permissions' => $r->permissions->pluck('name'),
            ];
        });

        $allPermissions = Permission::pluck('name');

        return $this->successResponse([
            'roles' => $roles,
            'all_permissions' => $allPermissions,
        ]);
    }

    /**
     * Sync permissions for a role.
     */
    public function syncPermissions(Request $request, string $roleName): JsonResponse
    {
        $role = Role::where('name', $roleName)->first();
        if (!$role) {
            return $this->errorResponse('Role not found', 404);
        }

        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($request->input('permissions'));
        AuditLog::record('role_permissions_synced', $role, null, ['permissions' => $request->input('permissions')]);

        return $this->successResponse([
            'role' => $role->name,
            'permissions' => $role->permissions()->pluck('name'),
        ], 'Role permissions updated successfully');
    }
}
