<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SuperAdminController extends Controller
{
    /**
     * Daftar semua user (semua role, semua toko).
     */
    public function listUsers(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('username', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        return response()->json(['data' => $query->latest()->get()]);
    }

    /**
     * Daftar user yang menunggu approval (pending owners).
     */
    public function pendingUsers(Request $request)
    {
        $query = User::where('approval_status', 'pending')
            ->whereNull('store_id'); // Owner baru yang belum punya toko

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('username', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        return response()->json(['data' => $query->latest()->get()]);
    }

    /**
     * Approve user (owner baru yang daftar via /register).
     */
    public function approveUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        if ($user->approval_status === 'approved') {
            return response()->json(['message' => 'User sudah disetujui sebelumnya.'], 400);
        }

        $user->update([
            'approval_status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => "User '{$user->name}' berhasil disetujui.",
            'data' => $user->fresh()
        ]);
    }

    /**
     * Reject user.
     */
    public function rejectUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        if ($user->approval_status === 'rejected') {
            return response()->json(['message' => 'User sudah ditolak sebelumnya.'], 400);
        }

        $user->update([
            'approval_status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        $user->tokens()->delete();

        return response()->json([
            'message' => "Pendaftaran user '{$user->name}' ditolak.",
            'data' => $user->fresh()
        ]);
    }

    /**
     * Buat user baru secara manual.
     */
    public function createUser(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username|alpha_dash',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)],
            'role'     => 'required|in:superadmin,owner,manager,kasir',
            'store_id' => 'nullable|exists:stores,id',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'username' => strtolower($request->username),
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
            'store_id' => $request->store_id,
            'approval_status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat.',
            'data'    => $user
        ], 201);
    }

    /**
     * Ganti password user.
     */
    public function changePassword(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'password'              => ['required', 'confirmed', Password::min(8)],
            'password_confirmation' => 'required',
        ]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        $user->tokens()->delete();

        return response()->json([
            'message' => "Password user '{$user->name}' berhasil diubah. Semua sesi aktif telah dicabut."
        ]);
    }

    /**
     * Update data user.
     */
    public function updateUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:50|alpha_dash|unique:users,username,' . $user->id,
            'email'    => 'sometimes|email|unique:users,email,' . $user->id,
            'role'     => 'sometimes|in:superadmin,owner,manager,kasir',
            'store_id' => 'nullable|exists:stores,id',
        ]);

        $data = $request->only(['name', 'username', 'email', 'role', 'store_id']);
        if (isset($data['username'])) {
            $data['username'] = strtolower($data['username']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Data user berhasil diperbarui.',
            'data'    => $user->fresh()
        ]);
    }

    /**
     * Hapus user.
     */
    public function deleteUser(string $id)
    {
        $user = User::findOrFail($id);

        if (request()->user()->id === $user->id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.'
            ], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => "User '{$user->name}' berhasil dihapus."]);
    }

    /**
     * Aktifkan / nonaktifkan user.
     */
    public function toggleUserStatus(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        if (!$request->is_active) {
            $user->tokens()->delete();
            return response()->json([
                'message' => "Akun '{$user->name}' telah dinonaktifkan. Semua sesi dicabut."
            ]);
        }

        return response()->json([
            'message' => "Akun '{$user->name}' aktif kembali. User perlu login ulang."
        ]);
    }
}
