<?php

namespace App\Models;

use App\Models\Traits\BelongsToStore;
use Illuminate\Database\Eloquent\Model;

class ShiftRequest extends Model
{
    use BelongsToStore;

    protected $fillable = [
        'store_id',
        'user_id',
        'shift_id',
        'type',
        'target_user_id',
        'reason',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
