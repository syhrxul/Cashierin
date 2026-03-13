<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ShiftRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\ShiftRequest::with(['user', 'targetUser', 'shift', 'approver']);

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
            'shift_id' => 'nullable|exists:shifts,id',
            'target_user_id' => 'nullable|exists:users,id',
            'reason' => 'required|string',
        ]);

        $shiftRequest = \App\Models\ShiftRequest::create([
            'store_id' => $request->store_id,
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'shift_id' => $request->shift_id,
            'target_user_id' => $request->target_user_id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Permintaan shift berhasil diajukan.',
            'data' => $shiftRequest
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $shiftRequest = \App\Models\ShiftRequest::with(['user', 'targetUser', 'shift', 'approver'])->findOrFail($id);
        return response()->json(['data' => $shiftRequest]);
    }

    /**
     * Approve the shift request.
     */
    public function approve(Request $request, string $id)
    {
        $shiftRequest = \App\Models\ShiftRequest::findOrFail($id);

        if ($shiftRequest->status !== 'pending') {
            return response()->json(['message' => 'Permintaan ini sudah diproses.'], 400);
        }

        $shiftRequest->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        // Logic tambahan jika tipenya transfer
        if ($shiftRequest->type === 'transfer' && $shiftRequest->shift_id && $shiftRequest->target_user_id) {
            $shift = \App\Models\Shift::find($shiftRequest->shift_id);
            if ($shift && $shift->status === 'open') {
                $shift->update(['user_id' => $shiftRequest->target_user_id]);
            }
        }

        return response()->json([
            'message' => 'Permintaan shift disetujui.',
            'data' => $shiftRequest
        ]);
    }

    /**
     * Reject the shift request.
     */
    public function reject(Request $request, string $id)
    {
        $shiftRequest = \App\Models\ShiftRequest::findOrFail($id);

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
    public function destroy(string $id)
    {
        $shiftRequest = \App\Models\ShiftRequest::findOrFail($id);
        $shiftRequest->delete();

        return response()->json(['message' => 'Permintaan shift dihapus.']);
    }
}
