<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class DestinationDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userId = Auth::guard('sanctum')->id();
        $isFavorited = false;

        if ($userId) {
            $isFavorited = $this->favorites()->where('user_id', $userId)->exists();
        }

        return [
            'id' => $this->id,
            'ulid' => $this->ulid,
            'slug' => $this->slug,
            'name_km' => $this->name_km,
            'name_en' => $this->name_en,
            'excerpt_km' => $this->excerpt_km,
            'excerpt_en' => $this->excerpt_en,
            'description_km' => $this->description_km,
            'description_en' => $this->description_en,
            'highlights_km' => $this->highlights_km ?? [],
            'highlights_en' => $this->highlights_en ?? [],
            'cover_image' => $this->cover_image,
            'image_url' => $this->cover_image,
            'image' => $this->cover_image,
            'opening_hours_en' => $this->opening_hours_en,
            'opening_hours_km' => $this->opening_hours_km,
            'entrance_fee_usd' => (float) $this->entrance_fee_usd,
            'entrance_fee_en' => $this->entrance_fee_en,
            'entrance_fee_km' => $this->entrance_fee_km,
            'is_free' => (bool) $this->is_free,
            'best_time_en' => $this->best_time_en,
            'best_time_km' => $this->best_time_km,
            'how_to_get_there_en' => $this->how_to_get_there_en,
            'how_to_get_there_km' => $this->how_to_get_there_km,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'address_en' => $this->address_en,
            'address_km' => $this->address_km,
            'avg_rating' => (float) $this->avg_rating,
            'reviews_count' => (int) $this->reviews_count,
            'view_count' => (int) $this->view_count,
            'is_featured' => (bool) $this->is_featured,
            'is_published' => (bool) $this->is_published,
            'is_favorited' => $isFavorited,
            'province' => new ProvinceResource($this->whenLoaded('province')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'images' => $this->images->map(function ($img) {
                return [
                    'id' => $img->id,
                    'image_path' => $img->image_path,
                    'image_url' => $img->image_path,
                    'caption_km' => $img->caption_km,
                    'caption_en' => $img->caption_en,
                    'is_cover' => (bool) $img->is_cover,
                    'order' => $img->order,
                ];
            }),
            'reviews' => ReviewResource::collection($this->whenLoaded('approvedReviews')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
