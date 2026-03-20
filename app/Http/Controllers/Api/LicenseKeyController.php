<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LicenseKey;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LicenseKeyController extends Controller
{
    /**
     * Display a listing of license keys.
     */
    public function index(Request $request)
    {
        $query = LicenseKey::with(['user', 'store']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_used')) {
            $query->where('is_used', filter_var($request->is_used, FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json([
            'data' => $query->get()
        ]);
    }

    /**
     * Generate license key baru (hanya superadmin).
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:trial,full',
            'duration_days' => 'required|integer|min:1',
            'count' => 'nullable|integer|min:1|max:100',
        ]);

        $count = $request->input('count', 1);
        $keys = [];

        for ($i = 0; $i < $count; $i++) {
            $keys[] = LicenseKey::create([
                'key' => strtoupper(Str::random(16)),
                'type' => $request->type,
                'duration_days' => $request->duration_days,
            ]);
        }

        return response()->json([
            'message' => "$count License key(s) generated successfully",
            'data' => $count === 1 ? $keys[0] : $keys
        ], 201);
    }

    /**
     * Display the specified license key.
     */
    public function show(string $id)
    {
        $key = LicenseKey::findOrFail($id);
        return response()->json(['data' => $key]);
    }

    /**
     * Update license key.
     */
    public function update(Request $request, string $id)
    {
        $key = LicenseKey::findOrFail($id);

        $request->validate([
            'type' => 'sometimes|in:trial,full',
            'duration_days' => 'sometimes|integer|min:1',
        ]);

        $key->update($request->only(['type', 'duration_days']));

        return response()->json([
            'message' => 'License key updated successfully',
            'data' => $key
        ]);
    }

    /**
     * Delete license key.
     */
    public function destroy(string $id)
    {
        LicenseKey::findOrFail($id)->delete();
        return response()->json(['message' => 'License key deleted successfully']);
    }

    /**
     * Aktivasi license key untuk toko user.
     * 
     * Logika:
     * - User harus punya store_id (owner dengan toko)
     * - License key di-link ke toko
     * - Toko otomatis jadi active
     * - Jika toko sudah punya lisensi aktif, perpanjang dari tanggal expired yang lama
     * - Trial hanya bisa dipakai sekali per toko
     */
    public function activate(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
        ]);

        $user = $request->user();

        // User harus punya toko
        if (!$user->store_id) {
            return response()->json([
                'message' => 'Anda belum memiliki toko. Hubungi admin untuk dibuatkan toko.'
            ], 403);
        }

        $store = Store::findOrFail($user->store_id);

        // Hanya owner yang bisa aktivasi license
        if (!in_array($user->role, ['superadmin', 'owner'])) {
            return response()->json([
                'message' => 'Hanya owner toko yang dapat mengaktivasi license key.'
            ], 403);
        }
        $inputKey = strtoupper(trim($request->input('key')));
        \Log::info('License Activation Attempt', [
            'store_id' => $user->store_id,
            'received_key' => $request->all(),
            'parsed_key' => $inputKey
        ]);
        // Menggunakan query mentah untuk menghindari konflik kata kunci 'key' dan masalah collation
        $licenseKey = LicenseKey::whereRaw("BINARY `key` = ?", [$inputKey])->first();

        if (!$licenseKey) {
            return response()->json([
                'message' => 'License key tidak valid.'
            ], 404);
        }

        if ($licenseKey->is_used) {
            return response()->json([
                'message' => 'License key sudah digunakan.'
            ], 400);
        }

        // Cek: trial hanya bisa dipakai sekali per toko
        if ($licenseKey->type === 'trial') {
            $existingTrial = LicenseKey::where('store_id', $store->id)
                ->where('type', 'trial')
                ->where('is_used', true)
                ->exists();

            if ($existingTrial) {
                return response()->json([
                    'message' => 'Toko ini sudah pernah menggunakan trial. Silakan gunakan license key full.'
                ], 400);
            }
        }

        // Hitung tanggal expired
        // Jika toko sudah punya lisensi aktif, perpanjang dari tanggal expired lama
        $startsFrom = now();
        if ($store->license_expires_at && now()->lt($store->license_expires_at)) {
            $startsFrom = $store->license_expires_at;
        }
        $expiresAt = $startsFrom->copy()->addDays($licenseKey->duration_days);

        // Update license key
        $licenseKey->update([
            'is_used' => true,
            'used_by' => $user->id,
            'used_at' => now(),
            'expires_at' => $expiresAt,
            'store_id' => $store->id,
        ]);

        // Aktivasi toko
        $store->activateLicense($licenseKey);

        // Update expires_at toko ke yang baru dihitung
        $store->update(['license_expires_at' => $expiresAt]);

        return response()->json([
            'message' => 'License key berhasil diaktivasi. Toko Anda sekarang aktif!',
            'data' => [
                'license_key' => $licenseKey,
                'store' => $store->fresh(),
                'license_type' => $licenseKey->type,
                'expires_at' => $expiresAt->toDateTimeString(),
                'days_remaining' => $store->fresh()->licenseDaysRemaining(),
            ]
        ]);
    }

    /**
     * Cek status lisensi toko.
     */
    public function storeStatus(Request $request)
    {
        $user = $request->user();

        if (!$user->store_id) {
            return response()->json(['message' => 'Anda belum memiliki toko.'], 404);
        }

        $store = Store::findOrFail($user->store_id);
        $store->checkAndUpdateLicenseStatus();
        $store->refresh();

        return response()->json([
            'store_name' => $store->name,
            'status' => $store->status,
            'license_type' => $store->license_type,
            'license_expires_at' => $store->license_expires_at,
            'days_remaining' => $store->licenseDaysRemaining(),
            'grace_period_ends_at' => $store->grace_period_ends_at,
            'grace_period_days_remaining' => $store->gracePeriodDaysRemaining(),
            'is_active' => $store->isActive(),
            'is_frozen' => $store->isFrozen(),
        ]);
    }
}
