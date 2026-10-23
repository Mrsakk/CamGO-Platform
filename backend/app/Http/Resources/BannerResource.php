<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BannerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title_km' => $this->title_km,
            'title_en' => $this->title_en,
            'subtitle_km' => $this->subtitle_km,
            'subtitle_en' => $this->subtitle_en,
            'image_url' => $this->image_url,
            'button_text_km' => $this->button_text_km,
            'button_text_en' => $this->button_text_en,
            'link_url' => $this->link_url,
            'order' => $this->order,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
