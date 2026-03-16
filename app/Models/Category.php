<?php

namespace App\Models;

use App\Models\Traits\BelongsToStore;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use BelongsToStore;

    protected $fillable = [
        'store_id',
        'name',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
