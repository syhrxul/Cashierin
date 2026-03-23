<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShiftTimeDefinition;
use Illuminate\Http\Request;

class ShiftTimeDefinitionController extends Controller
{
    public function index(Request $request)
    {
        $storeId = $request->get('selected_store_id') ?? $request->user()->store_id;
        $definitions = ShiftTimeDefinition::where('store_id', $storeId)->get();

        return response()->json([
            'status' => 'success',
            'data' => $definitions
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'start_time' => 'required',
            'end_time' => 'required',
            'requirements' => 'nullable|array',
        ]);

        $storeId = $request->get('selected_store_id') ?? $request->user()->store_id;

        $definition = ShiftTimeDefinition::create([
            'store_id' => $storeId,
            'name' => $request->name,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'requirements' => $request->requirements,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Template shift berhasil dibuat.',
            'data' => $definition
        ]);
    }

    public function update(Request $request, ShiftTimeDefinition $shiftTimeDefinition)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'start_time' => 'sometimes|required',
            'end_time' => 'sometimes|required',
            'requirements' => 'nullable|array',
        ]);

        $shiftTimeDefinition->update($request->only(['name', 'start_time', 'end_time', 'requirements']));

        return response()->json([
            'status' => 'success',
            'message' => 'Template shift berhasil diperbarui.',
            'data' => $shiftTimeDefinition
        ]);
    }

    public function destroy(ShiftTimeDefinition $shiftTimeDefinition)
    {
        $shiftTimeDefinition->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Template shift berhasil dihapus.'
        ]);
    }
}
