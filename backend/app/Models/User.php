<?php

namespace App\Models;

use App\Modules\Business\Models\BusinessMember;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'must_change_password',
        'phone',
        'country',
        'avatar',
        'bio',
        'is_active',
        'email_verified_at',
        'business_id',
        'telegram_chat_id',
        'notification_preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
            'is_active' => 'boolean',
            'notification_preferences' => 'array',
        ];
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function favoriteDestinations(): BelongsToMany
    {
        return $this->belongsToMany(Destination::class, 'favorites', 'user_id', 'destination_id')
            ->withTimestamps();
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function blogPosts(): HasMany
    {
        return $this->hasMany(BlogPost::class, 'author_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }

    public function business(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Modules\Business\Models\Business::class, 'business_id');
    }

    public function businessMemberships(): HasMany
    {
        return $this->hasMany(BusinessMember::class);
    }

    public function businessUsers(): HasMany
    {
        return $this->hasMany(\App\Modules\Business\Models\BusinessUser::class);
    }

    public function activeBusinessUser(): HasOne
    {
        return $this->hasOne(\App\Modules\Business\Models\BusinessUser::class)
            ->where('status', 'active')
            ->latestOfMany();
    }

    public function businessMembership(): HasOne
    {
        return $this->hasOne(BusinessMember::class)
            ->where('status', 'active')
            ->latestOfMany();
    }

    public function businessRole(): ?string
    {
        $memberships = $this->relationLoaded('businessMemberships')
            ? $this->businessMemberships
            : $this->businessMemberships()->get();

        $active = $memberships->firstWhere('status', 'active');
        if ($active) {
            return $active->role;
        }

        if ($memberships->isEmpty()) {
            $businessUser = $this->activeBusinessUser;

            if ($businessUser) {
                return match ($businessUser->role) {
                    'owner' => 'owner',
                    'admin' => 'manager',
                    'staff' => 'editor',
                    default => null,
                };
            }
        }

        if ($memberships->isNotEmpty()) {
            return null;
        }

        return $this->hasAnyRole(['Business Owner', 'business_owner']) && !empty($this->business_id)
            ? 'owner'
            : null;
    }

    public function businessCapabilities(): array
    {
        $businessUser = $this->activeBusinessUser;

        if ($businessUser) {
            return $businessUser->capabilities();
        }

        $role = $this->businessRole();

        return $role ? (BusinessMember::ROLE_CAPABILITIES[$role] ?? []) : [];
    }

    public function hasBusinessCapability(string $capability): bool
    {
        return in_array($capability, $this->businessCapabilities(), true);
    }

    public function canAccessBusiness(int $businessId): bool
    {
        if ($this->businessRole() === null) {
            return false;
        }

        if ((int) $this->business_id === $businessId) {
            return true;
        }

        return $this->businessUsers()
            ->where('business_id', $businessId)
            ->where('status', 'active')
            ->exists();
    }

    public function isBusinessOwner(): bool
    {
        return $this->businessRole() !== null;
    }

    public function notificationPreference(string $key, bool $default = true): bool
    {
        $preferences = $this->notification_preferences ?? [];

        return array_key_exists($key, $preferences) ? (bool) $preferences[$key] : $default;
    }

    public function isAdmin(): bool
    {
        return $this->hasAnyRole([
            'Super Admin', 'super_admin',
            'Content Manager', 'content_manager',
            'Moderator', 'moderator',
            'Admin', 'admin',
            'Business Manager', 'business_manager',
            'business_admin',
            'business_staff',
        ]);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasAnyRole(['Super Admin', 'super_admin']);
    }
}
