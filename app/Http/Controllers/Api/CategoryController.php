<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource with Caching.
     */
    public function index(Request $request)
    {
        $storeId = $request->store_id;
        $cacheKey = "store_{$storeId}_categories";

        $categories = Cache::remember($cacheKey, 3600, function () use ($storeId) {
            $query = Category::withCount('products');
            if ($storeId) {
                $query->where('store_id', $storeId);
            }
            return $query->get();
        });

        return response()->json([
            'data' => $categories
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $request->validate([
            'store_id' => 'required|exists:stores,id',
            'name' => 'required|string|max:255',
        ]);

        $category = Category::create($request->only(['store_id', 'name']));

        // Clear Cache
        Cache::forget("store_{$request->store_id}_categories");

        return response()->json([
            'message' => 'Category created successfully',
            'data' => $category
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        if ($request->has('store_id') && (int) $category->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        return response()->json([
            'data' => $category
        ]);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        if ($request->has('store_id') && (int) $category->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
        ]);

        $category->update($request->only(['name']));

        // Clear Cache
        Cache::forget("store_{$category->store_id}_categories");

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => $category
        ]);
    }

    /**
     * Remove the specified resource.
     */
    public function destroy(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        if ($request->has('store_id') && (int) $category->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        $storeId = $category->store_id;
        $category->delete();

        // Clear Cache
        Cache::forget("store_{$storeId}_categories");

        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}
