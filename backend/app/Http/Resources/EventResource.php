<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title_km' => $this->title_km,
            'title_en' => $this->title_en,
            'description_km' => $this->description_km,
            'description_en' => $this->description_en,
            'location_name_km' => $this->location_name_km,
            'location_name_en' => $this->location_name_en,
            'cover_image' => $this->cover_image,
            'image_url' => $this->cover_image,
            'start_date' => $this->start_date?->toISOString(),
            'start_date_raw' => $this->start_date?->format('Y-m-d H:i:s'),
            'start_date_date' => $this->start_date?->format('Y-m-d'),
            'start_day' => $this->start_date ? (int) $this->start_date->format('j') : null,
            'start_month' => $this->start_date ? (int) $this->start_date->format('n') : null,
            'start_year' => $this->start_date ? (int) $this->start_date->format('Y') : null,
            'start_time' => ($this->start_date && $this->start_date->format('H:i') !== '00:00') ? $this->start_date->format('H:i') : null,
            'end_date' => $this->end_date?->toISOString(),
            'end_date_raw' => $this->end_date?->format('Y-m-d H:i:s'),
            'end_date_date' => $this->end_date?->format('Y-m-d'),
            'end_day' => $this->end_date ? (int) $this->end_date->format('j') : null,
            'end_month' => $this->end_date ? (int) $this->end_date->format('n') : null,
            'end_year' => $this->end_date ? (int) $this->end_date->format('Y') : null,
            'formatted_date' => $this->start_date?->format('M d, Y') . ($this->end_date ? ' - ' . $this->end_date->format('M d, Y') : ''),
            'is_featured' => (bool) $this->is_featured,
            'is_published' => (bool) $this->is_published,
            'province' => $this->province ? [
                'id' => $this->province->id,
                'name_km' => $this->province->name_km,
                'name_en' => $this->province->name_en,
            ] : null,
        ];
    }
}
