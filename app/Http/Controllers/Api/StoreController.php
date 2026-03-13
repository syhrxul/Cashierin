<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Store::query();

        // Optional filtering by owner (user_id)
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
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
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'business_hours' => 'nullable|string',
            'business_category' => 'nullable|string',
        ]);

        $store = Store::create($request->all());

        return response()->json([
            'message' => 'Store created successfully',
            'data' => $store
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $store = Store::findOrFail($id);

        return response()->json([
            'data' => $store
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $store = Store::findOrFail($id);

        $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'name' => 'sometimes|string|max:255',
            'address' => 'nullable|string',
            'business_hours' => 'nullable|string',
            'business_category' => 'nullable|string',
        ]);

        $store->update($request->all());

        return response()->json([
            'message' => 'Store updated successfully',
            'data' => $store
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $store = Store::findOrFail($id);
        $store->delete();

        return response()->json([
            'message' => 'Store deleted successfully'
        ]);
    }
}
