<?php

namespace App\Modules\Business\Http\Resources;

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
            'service_presets' => $this->service_presets ?? [],
            'sort_order' => $this->sort_order,
            'businesses_count' => $this->whenCounted('businesses'),
        ];
    }
}
