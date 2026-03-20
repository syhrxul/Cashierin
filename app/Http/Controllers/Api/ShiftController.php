<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Http\Request;

use App\Models\ActivityLog;

class ShiftController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Shift::with('user');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'data' => $query->latest()->get()
        ]);
    }

    /**
     * Membuka Shift Baru (Opening Shift).
     * Owner/Manager bisa "mention" (menunjuk) siapa kasir yang bertugas.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Validasi input
        $request->validate([
            'starting_cash' => 'required|numeric|min:0',
            'user_id' => 'sometimes|exists:users,id', // Untuk mention siapa yang jaga
            'notes' => 'nullable|string|max:500',
        ]);

        // Tentukan siapa yang jaga (Target User)
        $targetUserId = $user->id; // Default diri sendiri

        // Jika yang membuat shift adalah Owner/Manager, mereka bisa "mention" orang lain
        if ($request->has('user_id') && in_array($user->role, ['superadmin', 'owner', 'manager'])) {
            $targetUserId = $request->user_id;

            // Pastikan kasir yang di-mention berada di toko yang sama
            $targetUser = User::findOrFail($targetUserId);
            if ($user->role !== 'superadmin' && (int) $targetUser->store_id !== (int) $user->store_id) {
                return response()->json([
                    'message' => 'Anda tidak dapat menugaskan pegawai dari toko lain.'
                ], 403);
            }
        }

        // Cek jika kasir target masih punya shift yang belum ditutup
        $existingShift = Shift::where('user_id', $targetUserId)
            ->where('status', 'open')
            ->first();

        if ($existingShift) {
            $targetName = ($targetUserId === $user->id) ? 'Anda' : 'Pegawai tersebut';
            return response()->json([
                'message' => "$targetName masih memiliki shift yang sedang terbuka.",
                'data' => $existingShift
            ], 400);
        }

        $shift = Shift::create([
            'store_id' => $user->store_id,
            'user_id' => $targetUserId,
            'starting_cash' => $request->starting_cash,
            'started_at' => now(),
            'status' => 'open',
            'notes' => $request->notes, // Bisa berisi detail "Mentions"
        ]);

        $assignedTo = User::find($targetUserId);
        ActivityLog::log('shift_opened', "Shift dibuka untuk '{$assignedTo->name}' oleh '{$user->name}'", [
            'shift_id' => $shift->id,
            'user_id' => $assignedTo->id,
            'starting_cash' => $request->starting_cash
        ]);

        return response()->json([
            'message' => 'Shift berhasil dibuka.',
            'assigned_to' => $assignedTo->name,
            'data' => $shift
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $shift = Shift::with('user')->findOrFail($id);
        return response()->json(['data' => $shift]);
    }

    /**
     * Mengubah data shift (Edit).
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        
        if (!in_array($user->role, ['superadmin', 'owner', 'manager'])) {
            return response()->json([
                'message' => 'Hanya Owner atau Manager yang dapat mengubah data shift.'
            ], 403);
        }

        $shift = Shift::findOrFail($id);

        $request->validate([
            'starting_cash' => 'sometimes|numeric|min:0',
            'ending_cash' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:open,closed',
            'notes' => 'nullable|string|max:500',
            'user_id' => 'sometimes|exists:users,id', // Bisa ganti siapa yang jaga (re-assignment)
        ]);

        $data = $request->only(['starting_cash', 'ending_cash', 'status', 'started_at', 'ended_at', 'notes', 'user_id']);
        
        // Proteksi jika ganti user_id
        if (isset($data['user_id']) && $user->role !== 'superadmin') {
            $targetUser = User::findOrFail($data['user_id']);
            if ((int) $targetUser->store_id !== (int) $user->store_id) {
                return response()->json(['message' => 'User toko lain.'], 403);
            }
        }

        $shift->update($data);

        return response()->json([
            'message' => 'Data shift berhasil diperbarui.',
            'data' => $shift
        ]);
    }

    /**
     * Menutup Shift.
     */
    public function close(Request $request, string $id)
    {
        $user = $request->user();
        $shift = Shift::findOrFail($id);

        if ($user->role === 'kasir' && (int) $shift->user_id !== (int) $user->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk menutup shift orang lain.'
            ], 403);
        }

        if ($shift->status === 'closed') {
            return response()->json(['message' => 'Shift sudah ditutup sebelumnya.'], 400);
        }

        $request->validate([
            'ending_cash' => 'required|numeric|min:0',
        ]);

        $shift->update([
            'ending_cash' => $request->ending_cash,
            'ended_at' => now(),
            'status' => 'closed',
        ]);

        ActivityLog::log('shift_closed', "Shift ditutup oleh '{$user->name}' dengan uang akhir Rp " . number_format($request->ending_cash, 0, ',', '.'), [
            'shift_id' => $shift->id,
            'ending_cash' => $request->ending_cash
        ]);

        return response()->json([
            'message' => 'Shift berhasil ditutup.',
            'data' => $shift
        ]);
    }

    /**
     * Menghapus shift.
     */
    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role !== 'superadmin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        Shift::findOrFail($id)->delete();
        return response()->json(['message' => 'Data shift berhasil dihapus.']);
    }

    /**
     * Shift aktif user saat ini.
     */
    public function active(Request $request)
    {
        $shift = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (!$shift) {
            return response()->json(['message' => 'Tidak ada shift aktif.'], 404);
        }

        return response()->json(['data' => $shift]);
    }
}
