<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApproved
{
    /**
     * Pastikan user sudah di-approve sebelum bisa mengakses API.
     * Middleware ini dipakai di route yang TIDAK butuh store.access
     * tapi tetap perlu validasi approval.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if ($user->approval_status !== 'approved') {
            return response()->json([
                'message' => 'Akun Anda belum disetujui. Silakan tunggu persetujuan dari admin.',
                'approval_status' => $user->approval_status,
            ], 403);
        }

        return $next($request);
    }
}
