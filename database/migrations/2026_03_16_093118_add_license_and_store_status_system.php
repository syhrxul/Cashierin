<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tambah status lisensi ke stores
        Schema::table('stores', function (Blueprint $table) {
            // Status toko: inactive (belum aktivasi), active, grace_period, frozen
            $table->enum('status', ['inactive', 'active', 'grace_period', 'frozen'])
                ->default('inactive')
                ->after('invite_code');
            $table->enum('license_type', ['none', 'trial', 'full'])
                ->default('none')
                ->after('status');
            $table->timestamp('license_expires_at')->nullable()->after('license_type');
            $table->timestamp('grace_period_ends_at')->nullable()->after('license_expires_at');
        });

        // Tambah store_id ke license_keys agar terikat ke toko
        Schema::table('license_keys', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('expires_at')
                ->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn(['status', 'license_type', 'license_expires_at', 'grace_period_ends_at']);
        });

        Schema::table('license_keys', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });
    }
};
