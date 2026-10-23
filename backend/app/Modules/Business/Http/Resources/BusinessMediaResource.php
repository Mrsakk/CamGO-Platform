<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessMediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url,
            'url_800' => $this->url_800,
            'url_400' => $this->url_400,
            'alt_km' => $this->alt_km,
            'alt_en' => $this->alt_en,
            'sort_order' => $this->sort_order,
            'is_cover' => (bool) $this->is_cover,
        ];
    }
}
