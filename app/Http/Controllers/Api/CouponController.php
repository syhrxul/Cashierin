<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * List semua kupon (otomatis filtered per toko oleh middleware).
     */
    public function index(Request $request)
    {
        $query = Coupon::query();

        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return response()->json(['data' => $query->latest()->get()]);
    }

    /**
     * Buat kupon baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'store_id'     => 'required|exists:stores,id',
            'code'         => 'required|string|unique:coupons,code|max:50',
            'name'         => 'required|string|max:255',
            'type'         => 'required|in:percentage,fixed',
            'value'        => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_uses'     => 'nullable|integer|min:1',
            'is_active'    => 'nullable|boolean',
            'starts_at'    => 'nullable|date',
            'expires_at'   => 'nullable|date|after_or_equal:starts_at',
        ]);

        // Validasi khusus untuk percentage
        if ($request->type === 'percentage' && $request->value > 100) {
            return response()->json(['message' => 'Nilai persentase tidak boleh melebihi 100.'], 422);
        }

        $coupon = Coupon::create($request->only([
            'store_id', 'code', 'name', 'type', 'value', 'min_purchase', 'max_uses', 'is_active', 'starts_at', 'expires_at'
        ]));

        return response()->json([
            'message' => 'Kupon berhasil dibuat.',
            'data'    => $coupon
        ], 201);
    }

    /**
     * Detail kupon.
     */
    public function show(Request $request, string $id)
    {
        $coupon = Coupon::findOrFail($id);

        // Cek kepemilikan toko
        if ($request->has('store_id') && (int) $coupon->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        return response()->json(['data' => $coupon]);
    }

    /**
     * Update kupon.
     */
    public function update(Request $request, string $id)
    {
        $coupon = Coupon::findOrFail($id);

        // Cek kepemilikan toko
        if ($request->has('store_id') && (int) $coupon->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        $request->validate([
            'code'         => 'sometimes|string|unique:coupons,code,' . $coupon->id . '|max:50',
            'name'         => 'sometimes|string|max:255',
            'type'         => 'sometimes|in:percentage,fixed',
            'value'        => 'sometimes|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_uses'     => 'nullable|integer|min:1',
            'is_active'    => 'nullable|boolean',
            'starts_at'    => 'nullable|date',
            'expires_at'   => 'nullable|date',
        ]);

        $coupon->update($request->except(['store_id']));

        return response()->json([
            'message' => 'Kupon berhasil diperbarui.',
            'data'    => $coupon
        ]);
    }

    /**
     * Hapus kupon.
     */
    public function destroy(Request $request, string $id)
    {
        $coupon = Coupon::findOrFail($id);

        // Cek kepemilikan toko
        if ($request->has('store_id') && (int) $coupon->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        $coupon->delete();
        return response()->json(['message' => 'Kupon berhasil dihapus.']);
    }

    /**
     * Validasi kupon sebelum checkout (preview diskonnya).
     */
    public function check(Request $request)
    {
        $request->validate([
            'code'        => 'required|string',
            'cart_total'  => 'required|numeric|min:0',
        ]);

        $query = Coupon::where('code', $request->code);

        // Filter per toko jika store_id ada
        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        $coupon = $query->first();

        if (!$coupon) {
            return response()->json(['message' => 'Kode kupon tidak ditemukan.'], 404);
        }

        if (!$coupon->isValid($request->cart_total)) {
            return response()->json([
                'message' => 'Kupon tidak valid atau sudah tidak bisa digunakan.',
                'data'    => $coupon
            ], 422);
        }

        $discountAmount = $coupon->calculateDiscount($request->cart_total);

        return response()->json([
            'message'         => 'Kupon valid.',
            'data'            => $coupon,
            'discount_amount' => $discountAmount,
            'final_total'     => max(0, $request->cart_total - $discountAmount)
        ]);
    }
}
