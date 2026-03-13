<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
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
