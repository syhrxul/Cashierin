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
}
