<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStoreAccess
{
    /**
     * Memastikan user hanya bisa mengakses data dari toko miliknya.
     * Superadmin di-bypass (bisa akses semua toko).
     *
     * Layer keamanan:
     * 1. User harus sudah di-approve
     * 2. User harus punya store_id (kecuali superadmin)
     * 3. Tidak bisa akses store_id lain
     * 4. Auto-inject store_id ke request
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Cek apakah user sudah di-approve
        if ($user->approval_status !== 'approved') {
            return response()->json([
                'message' => 'Akun Anda belum disetujui. Silakan tunggu persetujuan dari admin.',
                'approval_status' => $user->approval_status,
            ], 403);
        }

        // Superadmin bisa akses semua toko
        if ($user->role === 'superadmin') {
            return $next($request);
        }

        // User biasa harus punya store_id
        // Pengecualian: Route "POST /api/stores" diperbolehkan jika user adalah owner (untuk inisialisasi toko)
        if (!$user->store_id) {
            if ($request->is('api/stores') && $request->isMethod('POST')) {
                return $next($request);
            }

            return response()->json([
                'message' => 'Akun Anda belum terdaftar pada toko manapun. Hubungi admin.'
            ], 403);
        }

        // Jika request mengirim store_id, pastikan sesuai dengan store_id user (kecuali jika kosong)
        if ($request->filled('store_id') && (int) $request->store_id !== (int) $user->store_id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke toko tersebut.'
            ], 403);
        }

        // Otomatis inject store_id user ke request
        $request->merge([
            'store_id' => $user->store_id,
            'store' => \App\Models\Store::find($user->store_id)
        ]);

        return $next($request);
    }
}
