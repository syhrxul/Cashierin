<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register sebagai Owner baru.
     * Status: pending → butuh approval dari superadmin.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username|alpha_dash',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => strtolower($request->username),
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'owner',
            'approval_status' => 'pending',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil. Akun Anda perlu disetujui oleh Super Admin sebelum dapat digunakan.',
            'user' => $user,
            'token' => $token,
            'approval_status' => 'pending',
        ], 201);
    }

    /**
     * Register sebagai pegawai toko via invite code.
     */
    public function registerByInvite(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username|alpha_dash',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'invite_code' => 'required|string',
        ]);

        $store = Store::where('invite_code', $request->invite_code)->first();

        if (!$store) {
            return response()->json(['message' => 'Kode undangan tidak valid.'], 404);
        }

        $user = User::create([
            'name' => $request->name,
            'username' => strtolower($request->username),
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'kasir',
            'store_id' => $store->id,
            'approval_status' => 'pending',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => "Registrasi berhasil untuk toko '{$store->name}'. Akun Anda perlu disetujui oleh owner toko.",
            'user' => $user,
            'token' => $token,
            'approval_status' => 'pending',
            'store_name' => $store->name,
        ], 201);
    }

    /**
     * Login — bisa pakai email atau username.
     */
    public function login(Request $request)
    {
        $request->validate([
            'login_id' => 'required|string', // Bisa email atau username
            'password' => 'required',
        ]);

        // Cari berdasarkan email atau username
        $user = User::where(function($query) use ($request) {
            $query->where('email', $request->login_id)
                  ->orWhere('username', strtolower($request->login_id));
        })->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login_id' => ['Kredensial yang diberikan salah.'],
            ]);
        }

        if ($user->approval_status === 'rejected') {
            return response()->json([
                'message' => 'Akun Anda telah ditolak. Hubungi admin.',
                'approval_status' => 'rejected',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = [
            'user' => $user,
            'token' => $token,
            'approval_status' => $user->approval_status,
        ];

        if ($user->approval_status === 'pending') {
            $response['message'] = 'Login berhasil, namun akun Anda masih menunggu persetujuan.';
        }

        return response()->json($response);
    }

    public function approvalStatus(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'approval_status' => $user->approval_status,
            'approved_by' => $user->approved_by,
            'approved_at' => $user->approved_at,
            'is_approved' => $user->isApproved(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Berhasil logout']);
    }
}
