<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_km' => $this->name_km,
            'name_en' => $this->name_en,
            'description_km' => $this->description_km,
            'description_en' => $this->description_en,
            'price_usd' => $this->price_usd !== null ? (float) $this->price_usd : null,
            'duration_minutes' => $this->duration_minutes !== null ? (int) $this->duration_minutes : null,
            'is_active' => (bool) $this->is_active,
            'sort_order' => (int) $this->sort_order,
        ];
    }
}
