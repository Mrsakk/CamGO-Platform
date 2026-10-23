<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessPublicDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $coverMedia = $this->coverMedia ?: $this->media->firstWhere('is_cover', true) ?: $this->media->first();
        $primaryContact = $this->contacts->firstWhere('is_primary', true) ?: $this->contacts->first();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name_km' => $this->name_km,
            'name_en' => $this->name_en,
            'tagline_km' => $this->tagline_km,
            'tagline_en' => $this->tagline_en,
            'description_km' => $this->description_km,
            'description_en' => $this->description_en,
            'address_km' => $this->address_km,
            'address_en' => $this->address_en,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'price_level' => $this->price_level,
            'is_verified' => (bool) $this->is_verified,
            'tier' => $this->effectiveTier(),
            'is_featured' => $this->isFeatured(),
            'is_sponsored_category' => $this->isSponsoredCategory(),
            'is_sponsored_province' => $this->isSponsoredProvince(),
            'verified_at' => $this->verified_at?->toIso8601String(),
            'rating_avg' => (float) $this->rating_avg,
            'rating_count' => (int) $this->rating_count,
            'open_now' => $this->isOpenNow(),
            'category' => $this->category ? [
                'id' => $this->category->id,
                'slug' => $this->category->slug,
                'name_km' => $this->category->name_km,
                'name_en' => $this->category->name_en,
                'icon' => $this->category->icon,
                'service_presets' => $this->category->service_presets ?? [],
            ] : null,
            'province' => $this->province ? [
                'id' => $this->province->id,
                'slug' => $this->province->slug,
                'name_km' => $this->province->name_km,
                'name_en' => $this->province->name_en,
            ] : null,
            'cover_image' => $coverMedia ? [
                'url' => $coverMedia->url,
                'url_800' => $coverMedia->url_800,
                'url_400' => $coverMedia->url_400,
                'alt_km' => $coverMedia->alt_km,
                'alt_en' => $coverMedia->alt_en,
            ] : null,
            'primary_contact' => $primaryContact ? [
                'type' => $primaryContact->type,
                'value' => $primaryContact->value,
                'label' => $primaryContact->label,
            ] : null,
            'contacts' => BusinessContactResource::collection($this->whenLoaded('contacts')),
            'services' => BusinessServiceResource::collection($this->whenLoaded('activeServices')),
            'hours' => BusinessHourResource::collection($this->whenLoaded('hours')),
            'closures' => $this->whenLoaded('closures', function () {
                return $this->closures->map(fn ($c) => [
                    'id' => $c->id,
                    'from_date' => $c->from_date?->format('Y-m-d'),
                    'to_date' => $c->to_date?->format('Y-m-d'),
                    'note_km' => $c->note_km,
                    'note_en' => $c->note_en,
                ]);
            }),
            'media' => BusinessMediaResource::collection($this->whenLoaded('media')),
            'branches' => $this->whenLoaded('branches', function () {
                return $this->branches->map(fn ($branch) => [
                    'id' => $branch->id,
                    'name_km' => $branch->name_km,
                    'name_en' => $branch->name_en,
                    'address_km' => $branch->address_km,
                    'address_en' => $branch->address_en,
                    'phone' => $branch->phone,
                    'lat' => $branch->lat,
                    'lng' => $branch->lng,
                    'hours' => $branch->hours,
                    'is_primary' => (bool) $branch->is_primary,
                ]);
            }),
            'approved_reviews' => BusinessReviewResource::collection($this->whenLoaded('approvedReviews')),
            'nearby_destinations' => $this->whenLoaded('nearbyDestinations', function () {
                return $this->nearbyDestinations->take(6)->map(function ($dest) {
                    return [
                        'id' => $dest->id,
                        'slug' => $dest->slug,
                        'name_km' => $dest->name_km,
                        'name_en' => $dest->name_en,
                        'cover_image' => $dest->cover_image,
                        'distance_km' => (float) ($dest->pivot?->distance_km ?? 0),
                    ];
                });
            }),
        ];
    }
}
