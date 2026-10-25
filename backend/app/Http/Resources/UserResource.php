<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'country' => $this->country,
            'avatar' => $this->avatar,
            'bio' => $this->bio,
            'is_active' => (bool) $this->is_active,
            'must_change_password' => (bool) $this->must_change_password,
            'business_id' => $this->business_id,
            'business' => $this->business ? [
                'id' => $this->business->id,
                'name_km' => $this->business->name_km,
                'name_en' => $this->business->name_en,
                'slug' => $this->business->slug,
                'tier' => $this->business->tier,
                'status' => $this->business->status,
                'is_verified' => (bool) $this->business->is_verified,
            ] : null,
            'business_role' => $this->businessRole(),
            'business_capabilities' => $this->businessCapabilities(),
            'notification_preferences' => $this->notification_preferences,
            'roles' => $this->relationLoaded('roles') ? $this->roles->pluck('name') : $this->getRoleNames(),
            'permissions' => $this->relationLoaded('roles')
                ? $this->roles->flatMap(fn($r) => $r->permissions->pluck('name'))->unique()->values()
                : ($this->relationLoaded('permissions') ? $this->permissions->pluck('name') : $this->getAllPermissions()->pluck('name')),
            'favorites_count' => $this->favorites_count ?? ($this->relationLoaded('favorites') ? $this->favorites->count() : $this->favorites()->count()),
            'reviews_count' => $this->reviews_count ?? ($this->relationLoaded('reviews') ? $this->reviews->count() : $this->reviews()->count()),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
