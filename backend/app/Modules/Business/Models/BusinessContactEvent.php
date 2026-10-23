<?php

namespace App\Modules\Business\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessContactEvent extends Model
{
    use HasFactory;

    protected $table = 'biz_contact_events';

    protected $fillable = [
        'business_id',
        'channel', // phone, telegram, whatsapp, messenger, email, website, directions, profile_view
        'occurred_at',
        'locale',
        'session_hash',
        'source', // list, profile, nearby
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id');
    }
}
