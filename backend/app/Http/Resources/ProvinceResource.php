<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProvinceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'code' => $this->code,
            'name_km' => $this->name_km,
            'name_en' => $this->name_en,
            'description_km' => $this->description_km,
            'description_en' => $this->description_en,
            'image' => $this->image,
            'image_url' => $this->image_url ?? $this->image,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'area_km2' => $this->area_km2,
            'population' => $this->population,
            'is_featured' => (bool) $this->is_featured,
            'destinations_count' => $this->whenCounted('destinations', $this->destinations_count),
        ];
    }
}
