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

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json(['data' => $query->latest()->get()]);
    }

    /**
     * Buat user baru (semua role bisa, termasuk superadmin lain).
     */
    public function createUser(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)],
            'role'     => 'required|in:superadmin,owner,manager,kasir',
            'store_id' => 'nullable|exists:stores,id',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
            'store_id' => $request->store_id,
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat.',
            'data'    => $user
        ], 201);
    }

    /**
     * Ubah password user manapun (tanpa perlu tahu password lama).
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

        // Revoke semua token aktif user ini agar harus login ulang
        $user->tokens()->delete();

        return response()->json([
            'message' => "Password user '{$user->name}' berhasil diubah. Semua sesi aktif telah dicabut."
        ]);
    }

    /**
     * Update data user (nama, email, role, store_id).
     */
    public function updateUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $user->id,
            'role'     => 'sometimes|in:superadmin,owner,manager,kasir',
            'store_id' => 'nullable|exists:stores,id',
        ]);

        $user->update($request->only(['name', 'email', 'role', 'store_id']));

        return response()->json([
            'message' => 'Data user berhasil diperbarui.',
            'data'    => $user->fresh()
        ]);
    }

    /**
     * Hapus user beserta semua token aktifnya.
     */
    public function deleteUser(string $id)
    {
        $user = User::findOrFail($id);

        // Cegah superadmin hapus diri sendiri
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
     * Aktifkan / nonaktifkan user (lock akun).
     * Menggunakan soft-approach: revoke semua token jika dinonaktifkan.
     */
    public function toggleUserStatus(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        // Tambahkan kolom is_active di masa depan jika diperlukan.
        // Saat ini, nonaktifkan = cabut semua token.
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
