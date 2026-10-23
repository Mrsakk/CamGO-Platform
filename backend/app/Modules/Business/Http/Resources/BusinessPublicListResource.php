<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessPublicListResource extends JsonResource
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
            'rating_avg' => (float) $this->rating_avg,
            'rating_count' => (int) $this->rating_count,
            'open_now' => $this->isOpenNow(),
            'category' => $this->category ? [
                'id' => $this->category->id,
                'slug' => $this->category->slug,
                'name_km' => $this->category->name_km,
                'name_en' => $this->category->name_en,
                'icon' => $this->category->icon,
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
            'distance_km' => isset($this->distance_km) ? (float) $this->distance_km : null,
        ];
    }
}
