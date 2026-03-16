<?php

namespace App\Models;

use App\Models\Traits\BelongsToStore;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use BelongsToStore;

    protected $fillable = [
        'store_id',
        'user_id',
        'shift_id',
        'receipt_number',
        'subtotal',
        'discount_amount',
        'total_amount',
        'payment_method',
        'status',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }
}
