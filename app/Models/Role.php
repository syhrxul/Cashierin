<?php

namespace App\Models;

use App\Models\Traits\BelongsToStore;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory, BelongsToStore;

    protected $fillable = [
        'store_id',
        'name',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    /**
     * Relationship: A role has many users.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Helper to check if role has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions[$permission] ?? false;
    }
}
