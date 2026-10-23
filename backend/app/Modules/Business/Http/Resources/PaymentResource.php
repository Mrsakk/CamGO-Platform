<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subscription_id' => $this->subscription_id,
            'invoice_id' => $this->invoice_id,
            'amount_usd' => (float) $this->amount_usd,
            'amount_cents' => (int) $this->amount_cents,
            'currency' => $this->currency,
            'method' => $this->method,
            'reference_no' => $this->reference_no,
            'receipt_no' => $this->receipt_no,
            'status' => $this->status,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'notes' => $this->notes,
            'voided_at' => $this->voided_at?->toIso8601String(),
            'void_reason' => $this->void_reason,
            'verified_by' => $this->whenLoaded('verifier', fn () => $this->verifier ? [
                'id' => $this->verifier->id,
                'name' => $this->verifier->name,
            ] : null),
            'subscription' => $this->whenLoaded('subscription', fn () => $this->subscription ? [
                'id' => $this->subscription->id,
                'status' => $this->subscription->status,
                'starts_at' => $this->subscription->starts_at?->toIso8601String(),
                'ends_at' => $this->subscription->ends_at?->toIso8601String(),
                'price_usd' => (float) $this->subscription->price_usd,
                'business' => $this->subscription->relationLoaded('business') && $this->subscription->business ? [
                    'id' => $this->subscription->business->id,
                    'slug' => $this->subscription->business->slug,
                    'name_km' => $this->subscription->business->name_km,
                    'name_en' => $this->subscription->business->name_en,
                    'tier' => $this->subscription->business->tier,
                ] : null,
                'plan' => $this->subscription->relationLoaded('plan') && $this->subscription->plan ? [
                    'id' => $this->subscription->plan->id,
                    'code' => $this->subscription->plan->code,
                    'name_km' => $this->subscription->plan->name_km,
                    'name_en' => $this->subscription->plan->name_en,
                    'billing_cycle' => $this->subscription->plan->billing_cycle,
                ] : null,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
