<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;

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
            'approval_status' => 'approved',
            'approved_at' => now(),
        ]);

        ActivityLog::log('register', "Pendaftaran Owner baru: {$user->name} (@{$user->username})", [
            'user_id' => $user->id,
            'role' => 'owner'
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil. Akun Owner Anda telah aktif, silakan lanjutkan untuk membuat toko pertama Anda.',
            'user' => new UserResource($user),
            'token' => $token,
            'approval_status' => 'approved',
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

        $store = Store::with('defaultRole')->where('invite_code', $request->invite_code)->first();

        if (!$store) {
            return response()->json(['message' => 'Kode undangan tidak valid.'], 404);
        }

        // Use store's default role if set, otherwise fallback to 'pegawai'
        $roleName = $store->defaultRole ? $store->defaultRole->name : 'pegawai';
        $roleId = $store->default_role_id;

        $user = User::create([
            'name' => $request->name,
            'username' => strtolower($request->username),
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $roleName,
            'role_id' => $roleId,
            'store_id' => $store->id,
            'approval_status' => 'approved',
            'approved_at' => now(),
        ]);

        ActivityLog::log('register_invite', "Kasir baru bergabung ke toko '{$store->name}': {$user->name} sebagai {$roleName}", [
            'user_id' => $user->id,
            'store_id' => $store->id,
            'role' => $roleName
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => "Registrasi berhasil untuk toko '{$store->name}'. Akun Anda telah aktif dan dapat langsung digunakan.",
            'user' => new UserResource($user),
            'token' => $token,
            'approval_status' => 'approved',
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
            ActivityLog::log('login_failed', "Gagal login untuk ID: {$request->login_id}", [
                'login_id' => $request->login_id
            ]);
            throw ValidationException::withMessages([
                'login_id' => ['Kredensial yang diberikan salah.'],
            ]);
        }

        if ($user->approval_status === 'rejected') {
            ActivityLog::log('login_blocked', "Login ditolak untuk user Rejected: {$user->name}", [
                'user_id' => $user->id
            ]);
            return response()->json([
                'message' => 'Akun Anda telah ditolak. Hubungi admin.',
                'approval_status' => 'rejected',
            ], 403);
        }

        ActivityLog::log('login', "User '{$user->name}' berhasil masuk ke sistem.", [
            'user_id' => $user->id,
            'role' => $user->role
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = [
            'user' => new UserResource($user),
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
        $user = $request->user();
        ActivityLog::log('logout', "User '{$user->name}' keluar dari sistem.", [
            'user_id' => $user->id
        ]);
        $user->currentAccessToken()->delete();
        return response()->json(['message' => 'Berhasil logout']);
    }
}
