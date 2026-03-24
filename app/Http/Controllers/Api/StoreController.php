<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;

use App\Models\ActivityLog;

class StoreController extends Controller
{
    /**
     * Lihat toko sendiri (user hanya bisa lihat toko mereka).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Superadmin bisa lihat semua toko dengan indikasi detail lengkap
        if ($user->role === 'superadmin') {
            $query = Store::with('owner')->withCount([
                'shifts as active_shifts_count' => function($query) {
                    $query->where('status', 'open')->whereNull('ended_at');
                },
                'products',
                'users',
                'transactions'
            ]);
            
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }
            return response()->json(['data' => $query->get()]);
        }

        // User biasa hanya bisa lihat toko mereka
        $store = Store::with('owner')->where('id', $user->store_id)->get();
        return response()->json(['data' => $store]);
    }

    /**
     * Buat toko baru — hanya superadmin (di route superadmin).
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['superadmin', 'owner'])) {
            return response()->json([
                'message' => 'Hanya superadmin atau owner yang dapat membuat toko baru.'
            ], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'business_hours' => 'nullable|string|max:255',
            'business_category' => 'nullable|string|max:255',
        ]);

        $store = Store::create($request->only([
            'user_id', 'name', 'address', 'business_hours', 'business_category'
        ]));

        // === AUTO ASSIGN TRIAL LICENSE (30 DAYS) ===
        $trialDays = 30;
        $licenseKey = \App\Models\LicenseKey::create([
            'key' => 'TRIAL-' . strtoupper(\Illuminate\Support\Str::random(12)),
            'type' => 'trial',
            'duration_days' => $trialDays,
            'is_used' => true,
            'used_by' => $request->user_id,
            'used_at' => now(),
            'expires_at' => now()->addDays($trialDays),
            'store_id' => $store->id,
        ]);

        // Update Store Status
        $store->update([
            'status' => 'active',
            'license_type' => 'trial',
            'license_expires_at' => $licenseKey->expires_at,
        ]);

        // Auto-assign store_id ke owner jika belum punya
        $owner = \App\Models\User::find($request->user_id);
        if ($owner && !$owner->store_id) {
            $owner->update(['store_id' => $store->id]);
        }

        ActivityLog::log('store_created', "Toko baru '{$store->name}' berhasil dibuat dengan lisensi Trial {$trialDays} hari.", [
            'store_id' => $store->id,
            'owner_id' => $owner->id,
            'license_key' => $licenseKey->key
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Toko berhasil dibuat dengan lisensi Trial 30 hari.',
            'data' => $store->load('owner')
        ], 201);
    }

    /**
     * Lihat detail toko (hanya toko sendiri).
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $store = Store::findOrFail($id);

        // Non-superadmin hanya bisa lihat toko sendiri
        if ($user->role !== 'superadmin' && (int) $store->id !== (int) $user->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke toko ini.'], 403);
        }

        return response()->json(['data' => $store]);
    }

    /**
     * Update toko — hanya owner dan manager.
     */
    public function update(Request $request, string $id)
    {
        $store = Store::findOrFail($id);
        $user = $request->user();

        // Non-superadmin hanya bisa edit toko sendiri
        if ($user->role !== 'superadmin') {
            if (!$user->store_id || (int) $store->id !== (int) $user->store_id) {
                return response()->json(['message' => 'Anda tidak memiliki akses ke toko ini.'], 403);
            }
            if (!in_array($user->role, ['owner', 'manager'])) {
                return response()->json([
                    'message' => 'Hanya owner atau manager yang dapat mengubah data toko.'
                ], 403);
            }
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'nullable|string|max:500',
            'business_hours' => 'nullable|string|max:255',
            'business_category' => 'nullable|string|max:255',
        ]);

        $data = $request->only(['name', 'address', 'business_hours', 'business_category']);
        if ($user->role === 'superadmin' && $request->has('user_id')) {
            $data['user_id'] = $request->user_id;
        }

        $store->update($data);

        return response()->json([
            'message' => 'Toko berhasil diperbarui.',
            'data' => $store
        ]);
    }

    /**
     * Hapus toko — hanya superadmin.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();

        if ($user->role !== 'superadmin') {
            return response()->json([
                'message' => 'Hanya superadmin yang dapat menghapus toko.'
            ], 403);
        }

        $store = Store::findOrFail($id);
        $store->delete();

        return response()->json(['message' => 'Toko berhasil dihapus.']);
    }

    /**
     * Lihat invite code toko — hanya owner/manager.
     */
    public function inviteCode(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json([
                'message' => 'Hanya owner atau manager yang dapat melihat kode undangan.'
            ], 403);
        }

        $store = Store::findOrFail($user->store_id);

        return response()->json([
            'invite_code' => $store->invite_code,
            'invite_url' => url('/api/register/invite'), // Frontend akan pakai ini
            'store_name' => $store->name,
        ]);
    }

    /**
     * Regenerate invite code — hanya owner.
     */
    public function regenerateInviteCode(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['superadmin', 'owner'])) {
            return response()->json([
                'message' => 'Hanya owner yang dapat me-reset kode undangan.'
            ], 403);
        }

        $store = Store::findOrFail($user->store_id);
        $newCode = $store->regenerateInviteCode();

        return response()->json([
            'message' => 'Kode undangan berhasil di-reset.',
            'invite_code' => $newCode,
        ]);
    }

    /**
     * Bekukan atau cairkan toko — hanya superadmin.
     */
    public function toggleFreeze(Request $request, string $id)
    {
        $user = $request->user();

        if ($user->role !== 'superadmin') {
            return response()->json([
                'message' => 'Hanya superadmin yang dapat membekukan toko.'
            ], 403);
        }

        $store = Store::findOrFail($id);
        
        // Toggle Manual Freeze
        $store->is_manual_frozen = !$store->is_manual_frozen;
        
        // Update status for consistency
        // If manually frozen, status is 'frozen'. Otherwise, let the license status determine it.
        $store->status = $store->is_manual_frozen ? 'frozen' : $store->checkAndUpdateLicenseStatus();
        
        $store->save();

        $message = $store->is_manual_frozen ? 'Toko berhasil dibekukan secara manual.' : 'Pembekuan toko berhasil dibatalkan.';

        ActivityLog::log('store_status_toggled', "Status toko '{$store->name}' diubah menjadi {$store->status} oleh @{$user->username}", [
            'store_id' => $store->id,
            'new_status' => $store->status
        ]);

        return response()->json([
            'message' => $message,
            'data' => $store
        ]);
    }

    /**
     * Lihat informasi detail toko untuk dashboard owner (termasuk sisa lisensi).
     */
    public function ownerStoreInfo(Request $request)
    {
        $user = $request->user();
        if (!$user->store_id) {
            return response()->json(['message' => 'Toko belum didaftarkan.'], 404);
        }

        $store = Store::findOrFail($user->store_id);
        
        // Pastikan status lisensi terupdate
        $store->checkAndUpdateLicenseStatus();

        return response()->json([
            'data' => [
                'id' => $store->id,
                'name' => $store->name,
                'status' => $store->status,
                'license_type' => $store->license_type,
                'license_expires_at' => $store->license_expires_at,
                'grace_period_ends_at' => $store->grace_period_ends_at,
                'license_days_remaining' => $store->licenseDaysRemaining(),
                'grace_period_days_remaining' => $store->gracePeriodDaysRemaining(),
                'address' => $store->address,
                'business_hours' => $store->business_hours,
                'business_category' => $store->business_category,
                'is_manual_frozen' => $store->is_manual_frozen,
                'shift_limit_hours' => $store->shift_limit_hours ?? 8,
            ]
        ]);
    }

    /**
     * Lihat statistik ringkas penggunaan toko (untuk owner).
     */
    public function ownerStoreStats(Request $request)
    {
        $user = $request->user();
        $store = Store::findOrFail($user->store_id);

        return response()->json([
            'data' => [
                'total_products' => $store->products()->count(),
                'total_employees' => $store->users()->where('role', '!=', 'owner')->count(),
                'total_transactions' => $store->transactions()->count(),
            ]
        ]);
    }

    /**
     * Update data toko (khusus owner/manager toko ini).
     */
    public function updateStore(Request $request)
    {
        $user = $request->user();
        $store = Store::findOrFail($user->store_id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'nullable|string|max:500',
            'business_hours' => 'nullable|string|max:255',
            'business_category' => 'nullable|string|max:255',
            'shift_limit_hours' => 'nullable|integer|min:1|max:24',
        ]);

        $store->update($request->only(['name', 'address', 'business_hours', 'business_category', 'shift_limit_hours']));

        return response()->json([
            'message' => 'Informasi toko berhasil diperbarui.',
            'data' => $store
        ]);
    }

    
    public function ownerDashboard(Request $request)
    {
        $user = $request->user();
        if (!$user->store_id) {
            return response()->json(['message' => 'Toko belum didaftarkan.'], 404);
        }

        $store = Store::find($user->store_id);

        if (!$store) {
            // Jika toko sudah dihapus secara fisik, bersihkan store_id user agar bisa setup ulang
            // Karena ini di Mac, pastikan model User benar-benar di-update
            $user->update(['store_id' => null]);
            return response()->json(['message' => 'Toko tidak ditemukan atau sudah dihapus. Silakan setup toko baru.'], 404);
        }

        return response()->json([
            'data' => [
                'today_revenue' => (int) $store->transactions()->whereDate('created_at', now())->sum('total_amount'),
                'total_inventory' => $store->products()->count(),
                'active_employees' => $store->users()->where('role', '!=', 'owner')->count(),
                // 'pending_orders' => 0, // Placeholder jika butuh
                'popular_products' => $store->products()->withCount('transactionItems')->orderBy('transaction_items_count', 'desc')->take(5)->get(),
            ]
        ]);
    }

    /**
     * Gabung ke toko menggunakan invite code.
     */
    public function joinByInvite(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'invite_code' => 'required|string|max:24',
        ]);

        $store = Store::where('invite_code', $request->invite_code)->first();

        if (!$store) {
            return response()->json([
                'message' => 'Kode undangan tidak valid atau toko tidak ditemukan.'
            ], 404);
        }

        if ($user->store_id) {
            return response()->json([
                'message' => 'Anda sudah terdaftar pada sebuah toko. Hubungi admin untuk pindah toko.'
            ], 400);
        }

        // Update User
        $user->update(['store_id' => $store->id]);

        ActivityLog::log('user_joined_store', "Pengguna @{$user->username} bergabung ke toko '{$store->name}' via invite code.", [
            'user_id' => $user->id,
            'store_id' => $store->id
        ]);

        return response()->json([
            'message' => "Berhasil bergabung ke toko '{$store->name}'.",
            'data' => [
                'store_id' => $store->id,
                'store_name' => $store->name
            ]
        ]);
    }
}
