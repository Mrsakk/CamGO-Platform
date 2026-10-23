<?php

namespace App\Modules\Business\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'biz_payments';

    public const METHODS = ['cash', 'bank_transfer', 'aba', 'wing', 'khqr', 'other'];

    protected $fillable = [
        'subscription_id',
        'invoice_id',
        'amount_usd',
        'amount_cents',
        'currency',
        'method',
        'reference_no',
        'receipt_no',
        'status',
        'paid_at',
        'verified_by',
        'recorded_by',
        'notes',
        'voided_at',
        'void_reason',
    ];

    protected function casts(): array
    {
        return [
            'amount_usd' => 'float',
            'amount_cents' => 'integer',
            'paid_at' => 'datetime',
            'voided_at' => 'datetime',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'subscription_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }
}
