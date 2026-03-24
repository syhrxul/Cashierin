<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'content',
        'scope',
        'store_id',
        'target_user_ids',
        'target_role',
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

    public function reads()
    {
        return $this->hasMany(\App\Models\AnnouncementRead::class);
    }
}
