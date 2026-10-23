<?php

namespace App\Modules\Business\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class BusinessMember extends Model
{
    use HasFactory;

    public const ROLES = ['owner', 'manager', 'editor', 'viewer'];

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
        'manager' => [
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
            'notifications.view',
        ],
        'editor' => [
            'business.view',
            'business.update',
            'profile.update',
            'media.manage',
            'hours.manage',
            'stats.view',
            'notifications.view',
        ],
        'viewer' => [
            'business.view',
            'stats.view',
            'notifications.view',
        ],
    ];

    protected $table = 'biz_business_members';

    protected $fillable = [
        'business_id',
        'user_id',
        'role',
        'status',
        'invited_by',
        'invited_email',
        'invite_token',
        'invited_at',
        'accepted_at',
        'last_active_at',
    ];

    protected function casts(): array
    {
        return [
            'invited_at' => 'datetime',
            'accepted_at' => 'datetime',
            'last_active_at' => 'datetime',
        ];
    }

    public static function boot(): void
    {
        parent::boot();

        static::creating(function (self $model) {
            if ($model->status === 'invited' && empty($model->invite_token)) {
                $model->invite_token = Str::random(64);
                $model->invited_at = now();
            }
        });
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
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
