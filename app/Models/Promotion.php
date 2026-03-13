<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = [
        'store_id',
        'name',
        'description',
        'type',
        'discount_type',
        'discount_value',
        'min_purchase',
        'free_product_id',
        'free_product_qty',
        'is_active',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function items()
    {
        return $this->hasMany(PromotionItem::class);
    }

    public function freeProduct()
    {
        return $this->belongsTo(Product::class, 'free_product_id');
    }

    /**
     * Cek apakah promosi aktif saat ini.
     */
    public function isActive(): bool
    {
        if (!$this->is_active) return false;
        if ($this->starts_at && now()->lt($this->starts_at)) return false;
        if ($this->expires_at && now()->gt($this->expires_at)) return false;
        return true;
    }
}
