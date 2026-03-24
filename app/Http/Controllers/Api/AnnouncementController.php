<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Menampilkan daftar pengumuman untuk Dashboard (Kasir/Semua).
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        $announcements = Announcement::with('creator')
            ->where('is_active', true)
            ->where(function ($query) use ($user) {
                // Global announcements (from superadmin)
                $query->where('scope', 'global');
                
                // Store-specific announcements (from owner/manager)
                if ($user->store_id) {
                    $query->orWhere(function ($q) use ($user) {
                        $q->where('scope', 'store')
                          ->where('store_id', $user->store_id);
                    });
                }
            })
            ->latest()
            ->get();
            
        // Filter targeted users IF target_user_ids is not empty
        $filtered = $announcements->filter(function ($a) use ($user) {
            // 1. If target_role is set, user MUST have that role (e.g. 'owner')
            if (!empty($a->target_role) && $user->role !== $a->target_role) {
                return false;
            }

            // 2. If target_user_ids is set, user MUST be in that list
            if (empty($a->target_user_ids)) return true;
            return in_array($user->id, $a->target_user_ids);
        });

        return response()->json(['data' => $filtered->values()]);
    }

    /**
     * Manajemen list (untuk Owner/Superadmin).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Announcement::with(['creator', 'store']);
        
        if ($user->role === 'owner' || $user->role === 'manager') {
            $query->where('store_id', $user->store_id);
        }
        
        $announcements = $query->latest()->get();

        // Mark as 'readonly' for UI if created by superadmin and current user isn't superadmin
        $announcements->each(function($a) use ($user) {
            $a->is_readonly = ($a->creator->role === 'superadmin' && $user->role !== 'superadmin');
        });

        return response()->json(['data' => $announcements]);
    }

    /**
     * Simpan pengumuman baru.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'scope' => 'required|in:global,store',
            'priority' => 'required|in:normal,important,critical',
            'target_user_ids' => 'nullable|array',
            'target_role' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        // Security checks
        if ($request->scope === 'global' && $user->role !== 'superadmin') {
            return response()->json(['message' => 'Hanya Superadmin yang bisa membuat pengumuman global.'], 403);
        }

        $data = $request->all();
        $data['created_by'] = $user->id;
        
        if ($user->role !== 'superadmin') {
            $data['store_id'] = $user->store_id;
            $data['scope'] = 'store'; // Paksa scope store jika bukan superadmin
        }

        $announcement = Announcement::create($data);

        return response()->json([
            'message' => 'Pengumuman berhasil diterbitkan.',
            'data' => $announcement
        ]);
    }

    /**
     * Update pengumuman.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        $announcement = Announcement::with('creator')->findOrFail($id);

        // SECURE: If creator is Superadmin, only Superadmin can edit.
        if ($announcement->creator->role === 'superadmin' && $user->role !== 'superadmin') {
            return response()->json(['message' => 'Hanya Superadmin yang dapat mengubah pengumuman sistem.'], 403);
        }

        // For Store news, only owner/manager of that store can edit
        if ($user->role !== 'superadmin' && $announcement->store_id !== $user->store_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'priority' => 'sometimes|in:normal,important,critical',
            'target_user_ids' => 'nullable|array',
            'target_role' => 'nullable|string'
        ]);

        $announcement->update($request->all());

        return response()->json([
            'message' => 'Pengumuman diperbarui.',
            'data' => $announcement
        ]);
    }

    /**
     * Hapus pengumuman.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        $announcement = Announcement::with('creator')->findOrFail($id);

        if ($announcement->creator->role === 'superadmin' && $user->role !== 'superadmin') {
            return response()->json(['message' => 'Hanya Superadmin yang dapat menghapus pengumuman sistem.'], 403);
        }

        if ($user->role !== 'superadmin' && $announcement->store_id !== $user->store_id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $announcement->delete();

        return response()->json(['message' => 'Pengumuman dihapus.']);
    }
}
