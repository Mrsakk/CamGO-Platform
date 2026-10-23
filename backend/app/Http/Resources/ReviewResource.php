<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => (int) $this->rating,
            'comment' => $this->comment,
            'status' => $this->status,
            'created_at' => $this->created_at?->diffForHumans(),
            'created_at_raw' => $this->created_at?->toISOString(),
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => $this->user->avatar,
                'country' => $this->user->country,
            ] : null,
            'reviewable' => $this->whenLoaded('reviewable', function () {
                return [
                    'id' => $this->reviewable?->id,
                    'name_km' => $this->reviewable?->name_km,
                    'name_en' => $this->reviewable?->name_en,
                    'slug' => $this->reviewable?->slug,
                    'cover_image' => $this->reviewable?->cover_image,
                ];
            }),
            'images' => $this->images->pluck('image_path'),
        ];
    }
}
