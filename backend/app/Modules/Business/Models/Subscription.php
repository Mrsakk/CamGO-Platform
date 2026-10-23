<?php

namespace App\Modules\Business\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    use HasFactory;

    protected $table = 'biz_subscriptions';

    public const STATUSES = ['trialing', 'active', 'past_due', 'canceled', 'expired'];

    protected $fillable = [
        'business_id',
        'plan_id',
        'status',
        'billing_cycle',
        'starts_at',
        'ends_at',
        'price_usd',
        'currency',
        'auto_renew',
        'is_trial',
        'trial_starts_at',
        'trial_ends_at',
        'past_due_at',
        'grace_ends_at',
        'notes',
        'created_by',
        'approved_by',
        'canceled_at',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'trial_starts_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'past_due_at' => 'datetime',
            'grace_ends_at' => 'datetime',
            'canceled_at' => 'datetime',
            'price_usd' => 'float',
            'auto_renew' => 'boolean',
            'is_trial' => 'boolean',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'subscription_id')->latest('paid_at');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['active', 'trialing']);
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trialing'], true)
            && ($this->ends_at === null || $this->ends_at->isFuture());
    }

    public function isTrialing(): bool
    {
        return $this->status === 'trialing'
            && $this->trial_ends_at !== null
            && $this->trial_ends_at->isFuture();
    }
}
