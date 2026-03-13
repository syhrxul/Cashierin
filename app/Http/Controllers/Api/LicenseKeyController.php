<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LicenseKeyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\LicenseKey::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_used')) {
            $query->where('is_used', filter_var($request->is_used, FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json([
            'data' => $query->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:trial,full',
            'duration_days' => 'required|integer|min:1',
            'count' => 'nullable|integer|min:1|max:100', // How many to generate at once
        ]);

        $count = $request->input('count', 1);
        $keys = [];

        for ($i = 0; $i < $count; $i++) {
            $keys[] = \App\Models\LicenseKey::create([
                'key' => strtoupper(\Illuminate\Support\Str::random(16)), // Generate a 16-char string e.g., ABCD1234EFGH5678
                'type' => $request->type,
                'duration_days' => $request->duration_days,
            ]);
        }

        return response()->json([
            'message' => "$count License key(s) generated successfully",
            'data' => $count === 1 ? $keys[0] : $keys
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $key = \App\Models\LicenseKey::findOrFail($id);

        return response()->json([
            'data' => $key
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $key = \App\Models\LicenseKey::findOrFail($id);

        $request->validate([
            'type' => 'sometimes|in:trial,full',
            'duration_days' => 'sometimes|integer|min:1',
        ]);

        $key->update($request->only(['type', 'duration_days']));

        return response()->json([
            'message' => 'License key updated successfully',
            'data' => $key
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $key = \App\Models\LicenseKey::findOrFail($id);
        $key->delete();

        return response()->json([
            'message' => 'License key deleted successfully'
        ]);
    }

    /**
     * Activate a license key for the authenticated user.
     */
    public function activate(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
        ]);

        $key = \App\Models\LicenseKey::where('key', $request->key)->first();

        if (!$key) {
            return response()->json([
                'message' => 'License key tidak valid.'
            ], 404);
        }

        if ($key->is_used) {
            return response()->json([
                'message' => 'License key sudah digunakan.'
            ], 400);
        }

        $user = $request->user();

        // Update the key
        $key->update([
            'is_used' => true,
            'used_by' => $user->id,
            'used_at' => now(),
            'expires_at' => now()->addDays($key->duration_days),
        ]);

        return response()->json([
            'message' => 'License key berhasil diaktivasi.',
            'data' => $key
        ]);
    }
}
