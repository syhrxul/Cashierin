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

        // Auto-assign store_id ke owner jika belum punya
        $owner = \App\Models\User::find($request->user_id);
        if ($owner && !$owner->store_id) {
            $owner->update(['store_id' => $store->id]);
        }

        ActivityLog::log('store_created', "Toko baru berhasil dibuat: '{$store->name}' oleh @{$user->username}", [
            'store_id' => $store->id,
            'owner_id' => $owner->id
        ]);

        return response()->json([
            'message' => 'Toko berhasil dibuat.',
            'data' => $store
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
        
        if ($store->status === 'frozen') {
            // Jika sebelumnya frozen, tanyakan status terbaru (bisa kembali ke active atau grace_period)
            $store->status = 'active'; 
            $message = 'Toko berhasil dicairkan (Status: Active).';
            
            // Re-check status based on license
            $store->checkAndUpdateLicenseStatus();
        } else {
            $store->status = 'frozen';
            $message = 'Toko berhasil dibekukan.';
        }

        $store->save();

        ActivityLog::log('store_status_toggled', "Status toko '{$store->name}' diubah menjadi {$store->status} oleh @{$user->username}", [
            'store_id' => $store->id,
            'new_status' => $store->status
        ]);

        return response()->json([
            'message' => $message,
            'data' => $store
        ]);
    }
}
