<?php

namespace App\Models;

use App\Models\Traits\BelongsToStore;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use BelongsToStore;

    protected $fillable = [
        'store_id',
        'user_id',
        'starting_cash',
        'ending_cash',
        'expected_cash',
        'started_at',
        'ended_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
