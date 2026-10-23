<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessAdminListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $coverMedia = $this->coverMedia ?: $this->media->firstWhere('is_cover', true) ?: $this->media->first();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name_km' => $this->name_km,
            'name_en' => $this->name_en,
            'status' => $this->status,
            'is_verified' => (bool) $this->is_verified,
            'tier' => $this->tier ?: 'free',
            'effective_tier' => $this->effectiveTier(),
            'is_featured' => $this->isFeatured(),
            'is_sponsored_category' => $this->isSponsoredCategory(),
            'is_sponsored_province' => $this->isSponsoredProvince(),
            'subscription_expires_at' => $this->subscription_expires_at?->toIso8601String(),
            'price_level' => $this->price_level,
            'rating_avg' => (float) $this->rating_avg,
            'rating_count' => (int) $this->rating_count,
            'owner_name' => $this->owner_name,
            'owner_phone' => $this->owner_phone,
            'category' => $this->category ? [
                'id' => $this->category->id,
                'slug' => $this->category->slug,
                'name_km' => $this->category->name_km,
                'name_en' => $this->category->name_en,
            ] : null,
            'province' => $this->province ? [
                'id' => $this->province->id,
                'slug' => $this->province->slug,
                'name_km' => $this->province->name_km,
                'name_en' => $this->province->name_en,
            ] : null,
            'cover_image' => $coverMedia ? [
                'url' => $coverMedia->url,
                'url_400' => $coverMedia->url_400,
            ] : null,
            'can_be_approved' => $this->canBeApproved(),
            'missing_requirements' => $this->getPublishingMissingRequirements(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
