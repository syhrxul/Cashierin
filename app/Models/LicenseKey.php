<?php

namespace App\Models;

use App\Models\Traits\BelongsToStore;
use Illuminate\Database\Eloquent\Model;

class LicenseKey extends Model
{
    use BelongsToStore;
    protected $fillable = [
        'key',
        'type',
        'duration_days',
        'is_used',
        'used_by',
        'used_at',
        'expires_at',
        'store_id',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Cek apakah license key sudah expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && now()->gt($this->expires_at);
    }

    /**
     * Cek apakah license key masih aktif.
     */
    public function isActiveAndValid(): bool
    {
        return $this->is_used && !$this->isExpired();
    }
}
