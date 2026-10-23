<?php

namespace App\Modules\Business\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessUser extends Model
{
    public const ROLES = ['owner', 'admin', 'staff'];

    public const ROLE_CAPABILITIES = [
        'owner' => [
            'business.view',
            'business.update',
            'profile.update',
            'media.manage',
            'hours.manage',
            'leads.view',
            'leads.manage',
            'reviews.view',
            'reviews.manage',
            'stats.view',
            'team.manage',
            'billing.manage',
            'kyc.manage',
            'notifications.view',
        ],
        'admin' => [
            'business.view',
            'business.update',
            'profile.update',
            'media.manage',
            'hours.manage',
            'leads.view',
            'leads.manage',
            'reviews.view',
            'reviews.manage',
            'stats.view',
            'team.manage',
            'notifications.view',
        ],
        'staff' => [
            'business.view',
            'leads.view',
            'leads.manage',
            'reviews.view',
            'reviews.manage',
            'stats.view',
            'notifications.view',
        ],
    ];

    protected $table = 'biz_business_users';

    protected $fillable = [
        'business_id',
        'user_id',
        'role',
        'status',
        'invited_by',
        'accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function capabilities(): array
    {
        return self::ROLE_CAPABILITIES[$this->role] ?? [];
    }

    public function can(string $capability): bool
    {
        return $this->isActive() && in_array($capability, $this->capabilities(), true);
    }
}
