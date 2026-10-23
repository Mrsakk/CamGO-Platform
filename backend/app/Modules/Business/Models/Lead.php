<?php

namespace App\Modules\Business\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;

    public const STATUSES = ['new', 'contacted', 'closed', 'spam'];

    public const LEGACY_STATUSES = ['qualified', 'won', 'lost'];

    protected $table = 'biz_leads';

    protected $fillable = [
        'business_id',
        'session_hash',
        'status',
        'primary_channel',
        'source',
        'locale',
        'contact_count',
        'first_contact_at',
        'last_contact_at',
        'assigned_to',
        'note',
        'name',
        'phone',
        'email',
        'message',
        'preferred_date',
        'party_size',
        'ip_hash',
        'user_agent',
        'user_id',
        'handled_by',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'contact_count' => 'integer',
            'party_size' => 'integer',
            'first_contact_at' => 'datetime',
            'last_contact_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(LeadNote::class, 'lead_id')->latest();
    }

    public function scopeForBusiness($query, int $businessId)
    {
        return $query->where('business_id', $businessId);
    }

    public function scopeWithStatus($query, ?string $status)
    {
        return $status ? $query->where('status', $status) : $query;
    }
}
