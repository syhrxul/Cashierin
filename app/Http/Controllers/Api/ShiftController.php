<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Shift::with('user');

        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json([
            'data' => $query->latest()->get()
        ]);
    }

    /**
     * Store a newly created resource in storage (Opening Shift).
     */
    public function store(Request $request)
    {
        $request->validate([
            'store_id' => 'required|exists:stores,id',
            'starting_cash' => 'required|numeric|min:0',
        ]);

        // Cek jika kasir masih punya shift yang belum ditutup
        $existingShift = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if ($existingShift) {
            return response()->json([
                'message' => 'Anda masih memiliki shift yang sedang dibuka.',
                'data' => $existingShift
            ], 400);
        }

        $shift = Shift::create([
            'store_id' => $request->store_id,
            'user_id' => $request->user()->id,
            'starting_cash' => $request->starting_cash,
            'started_at' => now(),
            'status' => 'open',
        ]);

        return response()->json([
            'message' => 'Shift berhasil dibuka.',
            'data' => $shift
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $shift = Shift::with('user', 'store')->findOrFail($id);
        return response()->json(['data' => $shift]);
    }

    /**
     * Close the shift.
     */
    public function close(Request $request, string $id)
    {
        $shift = Shift::findOrFail($id);

        if ($shift->status === 'closed') {
            return response()->json([
                'message' => 'Shift sudah ditutup sebelumnya.'
            ], 400);
        }

        $request->validate([
            'ending_cash' => 'required|numeric|min:0',
        ]);

        // Logic expected cash calculate bisa ditambahkan nanti setelah ada api transaksi
        // Untuk sementara kita biarkan expected_cash diisi manual atau null dulu
        
        $shift->update([
            'ending_cash' => $request->ending_cash,
            'ended_at' => now(),
            'status' => 'closed',
        ]);

        return response()->json([
            'message' => 'Shift berhasil ditutup.',
            'data' => $shift
        ]);
    }

    /**
     * Get active shift for current user
     */
    public function active(Request $request)
    {
        $shift = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (!$shift) {
            return response()->json([
                'message' => 'Tidak ada shift yang aktif.'
            ], 404);
        }

        return response()->json(['data' => $shift]);
    }
}
