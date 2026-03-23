<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShiftSchedule;
use Illuminate\Http\Request;

class ShiftScheduleController extends Controller
{
    /**
     * Menampilkan daftar jadwal shift.
     * Otomatis di-filter per toko oleh BelongsToStore trait.
     */
    public function index(Request $request)
    {
        $query = ShiftSchedule::with(['user', 'creator']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('start_date')) {
            $query->whereDate('start_time', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('end_time', '<=', $request->end_date);
        }

        return response()->json([
            'data' => $query->orderBy('start_time', 'desc')->get(),
            'store' => \App\Models\Store::find($request->store_id)
        ]);
    }

    /**
     * Menambah jadwal shift baru (Mendukung pemilihan banyak user).
     * HANYA Owner dan Manager yang bisa menambahkan jadwal untuk kasir.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Cek Role
        if (!in_array($user->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json([
                'message' => 'Hanya Owner atau Manager yang dapat membuat jadwal shift.'
            ], 403);
        }

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'notes' => 'nullable|string|max:255',
        ]);

        $createdCount = 0;
        foreach ($request->user_ids as $userId) {
            // Pastikan user_id yang dijadwalkan berada di toko yang sama
            $targetUser = \App\Models\User::findOrFail($userId);
            if ($user->role !== 'superadmin' && (int) $targetUser->store_id !== (int) $user->store_id) {
                continue; // Lewati jika beda toko
            }

            ShiftSchedule::create([
                'store_id' => $user->store_id,
                'user_id' => $userId,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'notes' => $request->notes,
                'status' => 'scheduled',
                'created_by' => $user->id,
            ]);
            $createdCount++;
        }

        return response()->json([
            'message' => "{$createdCount} jadwal shift berhasil dibuat.",
        ], 201);
    }

    /**
     * Menampilkan detail jadwal shift.
     */
    public function show(string $id)
    {
        $schedule = ShiftSchedule::with(['user', 'creator'])->findOrFail($id);
        return response()->json(['data' => $schedule]);
    }

    /**
     * Mengubah jadwal shift.
     * HANYA Owner dan Manager yang bisa mengubah jadwal.
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        
        if (!in_array($user->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json([
                'message' => 'Hanya Owner atau Manager yang dapat mengubah jadwal shift.'
            ], 403);
        }

        $schedule = ShiftSchedule::findOrFail($id);

        $request->validate([
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
            'notes' => 'nullable|string|max:255',
            'status' => 'sometimes|in:scheduled,completed,cancelled',
        ]);

        $schedule->update($request->only(['start_time', 'end_time', 'notes', 'status']));

        return response()->json([
            'message' => 'Jadwal shift berhasil diperbarui.',
            'data' => $schedule
        ]);
    }

    /**
     * Menghapus jadwal shift.
     * HANYA Owner dan Manager yang bisa menghapus jadwal.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();
        
        if (!in_array($user->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json([
                'message' => 'Hanya Owner atau Manager yang dapat menghapus jadwal shift.'
            ], 403);
        }

        $schedule = ShiftSchedule::findOrFail($id);
        $schedule->delete();

        return response()->json(['message' => 'Jadwal shift berhasil dihapus.']);
    }

    /**
     * Update store shift limit.
     */
    public function updateLimit(Request $request)
    {
        $request->validate([
            'shift_limit_hours' => 'required|integer|min:1|max:24',
        ]);

        $user = $request->user();
        $store = \App\Models\Store::where('id', $user->store_id)->firstOrFail();
        $store->update([
            'shift_limit_hours' => $request->shift_limit_hours
        ]);

        return response()->json([
            'message' => 'Batas jam kerja berhasil diperbarui',
            'data' => $store
        ]);
    }

    public function bulkUpdate(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:shift_schedules,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'notes' => 'nullable|string|max:255',
        ]);
        
        $updatedCount = ShiftSchedule::where('store_id', $user->store_id)
            ->whereIn('id', $request->ids)
            ->update([
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'notes' => $request->notes,
            ]);

        return response()->json(['message' => "{$updatedCount} jadwal shift berhasil diperbarui."]);
    }

    public function bulkDestroy(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:shift_schedules,id']);
        
        $deletedCount = ShiftSchedule::where('store_id', $user->store_id)
            ->whereIn('id', $request->ids)
            ->delete();

        return response()->json(['message' => "{$deletedCount} jadwal shift berhasil dihapus."]);
    }
}
