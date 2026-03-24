<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\BelongsToStore;

class Announcement extends Model
{
    use BelongsToStore;

    protected $fillable = [
        'title',
        'content',
        'scope',
        'store_id',
        'target_user_ids',
        'created_by',
        'is_active',
        'priority'
    ];

    protected $casts = [
        'target_user_ids' => 'array',
        'is_active' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
