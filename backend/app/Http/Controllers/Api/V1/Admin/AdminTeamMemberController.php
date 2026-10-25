<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\TeamMemberResource;
use App\Models\AuditLog;
use App\Models\TeamMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class AdminTeamMemberController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = TeamMember::query();

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('name_km', 'like', "%{$search}%")
                  ->orWhere('role_en', 'like', "%{$search}%")
                  ->orWhere('role_km', 'like', "%{$search}%");
            });
        }

        $members = $query->orderBy('order', 'asc')->orderBy('id', 'asc')->get();

        return $this->successResponse([
            'items' => TeamMemberResource::collection($members),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $hasImage = $request->hasFile('image');
        $imageRule = $hasImage
            ? 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120'
            : 'nullable|string';

        $validated = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_km' => 'nullable|string|max:255',
            'role_en' => 'required|string|max:255',
            'role_km' => 'nullable|string|max:255',
            'image' => $imageRule,
            'order' => 'nullable|integer',
            'is_published' => 'nullable',
        ]);

        if ($hasImage) {
            $validated['image'] = \App\Services\StorageService::upload($request->file('image'), 'destinations', 'team');
        }

        if ($request->has('is_published')) {
            $validated['is_published'] = $request->boolean('is_published');
        } else {
            $validated['is_published'] = true;
        }

        $validated['order'] = (int) ($validated['order'] ?? 0);

        $member = TeamMember::create($validated);
        Cache::flush();
        AuditLog::record('team_member_created', $member);

        return $this->successResponse([
            'member' => new TeamMemberResource($member),
        ], 'Team member created successfully', 201);
    }

    public function show(string $id): JsonResponse
    {
        $member = TeamMember::find($id);
        if (!$member) {
            return $this->errorResponse('Team member not found', 404);
        }

        return $this->successResponse([
            'member' => new TeamMemberResource($member),
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $member = TeamMember::find($id);
        if (!$member) {
            return $this->errorResponse('Team member not found', 404);
        }

        $hasImage = $request->hasFile('image');
        $imageRule = $hasImage
            ? 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120'
            : 'nullable|string';

        $validated = $request->validate([
            'name_en' => 'sometimes|required|string|max:255',
            'name_km' => 'nullable|string|max:255',
            'role_en' => 'sometimes|required|string|max:255',
            'role_km' => 'nullable|string|max:255',
            'image' => $imageRule,
            'order' => 'nullable|integer',
            'is_published' => 'nullable',
        ]);

        if ($hasImage) {
            $validated['image'] = \App\Services\StorageService::upload($request->file('image'), 'destinations', 'team');
        }

        if ($request->has('is_published')) {
            $validated['is_published'] = $request->boolean('is_published');
        }

        if (isset($validated['order'])) {
            $validated['order'] = (int) $validated['order'];
        }

        $member->update($validated);
        Cache::flush();
        AuditLog::record('team_member_updated', $member);

        return $this->successResponse([
            'member' => new TeamMemberResource($member),
        ], 'Team member updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $member = TeamMember::find($id);
        if (!$member) {
            return $this->errorResponse('Team member not found', 404);
        }

        $member->delete();
        Cache::flush();
        AuditLog::record('team_member_deleted', ['id' => $id]);

        return $this->successResponse(null, 'Team member deleted successfully');
    }
}
