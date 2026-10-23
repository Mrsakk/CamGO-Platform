<?php

namespace App\Modules\Business\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessReview extends Model
{
    use HasFactory;

    protected $table = 'biz_reviews';

    protected $fillable = [
        'business_id',
        'user_id',
        'display_name',
        'title',
        'rating',
        'comment',
        'locale',
        'email_hash',
        'ip_hash',
        'status', // pending, approved, rejected
        'moderated_by',
        'moderated_at',
        'rejection_reason',
        'owner_reply',
        'owner_replied_at',
        'owner_replied_by',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'moderated_at' => 'datetime',
            'owner_replied_at' => 'datetime',
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

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    public function ownerReplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_replied_by');
    }
}
