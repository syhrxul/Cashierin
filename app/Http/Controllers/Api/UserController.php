<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of store users.
     */
    public function index(Request $request)
    {
        $query = User::where('store_id', $request->store_id);

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        return response()->json([
            'data' => $query->with('approvedByUser')->get()
        ]);
    }

    /**
     * Daftar user pending approval di toko ini.
     */
    public function pendingApprovals(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json([
                'message' => 'Hanya owner atau manager yang dapat melihat daftar approval.'
            ], 403);
        }

        $pending = User::where('store_id', $request->store_id)
            ->where('approval_status', 'pending')
            ->get();

        return response()->json(['data' => $pending]);
    }

    /**
     * Approve user pegawai toko.
     */
    public function approveUser(Request $request, string $id)
    {
        $currentUser = $request->user();

        if (!in_array($currentUser->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json([
                'message' => 'Hanya owner atau manager yang dapat menyetujui user.'
            ], 403);
        }

        $user = User::where('store_id', $request->store_id)->findOrFail($id);

        if ($user->approval_status === 'approved') {
            return response()->json(['message' => 'User sudah disetujui sebelumnya.'], 400);
        }

        $request->validate([
            'role' => 'sometimes|in:manager,kasir',
        ]);

        $user->update([
            'approval_status' => 'approved',
            'approved_by' => $currentUser->id,
            'approved_at' => now(),
            'role' => $request->input('role', $user->role),
        ]);

        return response()->json([
            'message' => "User '{$user->name}' berhasil disetujui sebagai {$user->role}.",
            'data' => $user->fresh()
        ]);
    }

    /**
     * Reject user pegawai toko.
     */
    public function rejectUser(Request $request, string $id)
    {
        $currentUser = $request->user();

        if (!in_array($currentUser->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json([
                'message' => 'Hanya owner atau manager yang dapat menolak user.'
            ], 403);
        }

        $user = User::where('store_id', $request->store_id)->findOrFail($id);

        if ($user->approval_status === 'rejected') {
            return response()->json(['message' => 'User sudah ditolak sebelumnya.'], 400);
        }

        $user->update([
            'approval_status' => 'rejected',
            'approved_by' => $currentUser->id,
            'approved_at' => now(),
        ]);

        $user->tokens()->delete();

        return response()->json([
            'message' => "Pendaftaran '{$user->name}' ditolak.",
            'data' => $user->fresh()
        ]);
    }

    /**
     * Buat user baru secara manual oleh owner/manager.
     */
    public function store(Request $request)
    {
        $currentUser = $request->user();

        if (!in_array($currentUser->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json([
                'message' => 'Hanya owner atau manager yang dapat menambahkan user baru.'
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username|alpha_dash',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:manager,kasir',
        ]);

        $newUser = User::create([
            'name' => $request->name,
            'username' => strtolower($request->username),
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'store_id' => $request->store_id,
            'approval_status' => 'approved',
            'approved_by' => $currentUser->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan.',
            'data' => $newUser
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, string $id)
    {
        $user = User::where('store_id', $request->store_id)->findOrFail($id);

        return response()->json([
            'data' => $user
        ]);
    }

    /**
     * Update user.
     */
    public function update(Request $request, string $id)
    {
        $currentUser = $request->user();
        $user = User::where('store_id', $request->store_id)->findOrFail($id);

        if ((int) $currentUser->id !== (int) $user->id && !in_array($currentUser->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk mengubah data user lain.'
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:50|alpha_dash|unique:users,username,' . $user->id,
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|in:manager,kasir',
        ]);

        $data = $request->only(['name', 'username', 'email', 'role']);

        if (isset($data['username'])) {
            $data['username'] = strtolower($data['username']);
        }

        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'data' => $user
        ]);
    }

    /**
     * Hapus user.
     */
    public function destroy(Request $request, string $id)
    {
        $currentUser = $request->user();
        $user = User::where('store_id', $request->store_id)->findOrFail($id);

        if (!in_array($currentUser->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json([
                'message' => 'Hanya owner atau manager yang dapat menghapus user.'
            ], 403);
        }

        if ((int) $currentUser->id === (int) $user->id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.'
            ], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus.'
        ]);
    }

    /**
     * Owner ganti password manager/kasir.
     */
    public function changePassword(Request $request, string $id)
    {
        $currentUser = $request->user();

        if (!in_array($currentUser->role, ['superadmin', 'owner'])) {
            return response()->json([
                'message' => 'Hanya owner yang dapat mengubah password pegawai.'
            ], 403);
        }

        $user = User::where('store_id', $request->store_id)->findOrFail($id);

        if ($user->role === 'owner' && (int) $currentUser->id !== (int) $user->id) {
            return response()->json([
                'message' => 'Anda tidak dapat mengubah password owner lain.'
            ], 403);
        }

        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        $user->tokens()->delete();

        return response()->json([
            'message' => "Password '{$user->name}' berhasil diubah. User harus login ulang."
        ]);
    }
}
