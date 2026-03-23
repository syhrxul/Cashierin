<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftTimeDefinition extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'name',
        'start_time',
        'end_time',
        'requirements',
    ];

    protected $casts = [
        'requirements' => 'array',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
