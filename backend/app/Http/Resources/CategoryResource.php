<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name_km' => $this->name_km,
            'name_en' => $this->name_en,
            'icon' => $this->icon,
            'description_km' => $this->description_km,
            'description_en' => $this->description_en,
            'image' => $this->image,
            'is_active' => (bool) $this->is_active,
            'destinations_count' => $this->whenCounted('destinations', $this->destinations_count),
        ];
    }
}
