<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessAdminDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $coverMedia = $this->coverMedia ?: $this->media->firstWhere('is_cover', true) ?: $this->media->first();

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'province_id' => $this->province_id,
            'slug' => $this->slug,
            'name_km' => $this->name_km,
            'name_en' => $this->name_en,
            'tagline_km' => $this->tagline_km,
            'tagline_en' => $this->tagline_en,
            'description_km' => $this->description_km,
            'description_en' => $this->description_en,
            'profile_data' => $this->profile_data ?? [],
            'address_km' => $this->address_km,
            'address_en' => $this->address_en,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'price_level' => $this->price_level,
            'status' => $this->status,
            'is_verified' => (bool) $this->is_verified,
            'verified_at' => $this->verified_at?->toIso8601String(),
            'verified_by' => $this->verified_by,
            'verifier_name' => $this->verifier?->name,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'rating_avg' => (float) $this->rating_avg,
            'rating_count' => (int) $this->rating_count,
            'cover_media_id' => $this->cover_media_id,

            // Admin-only fields
            'owner_name' => $this->owner_name,
            'owner_phone' => $this->owner_phone,
            'internal_notes' => $this->internal_notes,

            // Subscription & Tiering fields
            'tier' => $this->tier ?: 'free',
            'effective_tier' => $this->effectiveTier(),
            'is_featured' => $this->isFeatured(),
            'is_sponsored_category' => $this->isSponsoredCategory(),
            'is_sponsored_province' => $this->isSponsoredProvince(),
            'subscription_expires_at' => $this->subscription_expires_at?->toIso8601String(),
            'featured_until' => $this->featured_until?->toIso8601String(),
            'sponsored_category_until' => $this->sponsored_category_until?->toIso8601String(),
            'sponsored_province_until' => $this->sponsored_province_until?->toIso8601String(),
            'is_subscription_active' => $this->isSubscriptionActive(),
            'is_on_trial' => $this->isOnTrial(),
            'has_used_trial' => $this->hasUsedTrial(),
            'trial_started_at' => $this->trial_started_at?->toIso8601String(),
            'trial_ends_at' => $this->trial_ends_at?->toIso8601String(),
            'entitlements' => $this->entitlements(),

            // Linked owner user accounts
            'owner_accounts' => $this->whenLoaded('owners', function () {
                return $this->owners->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone,
                    'is_active' => (bool) $u->is_active,
                    'must_change_password' => (bool) $u->must_change_password,
                    'email_verified_at' => $u->email_verified_at?->toIso8601String(),
                    'created_at' => $u->created_at?->toIso8601String(),
                ]);
            }),

            'can_be_approved' => $this->canBeApproved(),
            'missing_requirements' => $this->getPublishingMissingRequirements(),

            'category' => $this->category ? [
                'id' => $this->category->id,
                'slug' => $this->category->slug,
                'name_km' => $this->category->name_km,
                'name_en' => $this->category->name_en,
                'icon' => $this->category->icon,
                'profile_schema' => $this->category->profile_schema ?? [],
                'service_presets' => $this->category->service_presets ?? [],
            ] : null,
            'province' => $this->province ? [
                'id' => $this->province->id,
                'slug' => $this->province->slug,
                'name_km' => $this->province->name_km,
                'name_en' => $this->province->name_en,
            ] : null,
            'cover_image' => $coverMedia ? [
                'id' => $coverMedia->id,
                'url' => $coverMedia->url,
                'url_800' => $coverMedia->url_800,
                'url_400' => $coverMedia->url_400,
            ] : null,
            'contacts' => BusinessContactResource::collection($this->whenLoaded('contacts')),
            'services' => BusinessServiceResource::collection($this->whenLoaded('services')),
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
            'documents' => BusinessDocumentResource::collection($this->whenLoaded('documents')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
