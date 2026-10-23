<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'contact_phone' => $this->contact_phone,
            'note' => $this->note,
            'admin_note' => $this->admin_note,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'business' => $this->whenLoaded('business', fn () => $this->business ? [
                'id' => $this->business->id,
                'slug' => $this->business->slug,
                'name_km' => $this->business->name_km,
                'name_en' => $this->business->name_en,
                'tier' => $this->business->tier,
                'is_verified' => (bool) $this->business->is_verified,
            ] : null),
            'requested_plan' => $this->whenLoaded('requestedPlan', fn () => $this->requestedPlan ? [
                'id' => $this->requestedPlan->id,
                'code' => $this->requestedPlan->code,
                'name_km' => $this->requestedPlan->name_km,
                'name_en' => $this->requestedPlan->name_en,
                'price_usd' => (float) $this->requestedPlan->price_usd,
                'billing_cycle' => $this->requestedPlan->billing_cycle,
            ] : null),
            'requester' => $this->whenLoaded('requester', fn () => $this->requester ? [
                'id' => $this->requester->id,
                'name' => $this->requester->name,
                'email' => $this->requester->email,
            ] : null),
            'approver' => $this->whenLoaded('approver', fn () => $this->approver ? [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
