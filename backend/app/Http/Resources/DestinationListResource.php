<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class DestinationListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userId = Auth::guard('sanctum')->id();
        $isFavorited = false;

        if ($userId) {
            // Check if favorites relation is loaded, or check directly
            if ($this->relationLoaded('favorites')) {
                $isFavorited = $this->favorites->contains('user_id', $userId);
            } else {
                $isFavorited = $this->favorites()->where('user_id', $userId)->exists();
            }
        }

        return [
            'id' => $this->id,
            'ulid' => $this->ulid,
            'slug' => $this->slug,
            'name_km' => $this->name_km,
            'name_en' => $this->name_en,
            'excerpt_km' => $this->excerpt_km,
            'excerpt_en' => $this->excerpt_en,
            'cover_image' => $this->cover_image,
            'is_free' => (bool) $this->is_free,
            'entrance_fee_usd' => (float) $this->entrance_fee_usd,
            'entrance_fee_en' => $this->entrance_fee_en,
            'entrance_fee_km' => $this->entrance_fee_km,
            'opening_hours_en' => $this->opening_hours_en,
            'opening_hours_km' => $this->opening_hours_km,
            'avg_rating' => (float) $this->avg_rating,
            'reviews_count' => (int) $this->reviews_count,
            'view_count' => (int) $this->view_count,
            'is_featured' => (bool) $this->is_featured,
            'is_published' => (bool) $this->is_published,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'is_favorited' => $isFavorited,
            'province' => $this->province ? [
                'id' => $this->province->id,
                'slug' => $this->province->slug,
                'name_km' => $this->province->name_km,
                'name_en' => $this->province->name_en,
            ] : null,
            'category' => $this->category ? [
                'id' => $this->category->id,
                'slug' => $this->category->slug,
                'name_km' => $this->category->name_km,
                'name_en' => $this->category->name_en,
                'icon' => $this->category->icon,
            ] : null,
        ];
    }
}
