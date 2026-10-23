<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_en' => $this->name_en,
            'name_km' => $this->name_km,
            'role_en' => $this->role_en,
            'role_km' => $this->role_km,
            'image' => $this->image,
            'image_url' => $this->image,
            'order' => (int) $this->order,
            'is_published' => (bool) $this->is_published,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
