<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStoreLicense
{
    /**
     * Cek status lisensi toko setiap kali user mengakses API toko.
     * 
     * Status alur:
     * - inactive: belum aktivasi license key → block
     * - active: lisensi aktif → lanjut
     * - grace_period: lisensi full expired, 7 hari tenggat → lanjut + warning
     * - frozen: lisensi habis total → block
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Superadmin bypass
        if ($user->role === 'superadmin') {
            return $next($request);
        }

        // User harus punya store_id
        if (!$user->store_id) {
            return $next($request);
        }

        $store = $user->store;
        if (!$store) {
            return response()->json(['message' => 'Toko tidak ditemukan.'], 404);
        }

        // Cek & update status lisensi secara real-time
        $status = $store->checkAndUpdateLicenseStatus();

        switch ($status) {
            case 'inactive':
                return response()->json([
                    'message' => 'Toko belum diaktivasi. Silakan masukkan license key terlebih dahulu.',
                    'store_status' => 'inactive',
                    'action_required' => 'activate_license',
                ], 403);

            case 'frozen':
                $licenseType = $store->license_type;
                if ($licenseType === 'trial') {
                    return response()->json([
                        'message' => 'Masa trial toko Anda telah berakhir. Silakan beli license key full untuk melanjutkan.',
                        'store_status' => 'frozen',
                        'license_type' => 'trial',
                        'action_required' => 'purchase_full_license',
                    ], 403);
                }
                return response()->json([
                    'message' => 'Lisensi toko Anda telah berakhir dan masa tenggang 7 hari telah habis. Toko dibekukan. Silakan perbarui lisensi.',
                    'store_status' => 'frozen',
                    'license_type' => 'full',
                    'action_required' => 'renew_license',
                ], 403);

            case 'grace_period':
                // Masih bisa dipakai tapi beri warning di response header
                $response = $next($request);

                $daysRemaining = $store->gracePeriodDaysRemaining();
                $response->headers->set('X-License-Warning', 'Lisensi expired. Sisa tenggat: ' . $daysRemaining . ' hari.');
                $response->headers->set('X-Grace-Period-Days-Remaining', (string) $daysRemaining);
                $response->headers->set('X-Store-Status', 'grace_period');

                return $response;

            case 'active':
            default:
                return $next($request);
        }
    }
}
