<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Http\Resources\ProductResource;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource with Caching.
     */
    public function index(Request $request)
    {
        $storeId = $request->store_id;
        $categoryId = $request->category_id;
        $search = $request->search;

        // Generate cache key based on params
        $cacheKey = "store_{$storeId}_products_cat_{$categoryId}_search_" . md5($search ?? '');

        $products = Cache::remember($cacheKey, 1800, function () use ($storeId, $categoryId, $search) {
            $query = Product::with('category');

            if ($storeId) {
                $query->where('store_id', $storeId);
            }

            if ($categoryId) {
                $query->where('category_id', $categoryId);
            }

            if ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            }

            return $query->get();
        });

        return response()->json([
            'data' => ProductResource::collection($products)
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $request->validate([
            'store_id' => 'required|exists:stores,id',
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku',
            'is_active' => 'nullable|boolean',
        ]);

        $store = \App\Models\Store::findOrFail($request->store_id);
        
        // Cek batasan Trial (Maks 10 Produk)
        if (!$store->canAddProduct()) {
            return response()->json([
                'message' => 'Batas maksimal (10 produk) untuk masa Percobaan (Trial) telah tercapai. Silakan perbarui lisensi Anda menjadi Full untuk membuka akses tanpa batas.'
            ], 403);
        }

        $product = Product::create($request->only([
            'store_id', 'category_id', 'name', 'description', 'price', 'stock', 'sku', 'is_active'
        ]));

        // Clear related caches - Since we don't use tags, we use a versioning 
        // or just accept that list might be slightly stale if we have complex keys.
        // For simplicity, we can't easily clear all "search" caches in DB driver.
        // But we can clear the common ones.
        $this->clearProductCache($product->store_id);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => new ProductResource($product->load('category'))
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $product = Product::with('category')->findOrFail($id);

        if ($request->has('store_id') && (int) $product->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        return response()->json([
            'data' => new ProductResource($product)
        ]);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        if ($request->has('store_id') && (int) $product->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku,' . $product->id,
            'is_active' => 'nullable|boolean',
        ]);

        $product->update($request->except(['store_id']));
        
        $this->clearProductCache($product->store_id);

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => new ProductResource($product->load('category'))
        ]);
    }

    /**
     * Remove the specified resource.
     */
    public function destroy(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        if ($request->has('store_id') && (int) $product->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        $storeId = $product->store_id;
        $product->delete();

        $this->clearProductCache($storeId);

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Helper to clear product cache (Simplified).
     */
    protected function clearProductCache($storeId)
    {
        // Ideally use Cache Tags if using Redis.
        // With DB driver, we might need a cache version in the store to invalidate.
        // For now, let's just clear the main indices.
        Cache::forget("store_{$storeId}_products_cat__search_" . md5(''));
    }
}
