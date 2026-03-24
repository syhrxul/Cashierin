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
        
        $query = Announcement::with(['creator', 'reads' => function($q) use ($user) {
            $q->where('user_id', $user->id);
        }])->where('is_active', true);
        
        $query->where(function ($q) use ($user) {
            $q->where('scope', 'global');
            if ($user->store_id) {
                $q->orWhere(function ($s) use ($user) {
                    $s->where('scope', 'store')->where('store_id', $user->store_id);
                });
            }
        });

        $announcements = $query->latest()->get();
            
        $filtered = $announcements->filter(function ($a) use ($user) {
            if ($a->target_role && !in_array($a->target_role, ['', 'all']) && $user->role !== $a->target_role) {
                return false;
            }
            if (!empty($a->target_user_ids) && count($a->target_user_ids) > 0) {
                return in_array($user->id, $a->target_user_ids);
            }
            return true;
        });

        // Add 'is_read' flag based on reads relationship
        $filtered->each(function($a) {
            $a->is_read = $a->reads->isNotEmpty();
            unset($a->reads); // Hide relation for cleaner output
        });

        return response()->json(['data' => $filtered->values()]);
    }

    /**
     * Manajemen list (untuk Owner/Superadmin).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Announcement::with(['creator', 'store'])->withCount('reads');
        
        if ($user->role === 'owner' || $user->role === 'manager') {
            $query->where(function ($q) use ($user) {
                $q->where('store_id', $user->store_id);
                $q->orWhere(function ($g) use ($user) {
                    $g->where('scope', 'global')
                      ->where(function ($roleQ) use ($user) {
                          $roleQ->whereNull('target_role')
                               ->orWhere('target_role', '')
                               ->orWhere('target_role', 'all')
                               ->orWhere('target_role', $user->role);
                      });
                });
            });
        }
        
        $announcements = $query->latest()->get();

        $announcements->each(function($a) use ($user) {
            $creatorRole = optional($a->creator)->role;
            $a->is_readonly = ($creatorRole === 'superadmin' && $user->role !== 'superadmin');
        });

        return response()->json(['data' => $announcements]);
    }

    /**
     * Menandai pengumuman sudah dibaca.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        \App\Models\AnnouncementRead::updateOrCreate(
            ['user_id' => $user->id, 'announcement_id' => $id],
            ['read_at' => now()]
        );
        return response()->json(['message' => 'Read marked.']);
    }

    /**
     * Menandai SEMUA pengumuman sudah dibaca.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        $activeAnnouncements = Announcement::where('is_active', true)
            ->where(function ($query) use ($user) {
                $query->where('scope', 'global');
                if ($user->store_id) {
                    $query->orWhere(function ($s) use ($user) {
                        $s->where('scope', 'store')->where('store_id', $user->store_id);
                    });
                }
            })
            ->get();
            
        $toMark = $activeAnnouncements->filter(function ($a) use ($user) {
            if ($a->target_role && !in_array($a->target_role, ['', 'all']) && $user->role !== $a->target_role) {
                return false;
            }
            if (!empty($a->target_user_ids) && count($a->target_user_ids) > 0) {
                if (!in_array($user->id, $a->target_user_ids)) return false;
            }
            return true;
        });

        foreach ($toMark as $a) {
            \App\Models\AnnouncementRead::updateOrCreate(
                ['user_id' => $user->id, 'announcement_id' => $a->id],
                ['read_at' => now()]
            );
        }

        return response()->json(['message' => 'All marked as read.']);
    }

    /**
     * Hitung total pengumuman belum dibaca (untuk badge sidebar).
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        $activeAnnouncements = Announcement::where('is_active', true)
            ->where(function ($query) use ($user) {
                $query->where('scope', 'global');
                if ($user->store_id) {
                    $query->orWhere(function ($s) use ($user) {
                        $s->where('scope', 'store')->where('store_id', $user->store_id);
                    });
                }
            })
            ->get();
            
        $unread = $activeAnnouncements->filter(function ($a) use ($user) {
            // Targeting filters...
            if ($a->target_role && !in_array($a->target_role, ['', 'all']) && $user->role !== $a->target_role) {
                return false;
            }
            if (!empty($a->target_user_ids) && count($a->target_user_ids) > 0) {
                if (!in_array($user->id, $a->target_user_ids)) return false;
            }
            
            // Check if user has read it
            return !\App\Models\AnnouncementRead::where('user_id', $user->id)
                ->where('announcement_id', $a->id)
                ->exists();
        });

        return response()->json(['count' => $unread->count()]);
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
