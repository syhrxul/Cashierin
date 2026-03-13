<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            // Tipe promosi:
            // bundle        = beli produk A+B+C dapat diskon
            // minimum_purchase = belanja >= X dapat diskon Y
            // buy_x_get_y   = beli produk X sejumlah N, gratis produk Y sejumlah M
            $table->enum('type', ['bundle', 'minimum_purchase', 'buy_x_get_y'])->default('bundle');
            $table->enum('discount_type', ['percentage', 'fixed', 'free_product'])->default('percentage');
            $table->decimal('discount_value', 15, 2)->default(0); // Nilai diskon (untuk percentage/fixed)
            $table->decimal('min_purchase', 15, 2)->nullable();   // Untuk tipe minimum_purchase
            $table->foreignId('free_product_id')->nullable()->constrained('products')->nullOnDelete(); // Untuk buy_x_get_y
            $table->integer('free_product_qty')->default(1);       // Jumlah produk gratis
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
