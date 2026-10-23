<?php

namespace App\Modules\Business\Models;

use App\Models\Destination;
use App\Models\Province;
use App\Models\User;
use Carbon\Carbon;
use DateTimeZone;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Business extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'biz_businesses';

    protected $fillable = [
        'organization_id',
        'category_id',
        'province_id',
        'slug',
        'name_km',
        'name_en',
        'tagline_km',
        'tagline_en',
        'description_km',
        'description_en',
        'profile_data',
        'address_km',
        'address_en',
        'lat',
        'lng',
        'price_level',
        'status',
        'is_verified',
        'verified_at',
        'verified_by',
        'approved_at',
        'published_at',
        'rejection_reason',
        'cover_media_id',
        'rating_avg',
        'rating_count',
        'owner_name',
        'owner_phone',
        'internal_notes',
        'tier',
        'subscription_expires_at',
        'featured_until',
        'sponsored_category_until',
        'sponsored_province_until',
        'trial_started_at',
        'trial_ends_at',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
            'price_level' => 'integer',
            'is_verified' => 'boolean',
            'verified_at' => 'datetime',
            'approved_at' => 'datetime',
            'published_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'featured_until' => 'datetime',
            'sponsored_category_until' => 'datetime',
            'sponsored_province_until' => 'datetime',
            'trial_started_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'profile_data' => 'array',
            'rating_avg' => 'float',
            'rating_count' => 'integer',
        ];
    }

    public static function boot(): void
    {
        parent::boot();

        static::creating(function (self $model) {
            if (empty($model->slug)) {
                $base = Str::slug($model->name_en ?: $model->name_km) ?: 'business';
                $slug = $base;
                $counter = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$base}-{$counter}";
                    $counter++;
                }
                $model->slug = $slug;
            }
        });
    }

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_id');
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class, 'business_id')->orderBy('sort_order')->orderBy('id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(BusinessService::class, 'business_id')->orderBy('sort_order')->orderBy('id');
    }

    public function activeServices(): HasMany
    {
        return $this->hasMany(BusinessService::class, 'business_id')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    public function hours(): HasMany
    {
        return $this->hasMany(BusinessHour::class, 'business_id')->orderBy('weekday')->orderBy('opens_at');
    }

    public function closures(): HasMany
    {
        return $this->hasMany(BusinessClosure::class, 'business_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(BusinessMedia::class, 'business_id')->orderBy('sort_order')->orderBy('id');
    }

    public function coverMedia(): BelongsTo
    {
        return $this->belongsTo(BusinessMedia::class, 'cover_media_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(BusinessDocument::class, 'business_id')->latest();
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(BusinessReview::class, 'business_id')->latest();
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(BusinessReview::class, 'business_id')->where('status', 'approved')->latest();
    }

    public function contactEvents(): HasMany
    {
        return $this->hasMany(BusinessContactEvent::class, 'business_id');
    }

    public function owners(): HasMany
    {
        return $this->hasMany(User::class, 'business_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(BusinessMember::class, 'business_id');
    }

    public function businessUsers(): HasMany
    {
        return $this->hasMany(BusinessUser::class, 'business_id');
    }

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class, 'business_id');
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(Verification::class, 'business_id')->latest();
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'business_id')->latest();
    }

    public function featuredSlots(): HasMany
    {
        return $this->hasMany(FeaturedSlot::class, 'business_id')->latest();
    }

    public function partnerRequests(): HasMany
    {
        return $this->hasMany(PartnerRequest::class, 'business_id')->latest();
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(MetricDaily::class, 'business_id');
    }

    public function nearbyBusinesses(): HasMany
    {
        return $this->hasMany(NearbyBusiness::class, 'business_id')->orderBy('distance_km');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'business_id')->latest('last_contact_at');
    }

    public function ownerNotifications(): HasMany
    {
        return $this->hasMany(OwnerNotification::class, 'business_id')->latest('id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'business_id')->latest('id');
    }

    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class, 'business_id')
            ->whereIn('status', ['active', 'trialing'])
            ->latestOfMany();
    }

    public function subscriptionRequests(): HasMany
    {
        return $this->hasMany(SubscriptionRequest::class, 'business_id')->latest('id');
    }

    public function isFeatured(): bool
    {
        if (! $this->isSubscriptionActive()) {
            return false;
        }

        if ($this->tier === 'premium') {
            return true;
        }

        return (bool) ($this->featured_until && $this->featured_until->isFuture());
    }

    public function hasActivePaidSubscription(): bool
    {
        return $this->tier !== 'free'
            && $this->tier !== null
            && $this->tier !== ''
            && (bool) ($this->subscription_expires_at && $this->subscription_expires_at->isFuture());
    }

    public function isSubscriptionActive(): bool
    {
        if ($this->tier === 'free' || $this->tier === null || $this->tier === '') {
            return true;
        }

        return $this->hasActivePaidSubscription();
    }

    public function effectiveTier(): string
    {
        if ($this->tier === 'free' || $this->tier === null || $this->tier === '') {
            return 'free';
        }

        return $this->isSubscriptionActive() ? $this->tier : 'free';
    }

    public function isSponsoredCategory(?int $categoryId = null): bool
    {
        if (! $this->hasActivePaidSubscription()) {
            return false;
        }

        if ($categoryId !== null && (int) $this->category_id !== $categoryId) {
            return false;
        }

        return (bool) ($this->sponsored_category_until && $this->sponsored_category_until->isFuture());
    }

    public function isSponsoredProvince(?int $provinceId = null): bool
    {
        if (! $this->hasActivePaidSubscription()) {
            return false;
        }

        if ($provinceId !== null && (int) $this->province_id !== $provinceId) {
            return false;
        }

        return (bool) ($this->sponsored_province_until && $this->sponsored_province_until->isFuture());
    }

    public function entitlements(): array
    {
        return [
            'effective_tier' => $this->effectiveTier(),
            'is_verified' => (bool) $this->is_verified,
            'is_featured' => $this->isFeatured(),
            'is_sponsored_category' => $this->isSponsoredCategory(),
            'is_sponsored_province' => $this->isSponsoredProvince(),
            'has_active_subscription' => $this->isSubscriptionActive(),
            'has_active_paid_subscription' => $this->hasActivePaidSubscription(),
            'is_on_trial' => $this->isOnTrial(),
            'has_used_trial' => $this->hasUsedTrial(),
            'subscription_expires_at' => $this->subscription_expires_at?->toIso8601String(),
            'featured_until' => $this->featured_until?->toIso8601String(),
            'sponsored_category_until' => $this->sponsored_category_until?->toIso8601String(),
            'sponsored_province_until' => $this->sponsored_province_until?->toIso8601String(),
            'trial_ends_at' => $this->trial_ends_at?->toIso8601String(),
            'plan_limits' => $this->planLimits(),
        ];
    }

    public function planLimits(): array
    {
        $defaults = $this->defaultPlanLimits();
        $plan = $this->activeSubscription?->plan;

        if (! $plan) {
            return $defaults;
        }

        return array_replace($defaults, $plan->entitlementMap(), $plan->limits ?? []);
    }

    public function planLimit(string $key, mixed $default = null): mixed
    {
        $limits = $this->planLimits();

        return array_key_exists($key, $limits) ? $limits[$key] : $default;
    }

    private function defaultPlanLimits(): array
    {
        return match ($this->effectiveTier()) {
            'premium' => [
                'max_photos' => 100,
                'max_services' => null,
                'max_team_members' => 20,
                'max_branches' => 10,
                'analytics_days' => 365,
                'lead_export' => true,
                'featured_placement' => true,
                'verified_badge' => true,
                'sponsored_placement' => true,
                'support_level' => 'dedicated',
            ],
            'pro' => [
                'max_photos' => 30,
                'max_services' => 50,
                'max_team_members' => 5,
                'max_branches' => 3,
                'analytics_days' => 90,
                'lead_export' => true,
                'featured_placement' => false,
                'verified_badge' => true,
                'sponsored_placement' => false,
                'support_level' => 'priority',
            ],
            default => [
                'max_photos' => 8,
                'max_services' => 5,
                'max_team_members' => 3,
                'max_branches' => 1,
                'analytics_days' => 30,
                'lead_export' => false,
                'featured_placement' => false,
                'verified_badge' => false,
                'sponsored_placement' => false,
                'support_level' => 'community',
            ],
        };
    }

    public function hasUsedTrial(): bool
    {
        return $this->trial_started_at !== null;
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at !== null
            && $this->trial_ends_at->isFuture()
            && $this->hasUsedTrial();
    }

    /**
     * Apply paid placement tiers to a public directory query.
     *
     * Context flags let category/province sponsorships boost only inside the
     * matching filtered listing. Sponsored placement always requires an active
     * paid subscription, regardless of the stored date values.
     */
    public function scopeOrderByPublicPriority(
        Builder $query,
        ?int $categoryId = null,
        ?int $provinceId = null
    ): Builder {
        $now = now();
        $categoryContext = $categoryId !== null ? 1 : 0;
        $provinceContext = $provinceId !== null ? 1 : 0;

        return $query->orderByRaw(
            "CASE
                WHEN ? = 1
                    AND sponsored_category_until IS NOT NULL
                    AND sponsored_category_until > ?
                    AND tier <> 'free'
                    AND subscription_expires_at IS NOT NULL
                    AND subscription_expires_at > ? THEN 3
                WHEN ? = 1
                    AND sponsored_province_until IS NOT NULL
                    AND sponsored_province_until > ?
                    AND tier <> 'free'
                    AND subscription_expires_at IS NOT NULL
                    AND subscription_expires_at > ? THEN 3
                WHEN tier = 'premium'
                    AND subscription_expires_at IS NOT NULL
                    AND subscription_expires_at > ? THEN 2
                WHEN featured_until IS NOT NULL
                    AND featured_until > ?
                    AND (
                        tier = 'free'
                        OR (subscription_expires_at IS NOT NULL AND subscription_expires_at > ?)
                    ) THEN 2
                WHEN is_verified = 1 THEN 1
                ELSE 0
            END DESC",
            [
                $categoryContext, $now, $now,
                $provinceContext, $now, $now,
                $now, $now, $now,
            ]
        )->orderByDesc('rating_avg')->orderByDesc('id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->whereIn('status', ['published', 'approved']);
    }

    public function isPublished(): bool
    {
        return in_array($this->status, ['published', 'approved'], true);
    }

    public function dailyStats(): HasMany
    {
        return $this->hasMany(BusinessDailyStat::class, 'business_id');
    }

    public function destinationLinks(): HasMany
    {
        return $this->hasMany(BusinessDestinationLink::class, 'business_id')->orderBy('distance_km', 'asc');
    }

    public function nearbyDestinations(): BelongsToMany
    {
        return $this->belongsToMany(Destination::class, 'biz_destination_links', 'business_id', 'destination_id')
            ->withPivot('distance_km')
            ->orderBy('pivot_distance_km', 'asc');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // Business Logic Methods

    /**
     * Determine whether the business is currently open in Asia/Phnom_Penh.
     */
    public function isOpenNow(?\DateTimeInterface $customTime = null): bool
    {
        $tz = new DateTimeZone('Asia/Phnom_Penh');
        if ($customTime instanceof \DateTimeInterface) {
            $now = Carbon::instance($customTime)->setTimezone('Asia/Phnom_Penh');
        } else {
            $now = Carbon::now($tz);
        }

        $todayDate = $now->format('Y-m-d');

        // 1. Check temporary closures
        if ($this->relationLoaded('closures')) {
            $isClosedToday = $this->closures->contains(function ($c) use ($todayDate) {
                $from = $c->from_date instanceof \DateTimeInterface ? $c->from_date->format('Y-m-d') : (string) $c->from_date;
                $to = $c->to_date instanceof \DateTimeInterface ? $c->to_date->format('Y-m-d') : (string) $c->to_date;

                return $from && $to && $from <= $todayDate && $to >= $todayDate;
            });
        } else {
            $isClosedToday = $this->closures()
                ->whereDate('from_date', '<=', $todayDate)
                ->whereDate('to_date', '>=', $todayDate)
                ->exists();
        }

        if ($isClosedToday) {
            return false;
        }

        $weekday = (int) $now->format('w'); // 0 (Sun) to 6 (Sat)
        $currentTime = $now->format('H:i:s');
        $yesterdayWeekday = ($weekday + 6) % 7;

        // 2. Check yesterday's shifts that crossed midnight
        if ($this->relationLoaded('hours')) {
            $yesterdayHours = $this->hours->filter(function ($h) use ($yesterdayWeekday) {
                return (int) $h->weekday === $yesterdayWeekday && ! $h->is_closed;
            });
        } else {
            $yesterdayHours = $this->hours()
                ->where('weekday', $yesterdayWeekday)
                ->where('is_closed', false)
                ->get();
        }

        foreach ($yesterdayHours as $hour) {
            if ($hour->opens_at && $hour->closes_at && $hour->opens_at > $hour->closes_at) {
                // E.g. opens at 20:00 and closes at 02:00 next day
                if ($currentTime <= $hour->closes_at) {
                    return true;
                }
            }
        }

        // 3. Check today's shifts
        if ($this->relationLoaded('hours')) {
            $todayHours = $this->hours->filter(function ($h) use ($weekday) {
                return (int) $h->weekday === $weekday && ! $h->is_closed;
            });
        } else {
            $todayHours = $this->hours()
                ->where('weekday', $weekday)
                ->where('is_closed', false)
                ->get();
        }

        foreach ($todayHours as $hour) {
            if (! $hour->opens_at || ! $hour->closes_at) {
                continue;
            }

            if ($hour->opens_at <= $hour->closes_at) {
                // Normal same-day shift, e.g. 08:00 to 17:00
                if ($currentTime >= $hour->opens_at && $currentTime <= $hour->closes_at) {
                    return true;
                }
            } else {
                // Shift crossing midnight into tomorrow, e.g. 18:00 to 02:00
                if ($currentTime >= $hour->opens_at) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check what requirements are still missing before a business can be approved.
     * Section 6 Rule 2:
     * "Moving to approved requires: Khmer name, category, province, lat/lng, address, at least one contact, at least one image."
     */
    public function getPublishingMissingRequirements(): array
    {
        $missing = [];

        if (empty(trim($this->name_km ?? ''))) {
            $missing['name_km'] = 'Khmer name is required.';
        }

        if (empty($this->category_id)) {
            $missing['category'] = 'Category is required.';
        }

        if (empty($this->province_id)) {
            $missing['province'] = 'Province is required.';
        }

        if (is_null($this->lat) || is_null($this->lng)) {
            $missing['coordinates'] = 'Latitude and longitude coordinates are required.';
        }

        if (empty(trim($this->address_km ?? '')) && empty(trim($this->address_en ?? ''))) {
            $missing['address'] = 'Address in Khmer or English is required.';
        }

        if (! $this->contacts()->exists()) {
            $missing['contacts'] = 'At least one contact method is required.';
        }

        if (! $this->media()->exists()) {
            $missing['media'] = 'At least one photo is required.';
        }

        return $missing;
    }

    /**
     * Limit the query to businesses that cannot yet be approved.
     */
    public function scopeMissingPublishingInfo(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->where(function (Builder $name) {
                $name->whereNull('name_km')->orWhereRaw("TRIM(name_km) = ''");
            })
                ->orWhereNull('category_id')
                ->orWhereNull('province_id')
                ->orWhere(function (Builder $coords) {
                    $coords->whereNull('lat')->orWhereNull('lng');
                })
                ->orWhere(function (Builder $address) {
                    $address->where(function (Builder $km) {
                        $km->whereNull('address_km')->orWhereRaw("TRIM(address_km) = ''");
                    })->where(function (Builder $en) {
                        $en->whereNull('address_en')->orWhereRaw("TRIM(address_en) = ''");
                    });
                })
                ->orWhereDoesntHave('contacts')
                ->orWhereDoesntHave('media');
        });
    }

    /**
     * Can this business transition to approved?
     */
    public function canBeApproved(): bool
    {
        return empty($this->getPublishingMissingRequirements());
    }

    /**
     * Recalculate rating average and count from approved reviews.
     */
    public function recalculateRatings(): void
    {
        $stats = $this->reviews()
            ->where('status', 'approved')
            ->reorder()
            ->selectRaw('COUNT(*) as total, AVG(rating) as avg_rating')
            ->first();

        $this->rating_count = (int) ($stats->total ?? 0);
        $this->rating_avg = round((float) ($stats->avg_rating ?? 0.0), 2);
        $this->saveQuietly();
    }

    /**
     * Recalculate proximity links to tourist destinations using Haversine formula.
     */
    public function recalculateDestinationLinks(): void
    {
        if (is_null($this->lat) || is_null($this->lng)) {
            $this->destinationLinks()->delete();

            return;
        }

        $destinations = Destination::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get(['id', 'latitude', 'longitude']);

        $links = [];
        foreach ($destinations as $dest) {
            $dist = $this->haversineDistance($this->lat, $this->lng, (float) $dest->latitude, (float) $dest->longitude);
            // Link if within 50 km or include closest destinations
            $links[] = [
                'business_id' => $this->id,
                'destination_id' => $dest->id,
                'distance_km' => round($dist, 2),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Sort by distance and take top 10 closest
        usort($links, fn ($a, $b) => $a['distance_km'] <=> $b['distance_km']);
        $closest = array_slice($links, 0, 10);

        $this->destinationLinks()->delete();
        if (! empty($closest)) {
            BusinessDestinationLink::insert($closest);
        }
    }

    /**
     * Haversine formula for distance in kilometers.
     */
    private function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
