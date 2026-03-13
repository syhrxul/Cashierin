<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shift;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    /**
     * Display a listing of transactions.
     */
    public function index(Request $request)
    {
        $query = Transaction::with(['user', 'items.product']);

        if ($request->has('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        return response()->json([
            'data' => $query->latest()->paginate(10)
        ]);
    }

    /**
     * Store a newly created transaction (Checkout).
     */
    public function store(Request $request)
    {
        $request->validate([
            'store_id' => 'required|exists:stores,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'discount_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash,debit,credit,qris',
        ]);

        // Verifikasi shift aktif
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
                $subtotal = 0;
                $transactionItems = [];

                foreach ($request->items as $itemData) {
                    $product = Product::lockForUpdate()->find($itemData['product_id']);

                    // Cek stok
                    if ($product->stock !== null && $product->stock < $itemData['quantity']) {
                        throw new \Exception("Stok produk '{$product->name}' tidak mencukupi. Sisa: {$product->stock}");
                    }

                    $itemSubtotal = $product->price * $itemData['quantity'];
                    $subtotal += $itemSubtotal;

                    $transactionItems[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'price' => $product->price,
                        'quantity' => $itemData['quantity'],
                        'subtotal' => $itemSubtotal,
                    ];

                    // Kurangi stok jika dikelola
                    if ($product->stock !== null) {
                        $product->decrement('stock', $itemData['quantity']);
                    }
                }

                $discount = $request->discount_amount ?? 0;
                $totalAmount = max(0, $subtotal - $discount);

                // Generate Nomor Struk: INV-YYYYMMDD-RANDOM
                $receiptNumber = 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6));

                $transaction = Transaction::create([
                    'store_id' => $request->store_id,
                    'user_id' => $request->user()->id,
                    'shift_id' => $activeShift->id,
                    'receipt_number' => $receiptNumber,
                    'subtotal' => $subtotal,
                    'discount_amount' => $discount,
                    'total_amount' => $totalAmount,
                    'payment_method' => $request->payment_method,
                    'status' => 'completed',
                ]);

                foreach ($transactionItems as $item) {
                    $transaction->items()->create($item);
                }

                return response()->json([
                    'message' => 'Transaksi berhasil.',
                    'data' => $transaction->load('items')
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memproses transaksi: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Display the specified transaction.
     */
    public function show(string $id)
    {
        $transaction = Transaction::with(['user', 'items.product', 'store', 'shift'])->findOrFail($id);
        return response()->json(['data' => $transaction]);
    }

    /**
     * Cancel a transaction.
     */
    public function destroy(string $id)
    {
        $transaction = Transaction::findOrFail($id);

        if ($transaction->status === 'cancelled') {
            return response()->json(['message' => 'Transaksi sudah dibatalkan.'], 400);
        }

        try {
            DB::transaction(function () use ($transaction) {
                // Kembalikan stok
                foreach ($transaction->items as $item) {
                    if ($item->product_id) {
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
