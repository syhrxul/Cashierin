<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Trait BelongsToStore
 * 
 * Auto-scope semua query berdasarkan store_id user yang sedang login.
 * Ini adalah layer keamanan di level MODEL — bahkan jika controller 
 * lupa filter, data tetap aman.
 * 
 * Superadmin di-bypass (bisa akses semua toko).
 */
trait BelongsToStore
{
    /**
     * Boot the trait — tambahkan global scope.
     */
    protected static function bootBelongsToStore(): void
    {
        static::addGlobalScope('store', function (Builder $builder) {
            $user = auth()->user();

            if (!$user) {
                return;
            }

            // Superadmin bisa akses semua
            if ($user->role === 'superadmin') {
                return;
            }

            // User biasa hanya bisa akses data toko mereka
            if ($user->store_id) {
                $storeIdColumn = (new static)->getStoreIdColumn();
                $builder->where($storeIdColumn, $user->store_id);
            }
        });

        // Saat creating, otomatis set store_id jika belum diisi
        static::creating(function ($model) {
            $user = auth()->user();
            $storeIdColumn = $model->getStoreIdColumn();

            if ($user && $user->store_id && empty($model->{$storeIdColumn})) {
                $model->{$storeIdColumn} = $user->store_id;
            }
        });
    }

    /**
     * Nama kolom store_id pada model ini.
     * Override di model jika berbeda.
     */
    public function getStoreIdColumn(): string
    {
        return 'store_id';
    }

    /**
     * Scope tanpa filter store (untuk superadmin atau internal use).
     */
    public function scopeWithoutStoreScope(Builder $builder): Builder
    {
        return $builder->withoutGlobalScope('store');
    }
}
