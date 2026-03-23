<?php

namespace App\Models;

use App\Models\Traits\BelongsToStore;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use BelongsToStore;

    protected $fillable = [
        'store_id',
        'code',
        'name',
        'type',
        'value',
        'min_purchase',
        'max_uses',
        'used_count',
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

    public function products()
    {
        return $this->belongsToMany(Product::class, 'coupon_product');
    }

    /**
     * Check apakah kupon masih valid untuk dipakai.
     */
    public function isValid(float $cartTotal): bool
    {
        if (!$this->is_active) return false;
        if ($this->starts_at && now()->lt($this->starts_at)) return false;
        if ($this->expires_at && now()->gt($this->expires_at)) return false;
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) return false;
        if ($cartTotal < $this->min_purchase) return false;
        return true;
    }

    /**
     * Hitung nilai diskon dari total belanja atau produk terpilih.
     */
    public function calculateDiscount(float $total, array $items = []): float
    {
        $hasTargetProducts = $this->products()->exists();
        
        if ($hasTargetProducts && !empty($items)) {
            $targetIds = $this->products()->pluck('products.id')->toArray();
            $applicableTotal = 0;
            
            foreach ($items as $item) {
                if (in_array($item['product_id'], $targetIds)) {
                    $applicableTotal += $item['price'] * $item['quantity'];
                }
            }
            
            if ($this->type === 'percentage') {
                return round($applicableTotal * ($this->value / 100), 2);
            }
            return min($this->value, $applicableTotal);
        }

        // Default: applies to whole cart
        if ($this->type === 'percentage') {
            return round($total * ($this->value / 100), 2);
        }
        return min($this->value, $total);
    }
}
