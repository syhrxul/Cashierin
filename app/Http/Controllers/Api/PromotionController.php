<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    /**
     * List semua promosi.
     */
    public function index(Request $request)
    {
        $query = Promotion::with('items.product', 'freeProduct');

        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return response()->json(['data' => $query->latest()->get()]);
    }

    /**
     * Buat promosi baru beserta item produk yang terlibat.
     */
    public function store(Request $request)
    {
        $request->validate([
            'store_id'         => 'required|exists:stores,id',
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'type'             => 'required|in:bundle,minimum_purchase,buy_x_get_y',
            'discount_type'    => 'required|in:percentage,fixed,free_product',
            'discount_value'   => 'nullable|numeric|min:0',
            'min_purchase'     => 'nullable|numeric|min:0',
            'free_product_id'  => 'nullable|exists:products,id',
            'free_product_qty' => 'nullable|integer|min:1',
            'is_active'        => 'nullable|boolean',
            'starts_at'        => 'nullable|date',
            'expires_at'       => 'nullable|date|after_or_equal:starts_at',
            // Daftar produk yang menjadi syarat promosi
            'items'            => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity'   => 'required_with:items|integer|min:1',
        ]);

        $promotion = Promotion::create($request->only([
            'store_id', 'name', 'description', 'type', 'discount_type',
            'discount_value', 'min_purchase', 'free_product_id',
            'free_product_qty', 'is_active', 'starts_at', 'expires_at',
        ]));

        if ($request->has('items')) {
            foreach ($request->items as $item) {
                $promotion->items()->create($item);
            }
        }

        return response()->json([
            'message' => 'Promosi berhasil dibuat.',
            'data'    => $promotion->load('items.product', 'freeProduct')
        ], 201);
    }

    /**
     * Detail promosi.
     */
    public function show(string $id)
    {
        $promotion = Promotion::with('items.product', 'freeProduct')->findOrFail($id);
        return response()->json(['data' => $promotion]);
    }

    /**
     * Update promosi.
     */
    public function update(Request $request, string $id)
    {
        $promotion = Promotion::findOrFail($id);

        $request->validate([
            'name'             => 'sometimes|string|max:255',
            'description'      => 'nullable|string',
            'type'             => 'sometimes|in:bundle,minimum_purchase,buy_x_get_y',
            'discount_type'    => 'sometimes|in:percentage,fixed,free_product',
            'discount_value'   => 'nullable|numeric|min:0',
            'min_purchase'     => 'nullable|numeric|min:0',
            'free_product_id'  => 'nullable|exists:products,id',
            'free_product_qty' => 'nullable|integer|min:1',
            'is_active'        => 'nullable|boolean',
            'starts_at'        => 'nullable|date',
            'expires_at'       => 'nullable|date',
            // Jika items dikirim, replace semua
            'items'              => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity'   => 'required_with:items|integer|min:1',
        ]);

        $promotion->update($request->except('items'));

        // Jika items dikirim, replace semua item promosi
        if ($request->has('items')) {
            $promotion->items()->delete();
            foreach ($request->items as $item) {
                $promotion->items()->create($item);
            }
        }

        return response()->json([
            'message' => 'Promosi berhasil diperbarui.',
            'data'    => $promotion->load('items.product', 'freeProduct')
        ]);
    }

    /**
     * Hapus promosi.
     */
    public function destroy(string $id)
    {
        Promotion::findOrFail($id)->delete();
        return response()->json(['message' => 'Promosi berhasil dihapus.']);
    }
}
