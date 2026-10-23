<?php

namespace App\Modules\Business\Services;

use App\Models\AuditLog;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Invoice;
use App\Modules\Business\Models\Payment;
use App\Modules\Business\Models\Plan;
use App\Modules\Business\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SubscriptionService
{
    public function activate(Business $business, Plan $plan, array $data = [], ?User $admin = null): array
    {
        return DB::transaction(function () use ($business, $plan, $data, $admin) {
            $adminId = $admin?->id ?? Auth::id();

            $startsAt = !empty($data['starts_at'])
                ? Carbon::parse($data['starts_at'])
                : now();

            $endsAt = !empty($data['ends_at'])
                ? Carbon::parse($data['ends_at'])
                : $this->calculateEndsAt($plan, $startsAt);

            $oldValues = $business->only([
                'tier',
                'subscription_expires_at',
                'featured_until',
                'sponsored_category_until',
                'sponsored_province_until',
                'is_verified',
                'verified_at',
                'verified_by',
            ]);

            Subscription::where('business_id', $business->id)
                ->whereIn('status', ['active', 'trialing', 'past_due'])
                ->update([
                    'status' => 'canceled',
                    'canceled_at' => now(),
                    'updated_at' => now(),
                ]);

            $isTrial = (bool) ($data['is_trial'] ?? false);

            $subscription = Subscription::create([
                'business_id' => $business->id,
                'plan_id' => $plan->id,
                'status' => $isTrial ? 'trialing' : 'active',
                'billing_cycle' => $data['billing_cycle'] ?? ($plan->billing_cycle === 'yearly' ? 'yearly' : 'monthly'),
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'price_usd' => $data['price_usd'] ?? $plan->price_usd,
                'currency' => $data['currency'] ?? 'USD',
                'auto_renew' => (bool) ($data['auto_renew'] ?? false),
                'is_trial' => $isTrial,
                'trial_starts_at' => $isTrial ? $startsAt : null,
                'trial_ends_at' => $isTrial ? $endsAt : null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $adminId,
                'approved_by' => $adminId,
            ]);

            $warning = null;
            $effectiveEndsAt = $plan->billing_cycle === 'none' ? null : $endsAt;

            $business->tier = $plan->code;
            $business->subscription_expires_at = $effectiveEndsAt;

            $featuredUntil = $plan->code === 'premium'
                ? ($data['featured_until'] ?? $endsAt)
                : ($data['featured_until'] ?? null);
            $business->featured_until = $this->capToSubscriptionEnd($featuredUntil, $effectiveEndsAt);

            if ($plan->code === 'free') {
                if (!empty($data['sponsored_category_until']) || !empty($data['sponsored_province_until'])) {
                    $warning = 'Sponsored placement is only available on paid plans; sponsor dates were cleared.';
                }

                $business->sponsored_category_until = null;
                $business->sponsored_province_until = null;
            } else {
                foreach (['sponsored_category_until', 'sponsored_province_until'] as $field) {
                    if (array_key_exists($field, $data)) {
                        $business->{$field} = $this->capToSubscriptionEnd($data[$field], $effectiveEndsAt);
                    } elseif ($business->{$field} && $effectiveEndsAt && $business->{$field}->gt($effectiveEndsAt)) {
                        $business->{$field} = $effectiveEndsAt->copy();
                    }
                }
            }

            $paidPlan = in_array($plan->code, ['pro', 'premium'], true);
            $hasKyc = $business->documents()->exists();

            if (array_key_exists('is_verified', $data) && $data['is_verified'] !== null) {
                if ((bool) $data['is_verified'] && !$hasKyc) {
                    throw ValidationException::withMessages([
                        'is_verified' => 'At least one KYC document is required before granting the verified badge.',
                    ]);
                }

                $business->is_verified = (bool) $data['is_verified'];
                if ($business->is_verified && !$business->verified_at) {
                    $business->verified_at = now();
                    $business->verified_by = $adminId;
                }
            } elseif ($paidPlan) {
                if ($hasKyc) {
                    $business->is_verified = true;
                    if (!$business->verified_at) {
                        $business->verified_at = now();
                        $business->verified_by = $adminId;
                    }
                } else {
                    $message = 'Subscription activated, but the verified badge was not granted because no KYC document is on file.';
                    $warning = $warning ? "{$warning} {$message}" : $message;
                }
            }

            $business->save();
            Cache::forget('biz:public:home');

            $subscription->setRelation('business', $business);
            $subscription->setRelation('plan', $plan);

            AuditLog::record('subscription_activated', $subscription, $oldValues, [
                'business_id' => $business->id,
                'plan_id' => $plan->id,
                'plan_code' => $plan->code,
                'starts_at' => $startsAt->toIso8601String(),
                'ends_at' => $subscription->ends_at?->toIso8601String(),
                'price_usd' => $subscription->price_usd,
                'featured_until' => $business->featured_until?->toIso8601String(),
                'sponsored_category_until' => $business->sponsored_category_until?->toIso8601String(),
                'sponsored_province_until' => $business->sponsored_province_until?->toIso8601String(),
                'warning' => $warning,
            ]);

            if (!empty($data['payment']) && is_array($data['payment'])) {
                $this->recordPayment($subscription, $data['payment'], $admin);
            }

            return [
                'subscription' => $subscription->fresh(['plan', 'business', 'payments']),
                'business' => $business->fresh(),
                'warning' => $warning,
            ];
        });
    }

    public function activateTrial(Business $business, ?User $user = null): array
    {
        if ($business->hasUsedTrial()) {
            throw ValidationException::withMessages([
                'trial' => 'This business has already used its free trial.',
            ]);
        }

        $plan = Plan::where('code', 'pro')->where('is_active', true)->first();

        if (!$plan) {
            throw ValidationException::withMessages([
                'trial' => 'The Pro plan is not available.',
            ]);
        }

        $trialDays = max(1, (int) ($plan->trial_days ?: 30));

        return DB::transaction(function () use ($business, $plan, $user, $trialDays) {
            $startsAt = now();
            $endsAt = $startsAt->copy()->addDays($trialDays);

            $result = $this->activate($business, $plan, [
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'price_usd' => 0,
                'currency' => 'USD',
                'auto_renew' => false,
                'is_trial' => true,
                'notes' => "{$trialDays}-day Pro trial",
            ], $user);

            $result['subscription']->update(['is_trial' => true]);

            $business->forceFill([
                'trial_started_at' => $startsAt,
                'trial_ends_at' => $endsAt,
            ])->save();

            AuditLog::record('business_trial_started', $business, null, [
                'business_id' => $business->id,
                'trial_started_at' => $startsAt->toIso8601String(),
                'trial_ends_at' => $endsAt->toIso8601String(),
            ]);

            return [
                'subscription' => $result['subscription']->fresh(['plan', 'business', 'payments']),
                'business' => $business->fresh(),
                'trial_ends_at' => $endsAt->toIso8601String(),
            ];
        });
    }

    public function recordPayment(Subscription $subscription, array $data, ?User $admin = null): Payment
    {
        $adminId = $admin?->id ?? Auth::id();

        $receiptNo = $data['receipt_no'] ?? null;
        if (empty($receiptNo)) {
            do {
                $receiptNo = 'KM-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
            } while (Payment::where('receipt_no', $receiptNo)->exists());
        }

        $amountUsd = (float) ($data['amount_usd'] ?? $subscription->price_usd);
        $amountCents = (int) ($data['amount_cents'] ?? round($amountUsd * 100));

        $payment = Payment::create([
            'subscription_id' => $subscription->id,
            'invoice_id' => $data['invoice_id'] ?? null,
            'amount_usd' => $amountUsd,
            'amount_cents' => $amountCents,
            'currency' => $data['currency'] ?? $subscription->currency ?? 'USD',
            'method' => $data['method'] ?? 'cash',
            'reference_no' => $data['reference_no'] ?? null,
            'receipt_no' => $receiptNo,
            'status' => $data['status'] ?? 'recorded',
            'paid_at' => !empty($data['paid_at']) ? Carbon::parse($data['paid_at']) : now(),
            'verified_by' => $adminId,
            'recorded_by' => $adminId,
            'notes' => $data['notes'] ?? null,
        ]);

        AuditLog::record('subscription_payment_recorded', $payment, null, [
            'subscription_id' => $subscription->id,
            'business_id' => $subscription->business_id,
            'amount_usd' => $payment->amount_usd,
            'amount_cents' => $payment->amount_cents,
            'currency' => $payment->currency,
            'method' => $payment->method,
            'receipt_no' => $payment->receipt_no,
        ]);

        return $payment;
    }

    public function expireDue(): array
    {
        $now = now();

        $graceDays = 3;
        $pastDueSubscriptions = Subscription::where('status', 'active')
            ->whereNotNull('ends_at')
            ->where('ends_at', '<=', $now)
            ->whereNull('past_due_at')
            ->get();

        foreach ($pastDueSubscriptions as $subscription) {
            $subscription->update([
                'status' => 'past_due',
                'past_due_at' => $now,
                'grace_ends_at' => $now->copy()->addDays($graceDays),
            ]);
        }

        $expiredTrials = Subscription::where('status', 'trialing')
            ->whereNotNull('ends_at')
            ->where('ends_at', '<=', $now)
            ->update([
                'status' => 'expired',
                'updated_at' => $now,
            ]);

        $expiredPastDue = Subscription::where('status', 'past_due')
            ->whereNotNull('grace_ends_at')
            ->where('grace_ends_at', '<=', $now)
            ->update([
                'status' => 'expired',
                'updated_at' => $now,
            ]);

        $expiredSubscriptions = $expiredTrials + $expiredPastDue;

        $downgradedBusinesses = 0;

        $paidBusinesses = Business::where('tier', '!=', 'free')->get();

        foreach ($paidBusinesses as $business) {
            $hasSubscriptionRecords = $business->subscriptions()->exists();

            $stillActive = $hasSubscriptionRecords
                ? $business->subscriptions()
                    ->where(function ($query) use ($now) {
                        $query->where(function ($active) use ($now) {
                            $active->whereIn('status', ['active', 'trialing'])
                                ->where(function ($inner) use ($now) {
                                    $inner->whereNull('ends_at')->orWhere('ends_at', '>', $now);
                                });
                        })->orWhere(function ($pastDue) use ($now) {
                            $pastDue->where('status', 'past_due')
                                ->where('grace_ends_at', '>', $now);
                        });
                    })
                    ->exists()
                : $business->isSubscriptionActive();

            if ($stillActive) {
                continue;
            }

            $oldValues = $business->only([
                'tier',
                'subscription_expires_at',
                'featured_until',
                'sponsored_category_until',
                'sponsored_province_until',
            ]);

            $business->tier = 'free';
            $business->subscription_expires_at = null;
            $business->featured_until = null;
            $business->sponsored_category_until = null;
            $business->sponsored_province_until = null;
            $business->save();

            AuditLog::record('business_subscription_expired', $business, $oldValues, [
                'tier' => 'free',
                'subscription_expires_at' => null,
                'featured_until' => null,
                'sponsored_category_until' => null,
                'sponsored_province_until' => null,
            ]);

            $downgradedBusinesses++;
        }

        if ($expiredSubscriptions > 0 || $downgradedBusinesses > 0) {
            Cache::forget('biz:public:home');
        }

        return [
            'subscriptions' => $expiredSubscriptions,
            'businesses' => $downgradedBusinesses,
        ];
    }

    public function voidPayment(Payment $payment, string $reason, ?User $admin = null): Payment
    {
        if ($payment->status === 'voided') {
            throw ValidationException::withMessages([
                'payment' => 'This payment has already been voided.',
            ]);
        }

        $oldValues = $payment->only(['status', 'voided_at', 'void_reason']);

        $payment->update([
            'status' => 'voided',
            'voided_at' => now(),
            'void_reason' => $reason,
        ]);

        AuditLog::record('subscription_payment_voided', $payment, $oldValues, [
            'reason' => $reason,
            'voided_by' => $admin?->id ?? Auth::id(),
        ]);

        return $payment;
    }

    public function createInvoice(Business $business, Subscription $subscription, int $amountCents, ?User $admin = null): Invoice
    {
        do {
            $invoiceNo = 'INV-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (Invoice::where('invoice_no', $invoiceNo)->exists());

        $invoice = Invoice::create([
            'invoice_no' => $invoiceNo,
            'business_id' => $business->id,
            'subscription_id' => $subscription->id,
            'amount_cents' => $amountCents,
            'currency' => 'USD',
            'status' => 'issued',
            'issued_at' => now(),
            'due_at' => now()->addDays(7),
            'created_by' => $admin?->id ?? Auth::id(),
        ]);

        AuditLog::record('invoice_created', $invoice, null, [
            'invoice_no' => $invoice->invoice_no,
            'amount_cents' => $invoice->amount_cents,
        ]);

        return $invoice;
    }

    private function capToSubscriptionEnd(mixed $value, ?Carbon $endsAt): ?Carbon
    {
        if (empty($value)) {
            return null;
        }

        $date = $value instanceof Carbon ? $value->copy() : Carbon::parse($value);

        if ($endsAt && $date->gt($endsAt)) {
            return $endsAt->copy();
        }

        return $date;
    }

    private function calculateEndsAt(Plan $plan, Carbon $startsAt): ?Carbon
    {
        return match ($plan->billing_cycle) {
            'monthly' => $startsAt->copy()->addMonth(),
            'yearly' => $startsAt->copy()->addYear(),
            default => null,
        };
    }
}
