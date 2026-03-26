<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * List all custom roles for this store.
     */
    public function index(Request $request)
    {
        $roles = Role::withCount('users')->get();
        return response()->json(['data' => $roles]);
    }

    /**
     * Create a new custom role.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|regex:/^[a-zA-Z\s]+$/',
            'permissions' => 'nullable|array',
        ], [
            'name.regex' => 'Nama role hanya boleh berisi huruf (tidak ada angka atau simbol).',
        ]);

        $name = strtolower($request->name);

        // Security check: No 'admin' allowed in name
        if (str_contains($name, 'admin')) {
            return response()->json([
                'message' => 'Nama role tidak boleh mengandung unsur kata administrator/admin.'
            ], 403);
        }

        $role = Role::create([
            'name' => $name,
            'permissions' => $request->permissions ?? [],
            'store_id' => $request->store_id, // BelongsToStore handles this but good to be explicit
        ]);

        return response()->json([
            'message' => 'Role berhasil dibuat.',
            'data' => $role
        ], 201);
    }

    /**
     * Show a specific role.
     */
    public function show(string $id)
    {
        $role = Role::with('users:id,name,username,email')->findOrFail($id);
        return response()->json(['data' => $role]);
    }

    /**
     * Update an existing role.
     */
    public function update(Request $request, string $id)
    {
        $role = Role::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:50|regex:/^[a-zA-Z\s]+$/',
            'permissions' => 'sometimes|nullable|array',
        ], [
            'name.regex' => 'Nama role hanya boleh berisi huruf (tidak ada angka atau simbol).',
        ]);

        if ($request->has('name')) {
            $name = strtolower($request->name);
            if (str_contains($name, 'admin')) {
                return response()->json([
                    'message' => 'Nama role tidak boleh mengandung unsur kata administrator/admin.'
                ], 403);
            }
            $role->name = $name;
        }

        if ($request->has('permissions')) {
            $role->permissions = $request->permissions;
        }

        $role->save();

        return response()->json([
            'message' => 'Role berhasil diperbarui.',
            'data' => $role
        ]);
    }

    /**
     * Delete a role.
     */
    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);
        
        // Check if role has users
        if ($role->users()->count() > 0) {
            return response()->json([
                'message' => 'Role ini tidak dapat dihapus karena masih digunakan oleh beberapa karyawan. Pindahkan karyawan ke role lain terlebih dahulu.'
            ], 422);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role berhasil dihapus.'
        ]);
    }

    /**
     * Get all users belonging to this role.
     */
    public function users(string $id)
    {
        $role = Role::findOrFail($id);
        $users = $role->users()->select('id', 'name', 'username', 'email', 'role', 'phone', 'last_seen_at')->get();
        return response()->json(['data' => $users]);
    }
}
