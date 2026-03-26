<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Store extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'address',
        'business_hours',
        'business_category',
        'invite_code',
        'status',
        'is_manual_frozen',
        'license_type',
        'license_expires_at',
        'grace_period_ends_at',
        'shift_limit_hours',
        'default_role_id',
    ];

    /**
     * Relationship: A store has a default role for new invites.
     */
    public function defaultRole()
    {
        return $this->belongsTo(Role::class, 'default_role_id');
    }

    protected $casts = [
        'is_manual_frozen' => 'boolean',
        'license_expires_at' => 'datetime',
        'grace_period_ends_at' => 'datetime',
        'shift_limit_hours' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($store) {
            if (empty($store->invite_code)) {
                $store->invite_code = strtoupper(Str::random(12));
            }
        });
    }

    // ========================================
    // LICENSE STATUS HELPERS
    // ========================================

    /**
     * Cek apakah toko aktif (bisa digunakan).
     */
    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'grace_period']) && !$this->is_manual_frozen;
    }

    /**
     * Cek apakah toko dalam masa tenggang.
     */
    public function isInGracePeriod(): bool
    {
        return $this->status === 'grace_period' && !$this->is_manual_frozen;
    }

    /**
     * Cek apakah toko dibekukan.
     */
    public function isFrozen(): bool
    {
        return $this->status === 'frozen' || $this->is_manual_frozen;
    }

    /**
     * Cek & update status lisensi toko.
     * Dipanggil setiap kali user mengakses API.
     */
    public function checkAndUpdateLicenseStatus(): string
    {
        // PRIORITAS: Manual Freeze (Admin Action)
        if ($this->is_manual_frozen) {
            if ($this->status !== 'frozen') {
                $this->update(['status' => 'frozen']);
            }
            return 'frozen';
        }

        // Toko tanpa lisensi = inactive
        if ($this->license_type === 'none') {
            if ($this->status !== 'inactive') {
                $this->update(['status' => 'inactive']);
            }
            return 'inactive';
        }

        // Lisensi belum expired
        if ($this->license_expires_at && now()->lt($this->license_expires_at)) {
            if ($this->status !== 'active') {
                $this->update(['status' => 'active', 'grace_period_ends_at' => null]);
            }
            return 'active';
        }

        // === LISENSI SUDAH EXPIRED ===

        if ($this->license_type === 'trial') {
            // Trial expired → langsung frozen, tidak ada grace period
            if ($this->status !== 'frozen') {
                $this->update(['status' => 'frozen', 'grace_period_ends_at' => null]);
            }
            return 'frozen';
        }

        // Full license expired → 7 hari grace period
        if ($this->license_type === 'full') {
            // Set grace period jika belum di-set
            if (!$this->grace_period_ends_at) {
                $gracePeriodEnd = $this->license_expires_at->addDays(7);
                $this->update([
                    'status' => 'grace_period',
                    'grace_period_ends_at' => $gracePeriodEnd,
                ]);
                return 'grace_period';
            }

            // Masih dalam grace period
            if (now()->lt($this->grace_period_ends_at)) {
                if ($this->status !== 'grace_period') {
                    $this->update(['status' => 'grace_period']);
                }
                return 'grace_period';
            }

            // Grace period habis → frozen
            if ($this->status !== 'frozen') {
                $this->update(['status' => 'frozen']);
            }
            return 'frozen';
        }

        return $this->status;
    }

    /**
     * Aktivasi lisensi untuk toko ini.
     */
    public function activateLicense(LicenseKey $licenseKey): void
    {
        $this->update([
            'status' => 'active',
            'is_manual_frozen' => false,
            'license_type' => $licenseKey->type,
            'license_expires_at' => $licenseKey->expires_at,
            'grace_period_ends_at' => null,
        ]);
    }

    /**
     * Hitung sisa hari lisensi.
     */
    public function licenseDaysRemaining(): int
    {
        if (!$this->license_expires_at) return 0;
        return max(0, (int) now()->diffInDays($this->license_expires_at, false));
    }

    /**
     * Hitung sisa hari grace period.
     */
    public function gracePeriodDaysRemaining(): int
    {
        if (!$this->grace_period_ends_at) return 0;
        return max(0, (int) now()->diffInDays($this->grace_period_ends_at, false));
    }

    // ========================================
    // USAGE CONSTRAINTS (TRIAL LIMITS)
    // ========================================

    /**
     * Cek apakah toko bisa menambah produk baru (Max 10 untuk Trial).
     */
    public function canAddProduct(): bool
    {
        if ($this->license_type === 'full') return true;
        
        // Trial atau None dibatasi 10 produk
        return $this->products()->count() < 10;
    }

    /**
     * Cek apakah toko bisa menambah karyawan baru (Max 2 untuk Trial).
     * Owner tidak dihitung (asumsi owner adalah user_id di stores).
     */
    public function canAddUser(): bool
    {
        if ($this->license_type === 'full') return true;
        
        // Count users with this store_id excluding the owner
        $employeeCount = $this->users()->where('role', '!=', 'owner')->count();
        return $employeeCount < 2;
    }

    public function regenerateInviteCode(): string
    {
        $this->invite_code = strtoupper(Str::random(12));
        $this->save();
        return $this->invite_code;
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function shiftTimeDefinitions()
    {
        return $this->hasMany(ShiftTimeDefinition::class);
    }

    public function licenseKeys()
    {
        return $this->hasMany(LicenseKey::class);
    }
}
