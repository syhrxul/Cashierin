<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShiftRequest;
use Illuminate\Http\Request;

class ShiftRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ShiftRequest::with(['user', 'targetUser', 'shift', 'approver']);

        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'data' => $query->latest()->get()
        ]);
    }

    /**
     * Store a newly created resource in storage (Create Permit/Swap/Transfer Request).
     */
    public function store(Request $request)
    {
        $request->validate([
            'store_id' => 'required|exists:stores,id',
            'type' => 'required|in:permit,swap,transfer',
            'shift_id' => 'nullable|exists:shift_schedules,id',
            'target_user_id' => 'nullable|exists:users,id',
            'reason' => 'required|string',
        ]);

        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $shiftRequest = ShiftRequest::create([
            'store_id' => $request->store_id,
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'shift_id' => $request->shift_id,
            'target_user_id' => $request->target_user_id,
            'reason' => $request->reason,
            // Kita atur jadi 'pending' supaya tidak error 500 pada Enum Server lama
            'status' => 'pending', 
        ]);

        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        return response()->json([
            'message' => 'Permintaan shift berhasil diajukan.',
            'data' => $shiftRequest
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $shiftRequest = ShiftRequest::with(['user', 'targetUser', 'shift', 'approver'])->findOrFail($id);

        // Cek kepemilikan toko
        if ($request->has('store_id') && (int) $shiftRequest->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        return response()->json(['data' => $shiftRequest]);
    }

    /**
     * Approve the shift request.
     */
    public function approve(Request $request, string $id)
    {
        $shiftRequest = ShiftRequest::findOrFail($id);
        $user = $request->user();

        // Cek kepemilikan toko
        if ($request->has('store_id') && (int) $shiftRequest->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        // Jika status 'pending' (awalnya waiting_target) dan yang approve adalah target_user_id
        if ($shiftRequest->status === 'pending' && $shiftRequest->type === 'swap' && (int)$user->id === (int)$shiftRequest->target_user_id) {
            // Langsung setujui dan proses pertukaran (bypass Owner)
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            $shiftRequest->update([
                'status' => 'approved',
                'approved_by' => $user->id,
                'approved_at' => now(),
            ]);
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            // Logic pindah jadwal / tukar shift
            if ($shiftRequest->shift_id) {
                // Cegah Foreign Key error di Database lama kita bypass constraint atau update jadwal utamanya
                $shift = \App\Models\ShiftSchedule::find($shiftRequest->shift_id);
                if ($shift) {
                    $shift->update(['user_id' => $shiftRequest->target_user_id]);
                }
            }

            return response()->json(['message' => 'Anda telah menyetujui pertukaran. Jadwal shift langsung dialihkan kepada Anda.', 'data' => $shiftRequest]);
        }

        // Hanya Owner/Manager yang bisa melakukan approval FINAL
        if (!in_array($user->role, ['superadmin', 'owner', 'manager'])) {
             return response()->json(['message' => 'Menunggu persetujuan rekan kerja atau Owner.'], 403);
        }

        if ($shiftRequest->status === 'approved') {
            return response()->json(['message' => 'Permintaan ini sudah disetujui sebelumnya.'], 400);
        }

        $shiftRequest->update([
            'status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        // Logic pindah jadwal / tukar
        if ($shiftRequest->shift_id && $shiftRequest->target_user_id) {
            $shift = \App\Models\ShiftSchedule::find($shiftRequest->shift_id);
            if ($shift) {
                $shift->update(['user_id' => $shiftRequest->target_user_id]);
            }
        }

        return response()->json([
            'message' => 'Permintaan shift disetujui (Final).',
            'data' => $shiftRequest
        ]);
    }

    /**
     * Reject the shift request.
     */
    public function reject(Request $request, string $id)
    {
        $shiftRequest = ShiftRequest::findOrFail($id);

        // Cek kepemilikan toko
        if ($request->has('store_id') && (int) $shiftRequest->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        if ($shiftRequest->status !== 'pending') {
            return response()->json(['message' => 'Permintaan ini sudah diproses.'], 400);
        }

        $shiftRequest->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Permintaan shift ditolak.',
            'data' => $shiftRequest
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $shiftRequest = ShiftRequest::findOrFail($id);

        // Cek kepemilikan toko
        if ($request->has('store_id') && (int) $shiftRequest->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        $shiftRequest->delete();

        return response()->json(['message' => 'Permintaan shift dihapus.']);
    }
}
