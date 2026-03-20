<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use App\Models\LicenseKey;
use App\Models\Transaction;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SuperadminController extends Controller
{
    public function dashboard(Request $request)
    {
        // Hanya superadmin yang boleh akses
        if ($request->user()->role !== 'superadmin') {
            return response()->json(['message' => 'Izin ditolak.'], 403);
        }

        // 1. Store Metrics
        $totalStores = Store::count();
        $activeStores = Store::where('status', 'active')->count();
        $frozenStores = Store::where('status', 'frozen')->count();

        // 2. User/Owner Metrics
        $totalUserCount = User::count();
        $totalOwners = User::where('role', 'owner')->count();
        $totalStaff = User::whereIn('role', ['manager', 'kasir'])->count();

        // 3. System Volume
        $totalTransactions = Transaction::count();
        $totalProducts = Product::count();
        
        // 4. Financial/License Metrics (Assume full version is the primary revenue)
        $licenseStats = LicenseKey::select(
            DB::raw('COUNT(*) as total_keys'),
            DB::raw('SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) as used_keys'),
        )->first();

        // 5. Recent Activity (Latest Stores)
        $latestStores = Store::with('user:id,username')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => [
                    'stores' => [
                        'total' => $totalStores,
                        'active' => $activeStores,
                        'frozen' => $frozenStores,
                    ],
                    'users' => [
                        'total' => $totalUserCount,
                        'owners' => $totalOwners,
                        'staff' => $totalStaff,
                    ],
                    'volume' => [
                        'transactions' => $totalTransactions,
                        'products' => $totalProducts,
                    ],
                    'license' => [
                        'total_keys' => $licenseStats->total_keys,
                        'used_keys' => $licenseStats->used_keys,
                    ]
                ],
                'latest_stores' => $latestStores
            ]
        ]);
    }

    public function listUsers()
    {
        $users = User::with('store')->latest()->get();
        return response()->json(['status' => 'success', 'data' => $users]);
    }

    public function pendingUsers()
    {
        $users = User::where('approval_status', 'pending')
                    ->orWhereNull('approval_status')
                    ->latest()
                    ->get();
        return response()->json(['status' => 'success', 'data' => $users]);
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username|alpha_dash',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'role'     => 'required|in:superadmin,owner,manager,kasir',
            'store_id' => 'nullable|exists:stores,id',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'username' => strtolower($request->username),
            'email'    => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'role'     => $request->role,
            'store_id' => $request->store_id,
            'approval_status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil dibuat.',
            'data'    => $user
        ], 201);
    }

    public function updateUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,'.$user->id,
            'role'     => 'sometimes|in:superadmin,owner,manager,kasir',
            'password' => 'nullable|min:8',
        ]);

        $data = $request->only(['name', 'email', 'role']);
        
        if ($request->filled('password')) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Data user berhasil diperbarui.',
            'data'    => $user->fresh()
        ]);
    }

    public function deleteUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        // Jangan biarkan hapus diri sendiri
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Tidak dapat menghapus diri sendiri.'], 422);
        }

        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil dihapus.'
        ]);
    }
}
