<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tambah kolom approval di tabel users
        Schema::table('users', function (Blueprint $table) {
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                ->default('approved') // existing users otomatis approved
                ->after('role');
            $table->foreignId('approved_by')->nullable()->after('approval_status');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
        });

        // Tambah invite_code di tabel stores
        Schema::table('stores', function (Blueprint $table) {
            $table->string('invite_code', 32)->unique()->nullable()->after('business_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['approval_status', 'approved_by', 'approved_at']);
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn('invite_code');
        });
    }
};
