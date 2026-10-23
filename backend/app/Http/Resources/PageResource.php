<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title_km' => $this->title_km,
            'title_en' => $this->title_en,
            'content_km' => $this->content_km,
            'content_en' => $this->content_en,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'is_published' => (bool) $this->is_published,
        ];
    }
}
