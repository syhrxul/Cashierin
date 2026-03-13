<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $fillable = [
        'store_id',
        'user_id',
        'starting_cash',
        'ending_cash',
        'expected_cash',
        'started_at',
        'ended_at',
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
}
