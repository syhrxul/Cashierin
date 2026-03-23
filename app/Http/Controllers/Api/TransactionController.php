<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Shift;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{

    public function index(Request $request)
    {
        $query = Transaction::with(['user', 'items.product', 'store']);

        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        return response()->json(['data' => $query->latest()->paginate(10)]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'store_id'       => 'required|exists:stores,id',
            'items'          => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'coupon_code'    => 'nullable|string',
            'payment_method' => 'required|in:cash,debit,credit,qris',
        ]);

        // Cek shift aktif
        $activeShift = Shift::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (!$activeShift) {
            return response()->json([
                'message' => 'Anda harus membuka shift terlebih dahulu sebelum melakukan transaksi.'
            ], 403);
        }

        try {
            return DB::transaction(function () use ($request, $activeShift) {
                $subtotal        = 0;
                $productDiscount = 0;
                $transactionItems = [];
                $cartProductMap   = []; 

                foreach ($request->items as $itemData) {
                    $product = Product::lockForUpdate()->findOrFail($itemData['product_id']);

                    // Pastikan produk milik toko yang sama
                    if ((int) $product->store_id !== (int) $request->store_id) {
                        throw new \Exception("Produk '{$product->name}' bukan milik toko ini.");
                    }

                    if ($product->stock !== null && $product->stock < $itemData['quantity']) {
                        throw new \Exception("Stok produk '{$product->name}' tidak mencukupi. Sisa: {$product->stock}");
                    }

                    $originalPrice = $product->price;

                    // === Diskon Per Produk ===
                    $itemDiscountedPrice = $originalPrice;
                    if ($product->discount_type !== 'none' && $product->discount_value > 0) {
                        $isDiscountActive = true;
                        if ($product->discount_starts_at && now()->lt($product->discount_starts_at)) $isDiscountActive = false;
                        if ($product->discount_ends_at && now()->gt($product->discount_ends_at)) $isDiscountActive = false;

                        if ($isDiscountActive) {
                            if ($product->discount_type === 'percentage') {
                                $itemDiscountedPrice = $originalPrice - ($originalPrice * $product->discount_value / 100);
                            } else {
                                $itemDiscountedPrice = max(0, $originalPrice - $product->discount_value);
                            }
                        }
                    }

                    $lineDiscount = ($originalPrice - $itemDiscountedPrice) * $itemData['quantity'];
                    $productDiscount += $lineDiscount;

                    $itemSubtotal = $itemDiscountedPrice * $itemData['quantity'];
                    $subtotal     += $originalPrice * $itemData['quantity']; // subtotal sebelum diskon

                    $transactionItems[] = [
                        'product_id'   => $product->id,
                        'product_name' => $product->name,
                        'price'        => $itemDiscountedPrice,
                        'quantity'     => $itemData['quantity'],
                        'subtotal'     => $itemSubtotal,
                    ];

                    $cartProductMap[$product->id] = ($cartProductMap[$product->id] ?? 0) + $itemData['quantity'];

                    if ($product->stock !== null) {
                        $product->decrement('stock', $itemData['quantity']);
                    }
                }

                $afterProductDiscount = $subtotal - $productDiscount;

                // ========================
                // STEP 2: Terapkan Promosi
                // ========================
                $promotionDiscount  = 0;
                $freeItems          = []; // produk gratis dari buy_x_get_y
                $appliedPromotions  = [];

                $promotions = Promotion::with('items')
                    ->where('store_id', $request->store_id)
                    ->where('is_active', true)
                    ->get();

                foreach ($promotions as $promo) {
                    if (!$promo->isActive()) continue;

                    $applies = false;

                    if ($promo->type === 'minimum_purchase') {
                        $applies = $afterProductDiscount >= $promo->min_purchase;
                    } elseif ($promo->type === 'bundle' || $promo->type === 'buy_x_get_y') {
                        // Cek apakah semua item yang disyaratkan ada di cart
                        $applies = true;
                        foreach ($promo->items as $promoItem) {
                            $cartQty = $cartProductMap[$promoItem->product_id] ?? 0;
                            if ($cartQty < $promoItem->quantity) {
                                $applies = false;
                                break;
                            }
                        }
                    }

                    if ($applies) {
                        $appliedPromotions[] = $promo->name;
                        if ($promo->discount_type === 'percentage') {
                            $promotionDiscount += $afterProductDiscount * ($promo->discount_value / 100);
                        } elseif ($promo->discount_type === 'fixed') {
                            $promotionDiscount += $promo->discount_value;
                        } elseif ($promo->discount_type === 'free_product' && $promo->free_product_id) {
                            $freeProduct = Product::find($promo->free_product_id);
                            if ($freeProduct) {
                                $freeItems[] = [
                                    'product_id'   => $freeProduct->id,
                                    'product_name' => $freeProduct->name . ' (GRATIS - ' . $promo->name . ')',
                                    'price'        => 0,
                                    'quantity'     => $promo->free_product_qty,
                                    'subtotal'     => 0,
                                ];
                                // Kurangi stok produk gratis
                                if ($freeProduct->stock !== null) {
                                    $freeProduct->decrement('stock', $promo->free_product_qty);
                                }
                            }
                        }
                    }
                }

                // ========================
                // STEP 3: Terapkan Kupon
                // ========================
                $couponDiscount = 0;
                $coupon = null;

                if ($request->coupon_code) {
                    $coupon = Coupon::where('code', $request->coupon_code)
                        ->where('store_id', $request->store_id)
                        ->first();

                    if (!$coupon) {
                        throw new \Exception("Kode kupon '{$request->coupon_code}' tidak ditemukan.");
                    }

                    if (!$coupon->isValid($afterProductDiscount - $promotionDiscount)) {
                        throw new \Exception("Kupon tidak valid: mungkin sudah kedaluwarsa, sudah mencapai batas penggunaan, atau total belanja kurang dari minimum.");
                    }

                    $couponDiscount = $coupon->calculateDiscount($afterProductDiscount - $promotionDiscount);
                    $coupon->increment('used_count');
                }

                $totalDiscount = $productDiscount + $promotionDiscount + $couponDiscount;
                $afterDiscount = max(0, $subtotal - $totalDiscount);
                $taxAmount     = $afterDiscount * 0.11;
                $totalAmount   = $afterDiscount + $taxAmount;

                $receiptNumber = 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6));

                $transaction = Transaction::create([
                    'store_id'        => $request->store_id,
                    'user_id'         => $request->user()->id,
                    'shift_id'        => $activeShift->id,
                    'receipt_number'  => $receiptNumber,
                    'subtotal'        => $subtotal,
                    'discount_amount' => $totalDiscount,
                    'total_amount'    => $totalAmount,
                    'payment_method'  => $request->payment_method,
                    'status'          => 'completed',
                ]);

                // Simpan item produk + produk gratis
                foreach (array_merge($transactionItems, $freeItems) as $item) {
                    $transaction->items()->create($item);
                }

                return response()->json([
                    'message'            => 'Transaksi berhasil.',
                    'applied_promotions' => $appliedPromotions,
                    'discount_breakdown' => [
                        'product_discount'   => $productDiscount,
                        'promotion_discount' => $promotionDiscount,
                        'coupon_discount'    => $couponDiscount,
                        'total_discount'     => $totalDiscount,
                    ],
                    'data' => $transaction->load(['items', 'store', 'user'])
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memproses transaksi: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Detail transaksi.
     */
    public function show(Request $request, string $id)
    {
        $transaction = Transaction::with(['user', 'items.product', 'store', 'shift'])->findOrFail($id);

        // Cek kepemilikan toko
        if ($request->has('store_id') && (int) $transaction->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        return response()->json(['data' => $transaction]);
    }

    /**
     * Batalkan transaksi dan kembalikan stok.
     */
    public function destroy(Request $request, string $id)
    {
        $transaction = Transaction::with('items')->findOrFail($id);

        // Cek kepemilikan toko
        if ($request->has('store_id') && (int) $transaction->store_id !== (int) $request->store_id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data ini.'], 403);
        }

        if ($transaction->status === 'cancelled') {
            return response()->json(['message' => 'Transaksi sudah dibatalkan.'], 400);
        }

        try {
            DB::transaction(function () use ($transaction) {
                foreach ($transaction->items as $item) {
                    if ($item->product_id && $item->price > 0) { // Skip produk gratis
                        $product = Product::find($item->product_id);
                        if ($product && $product->stock !== null) {
                            $product->increment('stock', $item->quantity);
                        }
                    }
                }
                $transaction->update(['status' => 'cancelled']);
            });

            return response()->json(['message' => 'Transaksi berhasil dibatalkan dan stok dikembalikan.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal membatalkan transaksi.'], 500);
        }
    }
}
