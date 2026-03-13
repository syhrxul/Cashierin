<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromotionItem extends Model
{
    protected $fillable = [
        'promotion_id',
        'product_id',
        'quantity',
    ];

    public function promotion()
    {
        return $this->belongsTo(Promotion::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
